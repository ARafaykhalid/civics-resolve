import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Volunteer Opportunity - posted by admin/NGOs for community service.
 */
export interface IVolunteerDoc extends Document {
  title: string;
  description: string;
  category: "Cleanup" | "Teaching" | "Healthcare" | "Disaster Relief" | "Tree Plantation" | "Other";
  location: string;
  date: Date;
  spotsTotal: number;
  spotsFilled: number;
  volunteers: mongoose.Types.ObjectId[];
  contactEmail: string;
  contactPhone?: string;
  images: string[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VolunteerSchema = new Schema<IVolunteerDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Cleanup", "Teaching", "Healthcare", "Disaster Relief", "Tree Plantation", "Other"],
    },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    spotsTotal: { type: Number, required: true },
    spotsFilled: { type: Number, default: 0 },
    volunteers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

VolunteerSchema.index({ isActive: 1, date: 1 });

const Volunteer: Model<IVolunteerDoc> =
  mongoose.models.Volunteer ||
  mongoose.model<IVolunteerDoc>("Volunteer", VolunteerSchema);

export default Volunteer;
