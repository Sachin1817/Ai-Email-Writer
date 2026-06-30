import mongoose from "mongoose";

const EmailSchema = new mongoose.Schema(
  {
    userId: {
      type: String, // Maps to User firebaseUID for easy querying
      required: true,
      index: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    recipient: {
      type: String,
      default: "",
      trim: true,
    },
    content: {
      type: String,
      required: false,
    },
    preview: { type: String, default: "" },
    greeting: { type: String, default: "" },
    body: { type: String, default: "" },
    closing: { type: String, default: "" },
    signature: { type: String, default: "" },
    qualityMetrics: {
      grammar: { type: Number, default: 0 },
      tone: { type: Number, default: 0 },
      readability: { type: Number, default: 0 },
      professionalism: { type: Number, default: 0 }
    },
    alternativeSubjectLines: {
      type: [String],
      default: []
    },
    suggestedFollowUp: { type: String, default: "" },
    estimatedReadingTime: { type: String, default: "" },
    estimatedReplyRate: { type: String, default: "" },
    tone: {
      type: String,
      default: "PROFESSIONAL",
    },
    category: {
      type: String,
      default: "BUSINESS",
    },
    status: {
      type: String,
      enum: ["success", "draft"],
      default: "success",
    },
    isFavorite: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    creativity: {
      type: String,
      enum: ["PRECISE", "BALANCED", "CREATIVE"],
      default: "BALANCED",
    }
  },
  {
    timestamps: true,
  }
);

const Email = mongoose.models.Email || mongoose.model("Email", EmailSchema);
export default Email;
