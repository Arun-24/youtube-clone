import comment from "../Modals/comment.js";
import mongoose from "mongoose";

/* ---------------- PROFANITY FILTER ---------------- */

const bannedWords = ["fuck", "bloody beggar", "stupid", "idiot"];

const cleanComment = (text) => {
  if (!text) return text;

  let cleaned = text;

  bannedWords.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    cleaned = cleaned.replace(regex, "****");
  });

  return cleaned;
};

/* ---------------- SPECIAL CHARACTER BLOCKER ---------------- */

const hasSpecialCharacters = (text) => {
  const specialCharRegex = /[!@#$%^&*()+=[\]{};':"\\|<>/?]/;
  return specialCharRegex.test(text);
};

/* ---------------- POST COMMENT ---------------- */

export const postcomment = async (req, res) => {
  const commentdata = req.body;

  try {
    if (!commentdata.commentbody) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    if (hasSpecialCharacters(commentdata.commentbody)) {
      return res.status(400).json({
        message: "Comments containing special characters are not allowed",
      });
    }

    const cleanedText = cleanComment(commentdata.commentbody);

    const postcomment = new comment({
      ...commentdata,
      commentbody: cleanedText,
      dislikes: 0, // initialize safely
    });

    await postcomment.save();

    return res.status(200).json({
      comment: true,
      moderated: cleanedText !== commentdata.commentbody,
    });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ---------------- GET ALL COMMENTS ---------------- */

export const getallcomment = async (req, res) => {
  const { videoid } = req.params;

  try {
    const commentvideo = await comment.find({ videoid: videoid });
    return res.status(200).json(commentvideo);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ---------------- DELETE COMMENT ---------------- */

export const deletecomment = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    await comment.findByIdAndDelete(_id);
    return res.status(200).json({ comment: true });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ---------------- EDIT COMMENT ---------------- */

export const editcomment = async (req, res) => {
  const { id: _id } = req.params;
  const { commentbody } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  if (!commentbody) {
    return res.status(400).json({ message: "Comment cannot be empty" });
  }

  if (hasSpecialCharacters(commentbody)) {
    return res.status(400).json({
      message: "Comments containing special characters are not allowed",
    });
  }

  const cleanedText = cleanComment(commentbody);

  try {
    const updatecomment = await comment.findByIdAndUpdate(
      _id,
      { $set: { commentbody: cleanedText } },
      { new: true }
    );

    return res.status(200).json(updatecomment);
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

/* ---------------- DISLIKE COMMENT ---------------- */

export const dislikecomment = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("comment unavailable");
  }

  try {
    const foundComment = await comment.findById(_id);

    if (!foundComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Ensure dislikes field exists
    if (typeof foundComment.dislikes !== "number") {
      foundComment.dislikes = 0;
    }

    foundComment.dislikes += 1;

    if (foundComment.dislikes >= 2) {
      await comment.findByIdAndDelete(_id);

      return res.status(200).json({
        removed: true,
        message: "Comment removed due to excessive dislikes",
      });
    }

    await foundComment.save();

    return res.status(200).json({
      removed: false,
      dislikes: foundComment.dislikes,
    });
  } catch (error) {
    console.error("error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};