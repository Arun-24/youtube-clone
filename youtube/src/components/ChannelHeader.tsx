import React, { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

const ChannelHeader = ({ channel, user }: any) => {
  const [isSubscribed, setIsSubscribed] = useState(false);

  return (
    <div className="w-full text-[color:var(--text-primary)]">
      {/* Banner */}
      <div className="relative h-32 md:h-48 lg:h-64 bg-gradient-to-r from-blue-400 to-purple-500 overflow-hidden" />

      <div className="px-4 py-6">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Avatar */}
          <Avatar className="w-20 h-20 md:w-32 md:h-32">
            <AvatarFallback className="text-2xl bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">
              {channel?.channelname?.[0]}
            </AvatarFallback>
          </Avatar>

          {/* Channel Info */}
          <div className="flex-1 space-y-2">
            <h1 className="text-2xl md:text-4xl font-bold">
              {channel?.channelname}
            </h1>

            <div className="flex flex-wrap gap-4 text-sm text-[color:var(--text-muted)]">
              <span>
                @{channel?.channelname
                  ?.toLowerCase()
                  .replace(/\s+/g, "")}
              </span>
            </div>

            {channel?.description && (
              <p className="text-sm max-w-2xl text-[color:var(--text-secondary)]">
                {channel.description}
              </p>
            )}
          </div>

          {/* Subscribe Button */}
          {user && user?._id !== channel?._id && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsSubscribed(!isSubscribed)}
                variant={isSubscribed ? "outline" : "default"}
                className={
                  isSubscribed
                    ? `
                        bg-[color:var(--bg-surface)]
                        text-[color:var(--text-primary)]
                        border border-[color:var(--border-color)]
                        hover:bg-gray-200 dark:hover:bg-gray-800
                      `
                    : `
                        bg-red-600 text-white
                        hover:bg-red-700
                      `
                }
              >
                {isSubscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelHeader;
