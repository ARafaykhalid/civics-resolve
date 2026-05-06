import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Comment — user comments on complaints or donation campaigns.
 */
export interface ICommentDoc extends Document {
  targetType: "complaint" | "campaign" | "event" | "volunteer";
  targetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<ICommentDoc>(
  {
    targetType: {
      type: String,
      enum: ["complaint", "campaign", "event", "volunteer"],
      required: true,
    },
    targetId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    content: { type: String, required: true, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

CommentSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

const Comment: Model<ICommentDoc> =
  mongoose.models.Comment ||
  mongoose.model<ICommentDoc>("Comment", CommentSchema);

export default Comment;
