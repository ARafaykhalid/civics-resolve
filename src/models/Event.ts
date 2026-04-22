import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Community Events - local meetups, cleanup drives, awareness campaigns.
 */
export interface IEventDoc extends Document {
  title: string;
  description: string;
  location: string;
  date: Date;
  endDate?: Date;
  image?: string;
  organizer: string;
  attendees: mongoose.Types.ObjectId[];
  maxAttendees?: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEventDoc>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: { type: String, required: true },
    date: { type: Date, required: true },
    endDate: { type: Date },
    image: { type: String },
    organizer: { type: String, required: true },
    attendees: [{ type: Schema.Types.ObjectId, ref: "User" }],
    maxAttendees: { type: Number },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

EventSchema.index({ isActive: 1, date: 1 });

const Event: Model<IEventDoc> =
  mongoose.models.Event ||
  mongoose.model<IEventDoc>("Event", EventSchema);

export default Event;
