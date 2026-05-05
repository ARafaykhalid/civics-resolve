"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Complaint from "@/models/Complaint";
import Authority from "@/models/Authority";
import Vote from "@/models/Vote";
import User from "@/models/User";
import Comment from "@/models/Comment";
import {
  complaintSchema,
  statusUpdateSchema,
  assignSchema,
} from "@/lib/validations";
import {
  sendComplaintSubmittedEmail,
  sendAssignmentEmail,
  sendStatusUpdateEmail,
} from "@/lib/email";
import type { ComplaintFilters } from "@/types";

/** Create a new complaint */
export async function createComplaint(data: {
  title: string;
  description: string;
  category: string;
  location: { address: string; lat?: number; lng?: number };
  images: string[];
  isAnonymous: boolean;
}) {
  try {
    const validated = complaintSchema.parse(data);
    await connectDB();

    const session = await auth();
    const userId = session?.user?.id;

    const complaint = await Complaint.create({
      ...validated,
      createdBy: userId || undefined,
      status: "Pending",
      priority: "Medium",
      upvotes: 0,
      upvotedBy: [],
      timeline: [
        {
          status: "Pending",
          comment: "Complaint submitted successfully",
          updatedBy: userId
            ? new mongoose.Types.ObjectId(userId)
            : new mongoose.Types.ObjectId("000000000000000000000000"),
          updatedByName: session?.user?.name || "Anonymous",
          createdAt: new Date(),
        },
      ],
    });

    // Auto-assign based on category (smart routing)
    const matchingAuthority = await Authority.findOne({
      categories: validated.category,
    });
    if (matchingAuthority) {
      complaint.assignedTo = matchingAuthority.userId;
      complaint.timeline.push({
        status: "Pending",
        comment: `Auto-assigned to ${matchingAuthority.name}`,
        updatedBy: new mongoose.Types.ObjectId("000000000000000000000000"),
        updatedByName: "System",
        createdAt: new Date(),
      });
      await complaint.save();

      try {
        await sendAssignmentEmail(
          matchingAuthority.email,
          matchingAuthority.name,
          validated.title,
          complaint._id.toString(),
          validated.category,
        );
      } catch (e) {
        console.error("Failed to send assignment email:", e);
      }
    }

    // Send confirmation email
    if (session?.user?.email && !validated.isAnonymous) {
      try {
        await sendComplaintSubmittedEmail(
          session.user.email,
          validated.title,
          complaint._id.toString(),
        );
      } catch (e) {
        console.error("Failed to send confirmation email:", e);
      }
    }

    revalidatePath("/complaints");
    revalidatePath("/");

    return {
      success: true,
      data: { id: complaint._id.toString() },
      message: "Complaint submitted successfully",
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, error: (error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed") };
    }
    console.error("Create complaint error:", error);
    return { success: false, error: "Failed to submit complaint" };
  }
}

/** Fetch complaints with filtering and pagination */
export async function getComplaints(filters: ComplaintFilters = {}) {
  try {
    await connectDB();
    const {
      status,
      category,
      priority,
      search,
      sort = "latest",
      page = 1,
      limit = 12,
      assignedTo,
    } = filters;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (search) query.$text = { $search: search };

    const session = await auth();
    const userId = session?.user?.id;
    const userRole = (session?.user as any)?.role || "guest";

    if (!["admin", "ngo", "authority"].includes(userRole)) {
      if (!userId) {
        // Guest user: cannot see Pending
        if (query.status === "Pending") {
          return { success: true, data: { data: [], total: 0, page, limit, totalPages: 0 } };
        } else if (!query.status) {
          query.status = { $ne: "Pending" };
        }
      } else {
        // Regular logged-in user: can see non-Pending OR their own Pending
        const pendingCondition = { createdBy: new mongoose.Types.ObjectId(userId) };
        const notPendingCondition = { status: { $ne: "Pending" } };

        if (query.status === "Pending") {
          query.createdBy = new mongoose.Types.ObjectId(userId);
        } else if (!query.status) {
          query.$or = [notPendingCondition, pendingCondition];
        }
      }
    }

    // Status priority: Pending=0, Verified=1, In Progress=2, Resolved=3
    // Default sort: by status order, then newest first within each status
    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    else if (sort === "most-upvoted") sortQuery = { upvotes: -1 };

    const skip = (page - 1) * limit;

    const [complaints, total] = await Promise.all([
      Complaint.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email organization")
        .lean(),
      Complaint.countDocuments(query),
    ]);

    // Sort by status order: Pending → Verified → In Progress → Resolved
    const statusOrder: Record<string, number> = {
      Pending: 0,
      Verified: 1,
      "In Progress": 2,
      Resolved: 3,
    };
    if (sort === "latest" || !sort) {
      complaints.sort((a: any, b: any) => {
        const sa = statusOrder[a.status] ?? 99;
        const sb = statusOrder[b.status] ?? 99;
        if (sa !== sb) return sa - sb;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = complaints.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
      issueId: c.issueId,
      createdBy: c.createdBy
        ? {
            _id: c.createdBy._id?.toString(),
            name: c.createdBy.name,
            email: c.createdBy.email,
          }
        : null,
      assignedTo: c.assignedTo
        ? {
            _id: c.assignedTo._id?.toString(),
            name: c.assignedTo.name,
            organization: c.assignedTo.organization,
          }
        : null,
      upvotedBy:
        c.upvotedBy?.map((id: mongoose.Types.ObjectId) => id.toString()) || [],
       
      timeline:
        c.timeline?.map((t: any) => ({
          ...t,
          _id: t._id?.toString(),
          updatedBy: t.updatedBy?.toString(),
          createdAt: t.createdAt?.toISOString?.() || t.createdAt,
        })) || [],
      feedback: c.feedback
        ? {
            ...c.feedback,
            createdAt: c.feedback.createdAt?.toISOString?.() || c.feedback.createdAt,
          }
        : null,
      createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
    }));

    return {
      success: true,
      data: {
        data: serialized,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get complaints error:", error);
    return { success: false, error: "Failed to fetch complaints" };
  }
}

/** Get a single complaint by ID or issueId */
export async function getComplaintById(id: string) {
  try {
    await connectDB();
    // Try numeric issueId first, then ObjectId
    const isNumeric = /^\d+$/.test(id);
    let complaint;
    if (isNumeric) {
      complaint = await Complaint.findOne({ issueId: parseInt(id) })
        .populate("createdBy", "name email")
        .populate("assignedTo", "name email organization role")
        .lean();
    }
    if (!complaint) {
      try {
        complaint = await Complaint.findById(id)
          .populate("createdBy", "name email")
          .populate("assignedTo", "name email organization role")
          .lean();
      } catch { /* invalid ObjectId */ }
    }
    if (!complaint) return { success: false, error: "Complaint not found" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = complaint as any;
    const serialized = {
      ...c,
      _id: c._id.toString(),
      issueId: c.issueId,
      createdBy: c.createdBy
        ? {
            _id: c.createdBy._id?.toString(),
            name: c.createdBy.name,
            email: c.createdBy.email,
          }
        : null,
      assignedTo: c.assignedTo
        ? {
            _id: c.assignedTo._id?.toString(),
            name: c.assignedTo.name,
            email: c.assignedTo.email,
            organization: c.assignedTo.organization,
          }
        : null,
      upvotedBy:
        c.upvotedBy?.map((id: mongoose.Types.ObjectId) => id.toString()) || [],
       
      timeline:
        c.timeline?.map((t: any) => ({
          ...t,
          _id: t._id?.toString(),
          updatedBy: t.updatedBy?.toString(),
          createdAt: t.createdAt?.toISOString?.() || t.createdAt,
        })) || [],
      feedback: c.feedback
        ? {
            ...c.feedback,
            createdAt: c.feedback.createdAt?.toISOString?.() || c.feedback.createdAt,
          }
        : null,
      createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      updatedAt: c.updatedAt?.toISOString?.() || c.updatedAt,
    };
    return { success: true, data: serialized };
  } catch (error) {
    console.error("Get complaint error:", error);
    return { success: false, error: "Failed to fetch complaint" };
  }
}
/** Toggle upvote a complaint */
export async function toggleUpvoteComplaint(complaintId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user)
      return { success: false, error: "Authentication required to upvote" };

    const userId = session.user.id;
    const existingVote = await Vote.findOne({ complaintId, userId });

    if (existingVote) {
      await Vote.deleteOne({ _id: existingVote._id });
      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        { $inc: { upvotes: -1 }, $pull: { upvotedBy: userId } },
        { new: true },
      );
      if (!complaint) return { success: false, error: "Complaint not found" };

      revalidatePath(`/complaints/${complaintId}`);
      revalidatePath("/complaints");
      return {
        success: true,
        data: { upvotes: complaint.upvotes, hasVoted: false },
      };
    } else {
      await Vote.create({ complaintId, userId, visitorId: userId });
      const complaint = await Complaint.findByIdAndUpdate(
        complaintId,
        { $inc: { upvotes: 1 }, $push: { upvotedBy: userId } },
        { new: true },
      );
      if (!complaint) return { success: false, error: "Complaint not found" };

      revalidatePath(`/complaints/${complaintId}`);
      revalidatePath("/complaints");
      return {
        success: true,
        data: { upvotes: complaint.upvotes, hasVoted: true },
      };
    }
  } catch (error) {
    console.error("Toggle upvote error:", error);
    return { success: false, error: "Failed to toggle upvote" };
  }
}

/** Update complaint status */
export async function updateComplaintStatus(data: {
  complaintId: string;
  status: string;
  comment: string;
  images?: string[];
}) {
  try {
    const validated = statusUpdateSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const userRole = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(userRole))
      return { success: false, error: "Insufficient permissions" };

    const complaint = await Complaint.findById(validated.complaintId);
    if (!complaint) return { success: false, error: "Complaint not found" };

    complaint.status = validated.status as
      | "Pending"
      | "Verified"
      | "In Progress"
      | "Resolved";
    complaint.timeline.push({
      status: validated.status,
      comment: validated.comment,
      updatedBy: new mongoose.Types.ObjectId(session.user.id),
      updatedByName: session.user.name || "Unknown",
      images: validated.images || [],
      createdAt: new Date(),
    });
    await complaint.save();

    if (complaint.createdBy) {
      const creator = await User.findById(complaint.createdBy);
      if (creator?.email) {
        try {
          await sendStatusUpdateEmail(
            creator.email,
            complaint.title,
            complaint._id.toString(),
            validated.status,
          );
        } catch (e) {
          console.error("Status email failed:", e);
        }
      }
    }

    revalidatePath(`/complaints/${validated.complaintId}`);
    revalidatePath("/complaints");
    revalidatePath("/dashboard");
    return { success: true, message: "Status updated" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, error: (error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed") };
    }
    console.error("Status update error:", error);
    return { success: false, error: "Failed to update status" };
  }
}

/** Assign complaint to authority (admin only) */
export async function assignComplaint(data: {
  complaintId: string;
  authorityId: string;
  priority?: string;
}) {
  try {
    const validated = assignSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    const authority = await Authority.findById(validated.authorityId);
    if (!authority) return { success: false, error: "Authority not found" };
    const complaint = await Complaint.findById(validated.complaintId);
    if (!complaint) return { success: false, error: "Complaint not found" };

    complaint.assignedTo = authority.userId;
    complaint.priority = (validated.priority || "Medium") as
      | "Low"
      | "Medium"
      | "High";
    complaint.timeline.push({
      status: complaint.status,
      comment: `Assigned to ${authority.name}`,
      updatedBy: new mongoose.Types.ObjectId(session.user.id),
      updatedByName: session.user.name || "Admin",
      createdAt: new Date(),
    });
    await complaint.save();

    try {
      await sendAssignmentEmail(
        authority.email,
        authority.name,
        complaint.title,
        complaint._id.toString(),
        complaint.category,
      );
    } catch (e) {
      console.error("Assignment email failed:", e);
    }

    revalidatePath(`/complaints/${validated.complaintId}`);
    revalidatePath("/dashboard");
    return { success: true, message: "Assigned" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, error: (error.issues?.[0]?.message || error.errors?.[0]?.message || "Validation failed") };
    }
    console.error("Assignment error:", error);
    return { success: false, error: "Failed to assign" };
  }
}

