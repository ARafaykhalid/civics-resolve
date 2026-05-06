/** Core types for the Civic Issue Platform */

export type UserRole = "user" | "admin" | "ngo" | "authority";

export type ComplaintStatus = "Pending Verification" | "Verified" | "Under Progress" | "Resolved" | "Rejected";
export type ComplaintPriority = "Low" | "Medium" | "High";
export type ComplaintCategory = "Road" | "Water" | "Electricity" | "Garbage" | "Safety" | "Other";

export interface Location {
  address: string;
  lat?: number;
  lng?: number;
}

export interface TimelineEntry {
  _id?: string;
  status: ComplaintStatus;
  comment: string;
  updatedBy: string;
  updatedByName?: string;
  images?: string[];
  createdAt: Date | string;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  organization?: string;
  categories?: ComplaintCategory[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IComplaint {
  _id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: Location;
  images: string[];
  status: ComplaintStatus;
  priority: ComplaintPriority;
  upvotes: number;
  upvotedBy: string[];
  assignedTo?: string | IUser;
  createdBy?: string | IUser;
  isAnonymous: boolean;
  timeline: TimelineEntry[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IAuthority {
  _id: string;
  name: string;
  email: string;
  type: "ngo" | "authority";
  categories: ComplaintCategory[];
  contactPhone?: string;
  address?: string;
  userId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IDonationCampaign {
  _id: string;
  title: string;
  description: string;
  category: string;
  images: string[];
  qrCodeImage: string;
  upiId?: string;
  goalAmount: number;
  raisedAmount: number;
  isActive: boolean;
  createdBy: string | IUser;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IDonationTransaction {
  _id: string;
  campaignId: string;
  userId?: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  transactionId: string;
  screenshotUrl?: string;
  status: "pending" | "verified" | "rejected";
  adminNote?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IAnnouncement {
  _id: string;
  title: string;
  content: string;
  type: "emergency" | "info" | "warning" | "update";
  isActive: boolean;
  isPinned: boolean;
  createdBy: string | IUser;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IVolunteer {
  _id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: Date | string;
  spotsTotal: number;
  spotsFilled: number;
  volunteers: string[];
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  isActive: boolean;
  createdBy: string | IUser;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: Date | string;
  endDate?: Date | string;
  image?: string;
  organizer: string;
  attendees: string[];
  maxAttendees?: number;
  isActive: boolean;
  createdBy: string | IUser;
  createdAt: Date | string;
  updatedAt: Date | string;
}

/** API Response types */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Filter/query types */
export interface ComplaintFilters {
  status?: ComplaintStatus;
  category?: ComplaintCategory;
  priority?: ComplaintPriority;
  search?: string;
  sort?: "latest" | "oldest" | "most-upvoted";
  page?: number;
  limit?: number;
  assignedTo?: string;
}
