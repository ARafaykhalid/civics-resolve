import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVoteDoc extends Document {
  complaintId: mongoose.Types.ObjectId;
  visitorId: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const VoteSchema = new Schema<IVoteDoc>(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: "Complaint", required: true },
    visitorId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Prevent duplicate votes: one vote per visitor per complaint
VoteSchema.index({ complaintId: 1, visitorId: 1 }, { unique: true });

const Vote: Model<IVoteDoc> =
  mongoose.models.Vote || mongoose.model<IVoteDoc>("Vote", VoteSchema);

export default Vote;
