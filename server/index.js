import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';  
import bodyParser from "body-parser";
import userroutes from "./routes/auth.js";
import videoroutes from "./routes/video.js";
import likeroutes from "./routes/like.js";
import watchlaterroutes from './routes/watchlater.js';
import historyroutes from './routes/history.js';
import commentroutes from "./routes/comment.js";
import paymentRoutes from "./routes/payment.js";
import downloadRoutes from "./routes/download.js";
import path from "path";
import "dotenv/config";
import http from "http";
import { initCallServer } from "./socket/callServer.js";


const app = express();
app.use(express.json());
app.use(cors());
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use("/uploads", express.static(path.join("uploads")));
app.get("/", (req, res) => {
  res.send("YouTube backend is working");
});
app.use(bodyParser.json());
app.use("/user", userroutes);
app.use("/video", videoroutes);
app.use("/like", likeroutes);
app.use("/watch", watchlaterroutes);
app.use("/history", historyroutes);
app.use("/comment", commentroutes);
app.use("/api/payment", paymentRoutes);
app.use("/download", downloadRoutes);
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initCallServer(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const DBURL = process.env.DB_URL;
mongoose
  .connect(DBURL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((error) => {
    console.log(error);
  });