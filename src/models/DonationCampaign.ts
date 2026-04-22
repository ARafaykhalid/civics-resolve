import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Donation Campaign - Admin creates these posts with a QR code for payments.
 * Users donate by scanning QR and submitting proof (transaction ID + screenshot).
 */
export interface IDonationCampaignDoc extends Document {
  title: string;
  description: string;
  category: "Infrastructure" | "Education" | "Healthcare" | "Environment" | "Disaster Relief" | "Charity" | "Other";
  images: string[];
  qrCodeImage: string;
  upiId?: string;
  goalAmount: number;
  raisedAmount: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DonationCampaignSchema = new Schema<IDonationCampaignDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Infrastructure", "Education", "Healthcare", "Environment", "Disaster Relief", "Charity", "Other"],
    },
    images: [{ type: String }],
    qrCodeImage: { type: String, required: true },
    upiId: { type: String },
    goalAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

DonationCampaignSchema.index({ isActive: 1, createdAt: -1 });

const DonationCampaign: Model<IDonationCampaignDoc> =
  mongoose.models.DonationCampaign ||
  mongoose.model<IDonationCampaignDoc>("DonationCampaign", DonationCampaignSchema);

export default DonationCampaign;
