import User from "../Modals/Auth.js";
import path from "path";
import fs from "fs";

export const downloadVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { email, title, filepath } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const today = new Date().toDateString();
    const lastDate = user.lastDownloadDate
      ? new Date(user.lastDownloadDate).toDateString()
      : null;
    if (lastDate !== today) {
      user.downloadCount = 0;
      user.lastDownloadDate = new Date();
    }
    if (user.plan === "FREE" && user.downloadCount >= 1) {
      return res.status(403).json({
        message: "Daily download limit reached. Upgrade your plan.",
      });
    }
    user.downloadCount += 1;
    user.downloads.push({
      videoId,
      title,
      filepath,
    });

    await user.save();
    const filePath = path.join("uploads", filepath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Video file not found" });
    }

    res.download(filePath);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Download failed" });
  }
};
