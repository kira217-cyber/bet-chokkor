import mongoose from "mongoose";

const { Schema } = mongoose;

/**
 * হোম পেজের স্লাইডার ব্যানার।
 *
 * ডেস্কটপ ও মোবাইলের ছবি আলাদা (মূল সাইটের মতো), তাই দুই মাপে দুটো
 * ছবি রাখা যায়। ঐচ্ছিক লিংক থাকলে ব্যানারে ক্লিকে সেখানে যায়।
 */
const sliderSchema = new Schema(
  {
    imageDesktop: { type: String, default: "", trim: true },
    imageMobile: { type: String, default: "", trim: true },

    link: { type: String, default: "", trim: true },

    isActive: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0, min: 0, index: true },
  },
  { timestamps: true },
);

sliderSchema.index({ isActive: 1, order: 1 });

const Slider = mongoose.models.Slider || mongoose.model("Slider", sliderSchema);

export default Slider;
