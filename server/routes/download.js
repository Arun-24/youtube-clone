import express from "express";
import { downloadVideo } from "../controllers/download.js";

const router = express.Router();

router.post("/:videoId", downloadVideo);

export default router;
