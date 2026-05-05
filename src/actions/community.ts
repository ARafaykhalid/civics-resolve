"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import Announcement from "@/models/Announcement";
import Volunteer from "@/models/Volunteer";
import Event from "@/models/Event";
import {
  announcementSchema,
  volunteerSchema,
  eventSchema,
} from "@/lib/validations";

// ============ ANNOUNCEMENTS ============

export async function createAnnouncement(data: {
  title: string;
  content: string;
  type: string;
  isPinned: boolean;
}) {
  try {
    const validated = announcementSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };

    await Announcement.create({
      ...validated,
      isActive: true,
      createdBy: session.user.id,
    });
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, message: "Announcement created" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error:
          error.issues?.[0]?.message ||
          error.errors?.[0]?.message ||
          "Validation failed",
      };
    }
    console.error("Create announcement error:", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function getAnnouncements(activeOnly = true) {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = activeOnly ? { isActive: true } : {};
    const announcements = await Announcement.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();
     
    return {
      success: true,
      data: announcements.map((a: any) => ({
        ...a,
        _id: a._id.toString(),
        createdBy: a.createdBy?.toString(),
        createdAt: a.createdAt?.toISOString?.() || a.createdAt,
        updatedAt: a.updatedAt?.toISOString?.() || a.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Get announcements error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user || (session.user as { role: string }).role !== "admin")
      return { success: false, error: "Admin required" };
    await Announcement.findByIdAndDelete(id);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, message: "Deleted" };
  } catch (error) {
    console.error("Delete announcement error:", error);
    return { success: false, error: "Failed" };
  }
}

// ============ VOLUNTEERS ============

export async function createVolunteerOpportunity(data: {
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  spotsTotal: number;
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  customFields?: {
    id: string;
    label: string;
    type: "text" | "number" | "email" | "textarea" | "checkbox";
    required: boolean;
  }[];
}) {
  try {
    const validated = volunteerSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    await Volunteer.create({
      ...validated,
      customFields: data.customFields || [],
      date: new Date(validated.date),
      isActive: true,
      createdBy: session.user.id,
    });
    revalidatePath("/volunteer");
    revalidatePath("/dashboard");
    return { success: true, message: "Volunteer opportunity created" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error:
          error.issues?.[0]?.message ||
          error.errors?.[0]?.message ||
          "Validation failed",
      };
    }
    console.error("Create volunteer error:", error);
    return { success: false, error: "Failed to create opportunity" };
  }
}

export async function getVolunteerOpportunities(activeOnly = true) {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = activeOnly
      ? { isActive: true, date: { $gte: new Date() } }
      : {};
    const volunteers = await Volunteer.find(query).sort({ date: 1 }).lean();
     
    return {
      success: true,
      data: volunteers.map((v: any) => ({
        ...v,
        _id: v._id.toString(),
        createdBy: v.createdBy?.toString(),
        volunteers:
          v.volunteers?.map((vol: any) => ({
            userId: vol.userId?.toString(),
            responses: vol.responses,
            joinedAt: vol.joinedAt?.toISOString?.() || vol.joinedAt,
          })) || [],
        date: v.date?.toISOString?.() || v.date,
        createdAt: v.createdAt?.toISOString?.() || v.createdAt,
        updatedAt: v.updatedAt?.toISOString?.() || v.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Get volunteers error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function joinVolunteer(
  opportunityId: string,
  responses: Record<string, any> = {},
) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const opportunity = await Volunteer.findById(opportunityId);
    if (!opportunity) return { success: false, error: "Not found" };
    if (opportunity.spotsFilled >= opportunity.spotsTotal)
      return { success: false, error: "No spots available" };

    const userId = new mongoose.Types.ObjectId(session.user.id);
    if (
      opportunity.volunteers.some(
        (v: any) => v.userId?.equals(userId) || v.equals?.(userId),
      )
    ) {
      return { success: false, error: "Already joined" };
    }

    opportunity.volunteers.push({ userId, responses, joinedAt: new Date() });
    opportunity.spotsFilled += 1;
    await opportunity.save();
    revalidatePath("/volunteer");
    return { success: true, message: "Joined successfully!" };
  } catch (error) {
    console.error("Join volunteer error:", error);
    return { success: false, error: "Failed to join" };
  }
}

/** Update volunteer opportunity (admin/ngo) */
export async function updateVolunteerOpportunity(
  id: string,
  updates: {
    title?: string;
    description?: string;
    category?: string;
    location?: string;
    date?: string;
    spotsTotal?: number;
    spotsFilled?: number;
    contactEmail?: string;
    contactPhone?: string;
    images?: string[];
    isActive?: boolean;
  },
) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    // Convert date string to Date object if provided
    const updateData: any = { ...updates };
    if (updates.date) {
      updateData.date = new Date(updates.date);
    }

    const volunteer = await Volunteer.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!volunteer) return { success: false, error: "Not found" };

    revalidatePath("/volunteer");
    revalidatePath("/dashboard");
    return { success: true, message: "Volunteer opportunity updated" };
  } catch (error) {
    console.error("Update volunteer error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Delete volunteer opportunity (admin/ngo) */
export async function deleteVolunteerOpportunity(id: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    await Volunteer.findByIdAndDelete(id);
    revalidatePath("/volunteer");
    revalidatePath("/dashboard");
    return { success: true, message: "Deleted" };
  } catch (error) {
    console.error("Delete volunteer error:", error);
    return { success: false, error: "Failed" };
  }
}

// ============ EVENTS ============

export async function createEvent(data: {
  title: string;
  description: string;
  location: string;
  date: string;
  endDate?: string;
  image?: string;
  organizer: string;
  maxAttendees?: number;
}) {
  try {
    const validated = eventSchema.parse(data);
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    await Event.create({
      ...validated,
      date: new Date(validated.date),
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      isActive: true,
      createdBy: session.user.id,
    });
    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, message: "Event created" };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return {
        success: false,
        error:
          error.issues?.[0]?.message ||
          error.errors?.[0]?.message ||
          "Validation failed",
      };
    }
    console.error("Create event error:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function getEvents(activeOnly = true) {
  try {
    await connectDB();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = activeOnly
      ? { isActive: true, date: { $gte: new Date() } }
      : {};
    const events = await Event.find(query).sort({ date: 1 }).lean();
     
    return {
      success: true,
      data: events.map((e: any) => ({
        ...e,
        _id: e._id.toString(),
        createdBy: e.createdBy?.toString(),
        attendees:
          e.attendees?.map((id: mongoose.Types.ObjectId) => id.toString()) ||
          [],
        date: e.date?.toISOString?.() || e.date,
        endDate: e.endDate?.toISOString?.() || e.endDate,
        createdAt: e.createdAt?.toISOString?.() || e.createdAt,
        updatedAt: e.updatedAt?.toISOString?.() || e.updatedAt,
      })),
    };
  } catch (error) {
    console.error("Get events error:", error);
    return { success: false, error: "Failed" };
  }
}

export async function joinEvent(eventId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const event = await Event.findById(eventId);
    if (!event) return { success: false, error: "Not found" };
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees)
      return { success: false, error: "Event full" };

    const userId = new mongoose.Types.ObjectId(session.user.id);
    if (event.attendees.some((a) => a.equals(userId)))
      return { success: false, error: "Already joined" };

    event.attendees.push(userId);
    await event.save();
    return { success: true, message: "Registered!" };
  } catch (error) {
    console.error("Join event error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Update event (admin/ngo/authority) */
export async function updateEvent(
  id: string,
  updates: {
    title?: string;
    description?: string;
    location?: string;
    date?: string;
    endDate?: string;
    image?: string;
    organizer?: string;
    maxAttendees?: number;
    isActive?: boolean;
  },
) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    const updateData: any = { ...updates };
    if (updates.date) updateData.date = new Date(updates.date);
    if (updates.endDate) updateData.endDate = new Date(updates.endDate);

    const event = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!event) return { success: false, error: "Not found" };

    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, message: "Event updated" };
  } catch (error) {
    console.error("Update event error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Delete event (admin/ngo/authority) */
export async function deleteEvent(id: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Auth required" };
    const role = (session.user as { role: string }).role;
    if (!["admin", "ngo", "authority"].includes(role))
      return { success: false, error: "Insufficient permissions" };

    await Event.findByIdAndDelete(id);
    revalidatePath("/events");
    revalidatePath("/dashboard");
    return { success: true, message: "Deleted" };
  } catch (error) {
    console.error("Delete event error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Leave / unenroll from a volunteer opportunity */
export async function leaveVolunteer(opportunityId: string) {
  try {
    await connectDB();
    const session = await auth();
    if (!session?.user) return { success: false, error: "Login required" };

    const opportunity = await Volunteer.findById(opportunityId);
    if (!opportunity) return { success: false, error: "Not found" };

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const idx = opportunity.volunteers.findIndex(
      (v: any) => v.userId?.equals(userId),
    );
    if (idx === -1) return { success: false, error: "You haven't joined this opportunity" };

    opportunity.volunteers.splice(idx, 1);
    opportunity.spotsFilled = Math.max(0, opportunity.spotsFilled - 1);
    await opportunity.save();

    revalidatePath("/volunteer");
    return { success: true, message: "Successfully unenrolled" };
  } catch (error) {
    console.error("Leave volunteer error:", error);
    return { success: false, error: "Failed to unenroll" };
  }
}

/** Get a single event by ID */
export async function getEventById(id: string) {
  try {
    await connectDB();
    const event = await Event.findById(id).lean();
    if (!event) return { success: false, error: "Not found" };

    const e = event as any;
    return {
      success: true,
      data: {
        ...e,
        _id: e._id.toString(),
        createdBy: e.createdBy?.toString(),
        attendees: e.attendees?.map((a: any) => a.toString()) || [],
        date: e.date?.toISOString?.() || e.date,
        endDate: e.endDate?.toISOString?.() || e.endDate,
        createdAt: e.createdAt?.toISOString?.() || e.createdAt,
        updatedAt: e.updatedAt?.toISOString?.() || e.updatedAt,
      },
    };
  } catch (error) {
    console.error("Get event error:", error);
    return { success: false, error: "Failed" };
  }
}

/** Get a single volunteer opportunity by ID */
export async function getVolunteerById(id: string) {
  try {
    await connectDB();
    const vol = await Volunteer.findById(id).lean();
    if (!vol) return { success: false, error: "Not found" };

    const v = vol as any;
    return {
      success: true,
      data: {
        ...v,
        _id: v._id.toString(),
        createdBy: v.createdBy?.toString(),
        volunteers:
          v.volunteers?.map((vol: any) => ({
            userId: vol.userId?.toString(),
            responses: vol.responses,
            joinedAt: vol.joinedAt?.toISOString?.() || vol.joinedAt,
          })) || [],
        date: v.date?.toISOString?.() || v.date,
        createdAt: v.createdAt?.toISOString?.() || v.createdAt,
        updatedAt: v.updatedAt?.toISOString?.() || v.updatedAt,
      },
    };
  } catch (error) {
    console.error("Get volunteer error:", error);
    return { success: false, error: "Failed" };
  }
}
