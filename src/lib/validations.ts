import { z } from "zod";

/** Complaint submission schema */
export const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be at most 100 characters"),
  description: z.string().min(20, "Description must be at least 20 characters").max(2000, "Description must be at most 2000 characters"),
  category: z.enum(["Road", "Water", "Electricity", "Garbage", "Safety", "Other"], {
    error: "Please select a valid category",
  }),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  images: z.array(z.string()).max(5, "Maximum 5 images allowed").default([]),
  isAnonymous: z.boolean().default(false),
});

export type ComplaintInput = z.infer<typeof complaintSchema>;

/** User registration schema */
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Login schema */
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/** Status update schema */
export const statusUpdateSchema = z.object({
  complaintId: z.string().min(1),
  status: z.enum(["Pending Verification", "Verified", "Under Progress", "Resolved", "Rejected"]),
  comment: z.string().min(5, "Comment must be at least 5 characters").max(500),
  images: z.array(z.string()).max(3).default([]),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

/** Assignment schema */
export const assignSchema = z.object({
  complaintId: z.string().min(1),
  authorityId: z.string().min(1, "Please select an authority"),
  priority: z.enum(["Low", "Medium", "High"]).default("Medium"),
});

export type AssignInput = z.infer<typeof assignSchema>;

/** Donation campaign schema */
export const donationCampaignSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.enum(["Infrastructure", "Education", "Healthcare", "Environment", "Disaster Relief", "Charity", "Other"]),
  images: z.array(z.string()).max(5).default([]),
  qrCodeImage: z.string().min(1, "QR code image is required"),
  upiId: z.string().optional(),
  goalAmount: z.number().min(1, "Goal must be positive"),
});

export type DonationCampaignInput = z.infer<typeof donationCampaignSchema>;

/** Donation transaction proof schema */
export const donationTransactionSchema = z.object({
  campaignId: z.string().min(1),
  donorName: z.string().min(2).max(50),
  donorEmail: z.string().email().optional().or(z.literal("")),
  amount: z.number().min(1, "Amount must be positive"),
  transactionId: z.string().min(3, "Transaction ID is required"),
  screenshotUrl: z.string().optional().or(z.literal("")),
});

export type DonationTransactionInput = z.infer<typeof donationTransactionSchema>;

/** Announcement schema */
export const announcementSchema = z.object({
  title: z.string().min(5).max(100),
  content: z.string().min(10).max(2000),
  type: z.enum(["emergency", "info", "warning", "update"]),
  isPinned: z.boolean().default(false),
});

export type AnnouncementInput = z.infer<typeof announcementSchema>;

/** Volunteer opportunity schema */
export const volunteerSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.enum(["Cleanup", "Teaching", "Healthcare", "Disaster Relief", "Tree Plantation", "Other"]),
  location: z.string().min(5),
  date: z.string().min(1, "Date is required"),
  spotsTotal: z.number().min(1),
  contactEmail: z.string().email(),
  contactPhone: z.string().optional().or(z.literal("")),
  images: z.array(z.string()).max(3).default([]),
  customFields: z.array(z.object({
    id: z.string(),
    label: z.string().min(1),
    type: z.enum(["text", "number", "email", "textarea", "checkbox"]),
    required: z.boolean().default(false)
  })).optional().default([]),
});

export type VolunteerInput = z.infer<typeof volunteerSchema>;

/** Event schema */
export const eventSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  location: z.string().min(5),
  date: z.string().min(1),
  endDate: z.string().optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  organizer: z.string().min(2),
  maxAttendees: z.number().min(1).optional(),
});

export type EventInput = z.infer<typeof eventSchema>;

/** Forgot Password schema */
export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** Reset Password schema */
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Change Password schema */
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
