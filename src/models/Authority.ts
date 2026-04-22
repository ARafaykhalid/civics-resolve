import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuthorityDoc extends Document {
  name: string;
  email: string;
  type: "ngo" | "authority";
  categories: string[];
  contactPhone?: string;
  address?: string;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const AuthoritySchema = new Schema<IAuthorityDoc>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    type: { type: String, enum: ["ngo", "authority"], required: true },
    categories: [
      {
        type: String,
        enum: ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"],
      },
    ],
    contactPhone: { type: String },
    address: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

AuthoritySchema.index({ categories: 1 });
AuthoritySchema.index({ type: 1 });

const Authority: Model<IAuthorityDoc> =
  mongoose.models.Authority ||
  mongoose.model<IAuthorityDoc>("Authority", AuthoritySchema);

export default Authority;
