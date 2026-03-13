import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Clock,
  Download,
  MoreHorizontal,
  Share,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

const VideoInfo = ({ video }: any) => {
  const [likes, setlikes] = useState(video.Like || 0);
  const [dislikes, setDislikes] = useState(video.Dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isWatchLater, setIsWatchLater] = useState(false);
  const { user } = useUser();
  // const user = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "johndoe@example.com",
  //   image: "https://github.com/shadcn.png?height=32&width=32",
  // };
  useEffect(() => {
    setlikes(video.Like || 0);
    setDislikes(video.Dislike || 0);
    setIsLiked(false);
    setIsDisliked(false);
  }, [video]);
  const handleLike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.liked) {
        if (isLiked) {
          setlikes((prev: any) => prev - 1);
          setIsLiked(false);
        } else {
          setlikes((prev: any) => prev + 1);
          setIsLiked(true);
          if (isDisliked) {
            setDislikes((prev: any) => prev - 1);
            setIsDisliked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  const handleDislike = async () => {
    if (!user) return;
    try {
      const res = await axiosInstance.post(`/like/${video._id}`, {
        userId: user?._id,
      });
      if (!res.data.liked) {
        if (isDisliked) {
          setDislikes((prev: any) => prev - 1);
          setIsDisliked(false);
        } else {
          setDislikes((prev: any) => prev + 1);
          setIsDisliked(true);
          if (isLiked) {
            setlikes((prev: any) => prev - 1);
            setIsLiked(false);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleWatchLater = async () => {
    try {
      const res = await axiosInstance.post(`/watch/${video._id}`, {
        userId: user?._id,
      });
      if (res.data.watchlater) {
        setIsWatchLater(!isWatchLater);
      } else {
        setIsWatchLater(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleviews = async () => {
      if (user) {
        try {
          return await axiosInstance.post(`/history/${video._id}`, {
            userId: user?._id,
          });
        } catch (error) {
          return console.log(error);
        }
      } else {
        return await axiosInstance.post(`/history/views/${video?._id}`);
      }
    };
    handleviews();
  }, [user]);

  const handleDownload = async () => {
  if (!user) {
    alert("Please login to download videos");
    return;
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/download/${video._id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          title: video.videotitle,
          filepath: video.filepath,
        }),
      }
    );

    if (res.status === 403) {
      const data = await res.json();
      alert(data.message);
      return;
    }

    if (!res.ok) {
      alert("Download failed");
      return;
    }
    window.location.href = `${process.env.NEXT_PUBLIC_BACKEND_URL}/download/${video._id}?email=${user.email}&title=${video.videotitle}&filepath=${video.filepath}`;
  } catch (error) {
    console.error(error);
    alert("Download error");
  }
};

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
  {video.videotitle}
</h1>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="w-10 h-10">
            <AvatarFallback>{video.videochanel[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{video.videochanel}</h3>
            <p className="text-sm text-[color:var(--text-muted)]">
  1.2M subscribers
</p>
          </div>
          <Button className="ml-4 bg-red-600 text-white hover:bg-red-700">Subscribe</Button>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-gray-100 rounded-full">
            <Button
              variant="ghost"
              size="sm"
              className="
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
"
              onClick={handleLike}
            >
              <ThumbsUp
                className={`w-5 h-5 mr-2 ${
                  isLiked ? "fill-black text-black" : ""
                }`}
              />
              {likes.toLocaleString()}
            </Button>
            <div className="w-px h-6 bg-gray-300" />
            <Button
              variant="ghost"
              size="sm"
              className="
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
"
              onClick={handleDislike}
            >
              <ThumbsDown
                className={`w-5 h-5 mr-2 ${
                  isDisliked ? "fill-black text-black" : ""
                }`}
              />
              {dislikes.toLocaleString()}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className={`
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
 ${
              isWatchLater ? "text-primary" : ""
            }`}
            onClick={handleWatchLater}
          >
            <Clock className="w-5 h-5 mr-2" />
            {isWatchLater ? "Saved" : "Watch Later"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
"
          >
            <Share className="w-5 h-5 mr-2" />
            Share
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
"
            onClick={handleDownload}
          >
            <Download className="w-5 h-5 mr-2" />
            Download
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="
  rounded-full
  bg-[color:var(--bg-surface)]
  text-[color:var(--text-primary)]
  hover:bg-gray-200
  dark:hover:bg-gray-800
"
          >
            <MoreHorizontal className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <div className="rounded-lg p-4 bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
  <div className="flex gap-4 text-sm font-medium mb-2 text-[color:var(--text-muted)]">
    <span>{video.views.toLocaleString()} views</span>
    <span>{formatDistanceToNow(new Date(video.createdAt))} ago</span>
  </div>
  <p>
    Sample video description. This would contain the actual video description
    from the database.
  </p>
</div>
      <Button
        variant="ghost"
        size="sm"
        className="mt-2 p-0 h-auto font-medium"
      ></Button>
    </div>
  );
};

export default VideoInfo;
