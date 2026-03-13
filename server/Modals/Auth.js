import mongoose from "mongoose";
const userschema = mongoose.Schema({
  email: { type: String, required: true },
  name: { type: String },
  channelname: { type: String },
  description: { type: String },
  image: { type: String },
  joinedon: { type: Date, default: Date.now },

  plan: {
    type: String,
    enum: ["FREE", "BRONZE", "SILVER", "GOLD"],
    default: "FREE",
  },

  watchTimeLimit: {
    type: Number, 
    default: 300, 
  },

  planActivatedAt: {
    type: Date,
    default: null,
  },

  downloadCount: {
    type: Number,
    default: 0,
  },

  lastDownloadDate: {
    type: Date,
    default: null,
  },

  downloads: [
    {
      videoId: { type: mongoose.Schema.Types.ObjectId, ref: "video" },
      title: String,
      filepath: String,
      downloadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

export default mongoose.model("user", userschema);
