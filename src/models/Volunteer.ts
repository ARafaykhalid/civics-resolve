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
  customFields?: {
    id: string;
    label: string;
    type: "text" | "number" | "email" | "textarea" | "checkbox";
    required: boolean;
  }[];
  volunteers: {
    userId: mongoose.Types.ObjectId;
    responses: Record<string, any>;
    joinedAt: Date;
  }[];
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
    customFields: [
      {
        id: { type: String },
        label: { type: String },
        type: { type: String, enum: ["text", "number", "email", "textarea", "checkbox"] },
        required: { type: Boolean, default: false },
      },
    ],
    volunteers: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        responses: { type: Schema.Types.Mixed, default: {} },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
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