/** Delete complaint (admin only) */
export async function deleteComplaint(complaintId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };
    await Complaint.findByIdAndDelete(complaintId);
    await Vote.deleteMany({ complaintId });
    revalidatePath("/complaints");
    revalidatePath("/dashboard");
    return { success: true, message: "Deleted" };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error: "Failed to delete" };
  }
}

/** Edit complaint details (creator or admin) */
export async function editComplaint(data: {
  complaintId: string;
  title?: string;
  description?: string;
  category?: string;
  location?: { address: string; lat?: number; lng?: number };
  images?: string[];
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user)
      return { success: false, error: "Authentication required" };

    const complaint = await Complaint.findById(data.complaintId);
    if (!complaint) return { success: false, error: "Complaint not found" };

    const userRole = (session.user as { role: string }).role;
    const isAdmin = userRole === "admin";
    const isCreator = complaint.createdBy?.toString() === session.user.id;

    if (!isAdmin && !isCreator) {
      return { success: false, error: "You can only edit your own complaints" };
    }

    // Only allow edits on Pending/Verified complaints (unless admin)
    if (!isAdmin && !["Pending", "Verified"].includes(complaint.status)) {
      return {
        success: false,
        error: "Cannot edit a complaint that is already In Progress or Resolved",
      };
    }

    // Apply updates
    if (data.title) complaint.title = data.title;
    if (data.description) complaint.description = data.description;
    if (data.category) {
      complaint.category = data.category as any;
    }
    if (data.location) complaint.location = data.location as any;
    if (data.images !== undefined) complaint.images = data.images;

    await complaint.save();

    revalidatePath(`/complaints/${data.complaintId}`);
    revalidatePath("/complaints");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/my-complaints");
    return { success: true, message: "Complaint updated successfully" };
  } catch (error) {
    console.error("Edit complaint error:", error);
    return { success: false, error: "Failed to edit complaint" };
  }
}

