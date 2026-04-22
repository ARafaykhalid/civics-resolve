import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Donation Transaction - User submits proof of payment.
 * Admin verifies and updates the campaign's raised amount.
 */
export interface IDonationTransactionDoc extends Document {
  campaignId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  donorName: string;
  donorEmail?: string;
  amount: number;
  transactionId: string;
  screenshotUrl?: string;
  status: "pending" | "verified" | "rejected";
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DonationTransactionSchema = new Schema<IDonationTransactionDoc>(
  {
    campaignId: { type: Schema.Types.ObjectId, ref: "DonationCampaign", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String },
    amount: { type: Number, required: true },
    transactionId: { type: String, required: true, trim: true },
    screenshotUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    adminNote: { type: String },
  },
  { timestamps: true }
);

DonationTransactionSchema.index({ campaignId: 1 });
DonationTransactionSchema.index({ status: 1 });
DonationTransactionSchema.index({ transactionId: 1 });

const DonationTransaction: Model<IDonationTransactionDoc> =
  mongoose.models.DonationTransaction ||
  mongoose.model<IDonationTransactionDoc>("DonationTransaction", DonationTransactionSchema);

export default DonationTransaction;
