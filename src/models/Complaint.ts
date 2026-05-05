import mongoose, { Schema, Document, Model } from "mongoose";

export interface IComplaintDoc extends Document {
  issueId: number;
  title: string;
  description: string;
  category: string;
  location: {
    address: string;
    lat?: number;
    lng?: number;
  };
  images: string[];
  status: "Pending" | "Verified" | "In Progress" | "Resolved";
  priority: "Low" | "Medium" | "High";
  upvotes: number;
  upvotedBy: mongoose.Types.ObjectId[];
  assignedTo?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  isAnonymous: boolean;
  timeline: {
    status: string;
    comment: string;
    updatedBy: mongoose.Types.ObjectId;
    updatedByName?: string;
    images?: string[];
    createdAt: Date;
  }[];
  feedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TimelineSchema = new Schema(
  {
    status: { type: String, required: true },
    comment: { type: String, required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    updatedByName: { type: String },
    images: [{ type: String }],
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ComplaintSchema = new Schema<IComplaintDoc>(
  {
    issueId: { type: Number, unique: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"],
    },
    location: {
      address: { type: String, required: true },
      lat: { type: Number },
      lng: { type: Number },
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: ["Pending", "Verified", "In Progress", "Resolved"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    upvotes: { type: Number, default: 0 },
    upvotedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    isAnonymous: { type: Boolean, default: false },
    timeline: [TimelineSchema],
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      createdAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Auto-increment issueId
ComplaintSchema.pre("save", async function () {
  if (this.isNew && !this.issueId) {
    const last = await mongoose
      .model("Complaint")
      .findOne({}, { issueId: 1 })
      .sort({ issueId: -1 })
      .lean();
    this.issueId = ((last as any)?.issueId || 0) + 1;
  }
});

ComplaintSchema.index({ issueId: 1 }, { unique: true, sparse: true });
ComplaintSchema.index({ status: 1 });
ComplaintSchema.index({ category: 1 });
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ upvotes: -1 });
ComplaintSchema.index({ assignedTo: 1 });
ComplaintSchema.index({ title: "text", description: "text" });

const Complaint: Model<IComplaintDoc> =
  mongoose.models.Complaint ||
  mongoose.model<IComplaintDoc>("Complaint", ComplaintSchema);

export default Complaint;