/** Dashboard analytics */
export async function getDashboardAnalytics() {
  try {
    await connectDB();
    const [
      total,
      pending,
      verified,
      inProgress,
      resolved,
      categoryStats,
      recentComplaints,
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Verified" }),
      Complaint.countDocuments({ status: "In Progress" }),
      Complaint.countDocuments({ status: "Resolved" }),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Complaint.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select("title status category createdAt")
        .lean(),
    ]);

    return {
      success: true,
      data: {
        totalComplaints: total,
        pendingComplaints: pending,
        verifiedComplaints: verified,
        inProgressComplaints: inProgress,
        resolvedComplaints: resolved,
        categoryStats: categoryStats.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recentComplaints: recentComplaints.map((c: any) => ({
          _id: c._id.toString(),
          title: c.title,
          status: c.status,
          category: c.category,
          createdAt: c.createdAt?.toISOString?.() || c.createdAt,
        })),
      },
    };
  } catch (error) {
    console.error("Analytics error:", error);
    return { success: false, error: "Failed to fetch analytics" };
  }
}

/** Get all authorities */
export async function getAuthorities() {
  try {
    await connectDB();
    const authorities = await Authority.find().lean();
    return {
      success: true,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: authorities.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
        userId: a.userId?.toString(),
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
        updatedAt: a.updatedAt?.toISOString?.() || a.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Get authorities error:", error);
    return { success: false, error: "Failed to fetch authorities" };
  }
}

/** Get all users (admin only) */
export async function getAllUsers() {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    const users = await User.find().select("-password").lean();
     
    return {
      success: true,
      data: users.map((u: any) => ({
        ...u,
        _id: u._id.toString(),
        createdAt: u.createdAt?.toISOString?.() || u.createdAt,
        updatedAt: u.updatedAt?.toISOString?.() || u.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Update user role (admin only) */
export async function updateUserRole(userId: string, role: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };
    await User.findByIdAndUpdate(userId, { role });

    // If demoting away from authority/ngo, remove Authority record
    if (!["authority", "ngo"].includes(role)) {
      await Authority.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    return { success: true, message: "Role updated" };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Update user role with authority details (admin only) */
export async function updateUserRoleWithDetails(data: {
  userId: string;
  role: string;
  organization?: string;
  authorityType?: "ngo" | "authority";
  categories?: string[];
  contactPhone?: string;
  address?: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    const user = await User.findById(data.userId);
    if (!user) return { success: false, error: "User not found" };

    // Update user role and organization
    user.role = data.role as "user" | "admin" | "ngo" | "authority";
    if (data.organization) user.organization = data.organization;
    if (data.categories) user.categories = data.categories;
    await user.save();

    // If promoting to authority or ngo, create/update Authority record
    if (["authority", "ngo"].includes(data.role)) {
      const authorityData = {
        name: data.organization || user.name,
        email: user.email,
        type: (data.authorityType || data.role) as "ngo" | "authority",
        categories: data.categories || [],
        contactPhone: data.contactPhone || "",
        address: data.address || "",
        userId: user._id,
      };

      await Authority.findOneAndUpdate(
        { userId: user._id },
        authorityData,
        { upsert: true, new: true }
      );
    } else {
      // If demoting, remove Authority record
      await Authority.deleteMany({ userId: user._id });
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/users");
    revalidatePath("/dashboard/complaints");
    return { success: true, message: "Role and details updated" };
  } catch (error) {
    console.error("Update role with details error:", error);
    return { success: false, error: "Failed to update role" };
  }
}

/** Delete user (admin only) */
export async function deleteUser(userId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };
    if (session.user.id === userId)
      return { success: false, error: "Cannot delete yourself" };
    await User.findByIdAndDelete(userId);
    revalidatePath("/dashboard");
    return { success: true, message: "User deleted" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Failed" };
  }
}

// ============ COMMENTS ============

/** Add a comment to a complaint or campaign */
export async function addComment(data: {
  targetType: "complaint" | "campaign";
  targetId: string;
  content: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };
    if (!data.content || data.content.trim().length < 2)
      return { success: false, error: "Comment must be at least 2 characters" };
    if (data.content.length > 1000)
      return { success: false, error: "Comment must be under 1000 characters" };

    const comment = await Comment.create({
      targetType: data.targetType,
      targetId: new mongoose.Types.ObjectId(data.targetId),
      userId: new mongoose.Types.ObjectId(session.user.id),
      userName: session.user.name || "User",
      content: data.content.trim(),
    });

    const path = data.targetType === "complaint"
      ? `/complaints/${data.targetId}`
      : `/donate/${data.targetId}`;
    revalidatePath(path);

    return {
      success: true,
      data: {
        _id: comment._id.toString(),
        userName: comment.userName,
        content: comment.content,
        createdAt: comment.createdAt.toISOString(),
      },
    };
  } catch (error) {
    console.error("Add comment error:", error);
    return { success: false, error: "Failed to post comment" };
  }
}

/** Get comments for a complaint or campaign */
export async function getComments(targetType: "complaint" | "campaign", targetId: string) {
  try {
    await connectDB();
    const comments = await Comment.find({
      targetType,
      targetId: new mongoose.Types.ObjectId(targetId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: comments.map((c: any) => ({
        _id: c._id.toString(),
        userId: c.userId.toString(),
        userName: c.userName,
        content: c.content,
        createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      })),
    };
  } catch (error) {
    console.error("Get comments error:", error);
    return { success: false, error: "Failed to fetch comments" };
  }
}

// ============ FEEDBACK ============

/** Submit feedback on a resolved complaint (creator only) */
export async function submitFeedback(data: {
  complaintId: string;
  rating: number;
  comment: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const complaint = await Complaint.findById(data.complaintId);
    if (!complaint) return { success: false, error: "Complaint not found" };

    if (complaint.createdBy?.toString() !== session.user.id)
      return { success: false, error: "Only the complaint creator can give feedback" };
    if (complaint.status !== "Resolved")
      return { success: false, error: "Feedback can only be given on resolved complaints" };
    if (complaint.feedback?.rating)
      return { success: false, error: "Feedback already submitted" };
    if (data.rating < 1 || data.rating > 5)
      return { success: false, error: "Rating must be between 1 and 5" };

    complaint.feedback = {
      rating: data.rating,
      comment: data.comment.trim(),
      createdAt: new Date(),
    };
    await complaint.save();

    revalidatePath(`/complaints/${data.complaintId}`);
    return { success: true, message: "Feedback submitted" };
  } catch (error) {
    console.error("Submit feedback error:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}

// ============ DELETE COMMENT ============

/** Delete a comment (own comment or admin) */
export async function deleteComment(commentId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const comment = await Comment.findById(commentId);
    if (!comment) return { success: false, error: "Comment not found" };

    const userRole = (session.user as { role: string }).role;
    const isAdmin = userRole === "admin";
    const isOwner = comment.userId.toString() === session.user.id;

    if (!isAdmin && !isOwner) {
      return { success: false, error: "You can only delete your own comments" };
    }

    await Comment.findByIdAndDelete(commentId);
    return { success: true, message: "Comment deleted" };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}

// ============ TIMELINE MANAGEMENT (Admin) ============

/** Edit a timeline entry (admin only) */
export async function editTimelineEntry(data: {
  complaintId: string;
  timelineId: string;
  comment?: string;
  status?: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    const complaint = await Complaint.findById(data.complaintId);
    if (!complaint) return { success: false, error: "Complaint not found" };

    const entry = complaint.timeline.id(data.timelineId);
    if (!entry) return { success: false, error: "Timeline entry not found" };

    if (data.comment) entry.comment = data.comment;
    if (data.status) entry.status = data.status as any;
    await complaint.save();

    revalidatePath(`/complaints/${data.complaintId}`);
    return { success: true, message: "Timeline entry updated" };
  } catch (error) {
    console.error("Edit timeline error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Delete a timeline entry (admin only) */
export async function deleteTimelineEntry(data: {
  complaintId: string;
  timelineId: string;
}) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    await Complaint.findByIdAndUpdate(data.complaintId, {
      $pull: { timeline: { _id: data.timelineId } },
    });

    revalidatePath(`/complaints/${data.complaintId}`);
    return { success: true, message: "Timeline entry deleted" };
  } catch (error) {
    console.error("Delete timeline error:", error);
    return { success: false, error: "Failed" };
  }
}

// ============ DASHBOARD COMMENTS ============

/** Get all comments for dashboard (admin sees all, ngo/authority sees theirs) */
export async function getAllCommentsForDashboard() {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return {
      success: true,
      data: comments.map((c: any) => ({
        _id: c._id.toString(),
        targetType: c.targetType,
        targetId: c.targetId.toString(),
        userId: c.userId.toString(),
        userName: c.userName,
        content: c.content,
        createdAt: c.createdAt?.toISOString?.() || c.createdAt,
      })),
    };
  } catch (error) {
    console.error("Get all comments error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Get all feedback for dashboard */
export async function getAllFeedbackForDashboard() {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    const complaints = await Complaint.find({ "feedback.rating": { $exists: true, $ne: null } })
      .select("issueId title feedback status")
      .sort({ "feedback.createdAt": -1 })
      .limit(100)
      .lean();

    return {
      success: true,
      data: complaints.map((c: any) => ({
        _id: c._id.toString(),
        issueId: c.issueId,
        title: c.title,
        status: c.status,
        feedback: {
          rating: c.feedback.rating,
          comment: c.feedback.comment,
          createdAt: c.feedback.createdAt?.toISOString?.() || c.feedback.createdAt,
        },
      })),
    };
  } catch (error) {
    console.error("Get all feedback error:", error);
    return { success: false, error: "Failed" };
  }
}
