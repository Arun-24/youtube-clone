import { useUser } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const DownloadsPage = () => {
  const { user } = useUser() as any;

  if (!user) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">
          Please sign in to view your downloads
        </h2>
      </div>
    );
  }

  if (!user.downloads || user.downloads.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">No downloads yet</h2>
        <p className="text-gray-500 mt-2">
          Videos you download will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Your Downloads</h1>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {user.downloads.map((video: any, index: number) => (
          <div
            key={index}
            className="flex gap-4 border rounded-lg p-4 transition hover:shadow-md hover:bg-gray-50"
          >
            <div className="w-40 h-24 flex-shrink-0 bg-gray-200 rounded overflow-hidden">
              <video
            src={`${process.env.BACKEND_URL}/${video?.filepath}`}
            className="object-cover group-hover:scale-105 transition-transform duration-200"
          />
            </div>
            <div className="flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-medium line-clamp-2">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Downloaded{" "}
                  {formatDistanceToNow(new Date(video.downloadedAt))} ago
                </p>
              </div>
              <div className="mt-3">
                <Link href={`/watch/${video.videoId}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-gray-200 hover:text-black transition"
                  >
                    Watch
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadsPage;
