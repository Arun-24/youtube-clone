import mongoose from "mongoose";
const commentschema = mongoose.Schema(
  {
    dislikes: {
      type: Number,
      default: 0,
    },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    videoid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "videofiles",
      required: true,
    },
    commentbody: { type: String },
    usercommented: { type: String },
    commentedon: { type: Date, default: Date.now },
    likeCount: { type: Number, default: 0 },
    dislikeCount: { type: Number, default: 0 },
    city: { type: String },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("comment", commentschema);
