"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Complaint from "@/models/Complaint";
import Authority from "@/models/Authority";
import Vote from "@/models/Vote";
import User from "@/models/User";
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

    let sortQuery: Record<string, 1 | -1> = { createdAt: -1 };
    if (sort === "oldest") sortQuery = { createdAt: 1 };
    if (sort === "most-upvoted") sortQuery = { upvotes: -1 };

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serialized = complaints.map((c: any) => ({
      ...c,
      _id: c._id.toString(),
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

/** Get a single complaint by ID */
export async function getComplaintById(id: string) {
  try {
    await connectDB();
    const complaint = await Complaint.findById(id)
      .populate("createdBy", "name email")
      .populate("assignedTo", "name email organization role")
      .lean();
    if (!complaint) return { success: false, error: "Complaint not found" };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const c = complaint as any;
    const serialized = {
      ...c,
      _id: c._id.toString(),
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
    revalidatePath("/dashboard");
    return { success: true, message: "Role updated" };
  } catch (error) {
    console.error("Update role error:", error);
    return { success: false, error: "Failed" };
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
