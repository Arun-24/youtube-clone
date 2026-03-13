import { useRef, useEffect, useState } from "react";
import { useUser } from "@/lib/AuthContext";

export default function VideoPlayer({ video }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const [gestureFeedback, setGestureFeedback] = useState<{
    text: string;
    position: "LEFT" | "CENTER" | "RIGHT";
  } | null>(null);

  const showFeedback = (
    text: string,
    position: "LEFT" | "CENTER" | "RIGHT",
  ) => {
    setGestureFeedback({ text, position });
    setTimeout(() => setGestureFeedback(null), 600);
  };
  const tapTimeout = useRef<NodeJS.Timeout | null>(null);
  const tapCount = useRef(0);

  const getTapRegion = (x: number, width: number) => {
    if (x < width * 0.3) return "LEFT";
    if (x > width * 0.7) return "RIGHT";
    return "CENTER";
  };

  const { user } = useUser() as any;
  const videos = "/video/vdo.mp4";

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (user?.watchTimeLimit === null) return;

    const maxWatchTime = user?.watchTimeLimit ?? 300;

    const handleTimeUpdate = () => {
      if (videoElement.currentTime >= maxWatchTime) {
        videoElement.pause();

        const goToUpgrade = window.confirm(
          "Your watch-time limit is over. Do you want to upgrade your plan?",
        );

        if (goToUpgrade) {
          window.location.href = "/upgrade";
        }
      }
    };

    videoElement.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [user, video]);

  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const region = getTapRegion(e.clientX - rect.left, rect.width);

    tapCount.current += 1;

    if (tapTimeout.current) {
      clearTimeout(tapTimeout.current);
    }

    tapTimeout.current = setTimeout(() => {
      if (tapCount.current === 1 && region === "CENTER") {
        if (video.paused) {
          video.play();
          showFeedback("▶ Playing", "CENTER");
        } else {
          video.pause();
          showFeedback("⏸ Paused", "CENTER");
        }
      }
      if (tapCount.current === 2) {
        if (region === "RIGHT") {
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          showFeedback("⏩ +10s", "RIGHT");
        }
        if (region === "LEFT") {
          video.currentTime = Math.max(0, video.currentTime - 10);
          showFeedback("⏪ -10s", "LEFT");
        }
      }

      tapCount.current = 0;
    }, 300);
  };

  return (
    <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        poster={`/placeholder.svg?height=480&width=854`}
      >
        <source
          src={`${process.env.BACKEND_URL}/${video?.filepath}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {gestureFeedback && (
        <div
          className={`absolute inset-0 z-20 flex items-center ${
            gestureFeedback.position === "LEFT"
              ? "justify-start pl-10"
              : gestureFeedback.position === "RIGHT"
                ? "justify-end pr-10"
                : "justify-center"
          }`}
        >
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-lg font-medium animate-fade">
            {gestureFeedback.text}
          </div>
        </div>
      )}
      <div className="absolute inset-0 z-10" onPointerDown={handleTap} />
    </div>
  );
}
