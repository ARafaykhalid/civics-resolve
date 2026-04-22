import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Emergency Alerts / Announcements posted by admin.
 * Visible to all users on the homepage and dedicated page.
 */
export interface IAnnouncementDoc extends Document {
  title: string;
  content: string;
  type: "emergency" | "info" | "warning" | "update";
  isActive: boolean;
  isPinned: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AnnouncementSchema = new Schema<IAnnouncementDoc>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["emergency", "info", "warning", "update"],
      default: "info",
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ isActive: 1, isPinned: -1, createdAt: -1 });

const Announcement: Model<IAnnouncementDoc> =
  mongoose.models.Announcement ||
  mongoose.model<IAnnouncementDoc>("Announcement", AnnouncementSchema);

export default Announcement;
