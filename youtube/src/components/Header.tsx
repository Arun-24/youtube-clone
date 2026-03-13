import React, { useState } from "react";
import { Bell, Menu, Mic, Search, User, VideoIcon } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Channeldialogue from "./channeldialogue";
import router, { useRouter } from "next/router";
import { useUser } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";

const Header = () => {
  const { user, logout, handlegooglesignin } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [isdialogeopen, setisdialogeopen] = useState(false);
  const router = useRouter();
  const { theme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch(e as any);
    }
  };

  const { otpRequired, otpValue, setOtpValue, verifyOtp, otpChannel } =
    useUser() as any;

  return (
    <header className="flex items-center justify-between px-4 py-2 border-b bg-[color:var(--bg-surface)] text-[color:var(--text-primary)]">

      {/* THEME STATUS */}
      <span className="text-xs text-gray-500 mr-2">
        {theme === "light" ? "Light mode" : "Dark mode"}
      </span>

      {/* OTP MODAL */}
      {otpRequired && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h2 className="text-lg font-semibold mb-2">Verify OTP</h2>
            <p className="text-sm text-gray-600 mb-3">
              OTP sent to your {otpChannel === "email" ? "email" : "mobile number"}
            </p>
            <input
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              className="w-full border px-3 py-2 rounded mb-4"
              placeholder="Enter OTP"
            />
            <Button
              className="w-full"
              disabled={otpValue.length !== 6}
              onClick={verifyOtp}
            >
              Verify
            </Button>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-digit OTP shown in console
            </p>
          </div>
        </div>
      )}

      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Menu className="w-6 h-6" />
        </Button>

        <Link href="/" className="flex items-center gap-1">
          <div className="bg-red-600 p-1 rounded">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </div>
          <span className="text-xl font-medium">YouTube</span>
          <span className="text-xs text-gray-400 ml-1">IN</span>
        </Link>
      </div>

      {/* SEARCH BAR */}
      <form
        onSubmit={handleSearch}
        className="flex items-center gap-2 flex-1 max-w-2xl mx-4"
      >
        <div className="flex flex-1">
          <Input
            type="search"
            placeholder="Search"
            value={searchQuery}
            onKeyPress={handleKeypress}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-l-full border-r-0 focus-visible:ring-0"
          />
          <Button
            type="submit"
            className="rounded-r-full px-6 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-l-0"
          >
            <Search className="w-5 h-5" />
          </Button>
        </div>

        <Button variant="ghost" size="icon" className="rounded-full">
          <Mic className="w-5 h-5" />
        </Button>
      </form>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            {/* VIDEO CALL NAVIGATION */}
            <Link href="/videocall">
              <Button
                variant="ghost"
                size="icon"
                title="Start Video Call"
                className="hover:bg-gray-200 dark:hover:bg-gray-800 transition"
              >
                <VideoIcon className="w-6 h-6" />
              </Button>
            </Link>

            <Button variant="ghost" size="icon">
              <Bell className="w-6 h-6" />
            </Button>

            {/* PROFILE MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} />
                    <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>

                {/* CHANNEL */}
                {user?.channelname ? (
                  <DropdownMenuItem asChild>
                    <Link href={`/channel/${user?._id}`}>Your channel</Link>
                  </DropdownMenuItem>
                ) : (
                  <div className="px-2 py-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => setisdialogeopen(true)}
                    >
                      Create Channel
                    </Button>
                  </div>
                )}

                {/* VIDEO CALL MENU OPTION */}
                <DropdownMenuItem onClick={() => router.push("/videocall")}>
                  Start Video Call
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/history">History</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/liked">Liked videos</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/watch-later">Watch later</Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/download">Downloads</Link>
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                  Upgrade Plan
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={logout}>
                  Sign out
                </DropdownMenuItem>

              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button
            className="flex items-center gap-2"
            onClick={handlegooglesignin}
          >
            <User className="w-4 h-4" />
            Sign in
          </Button>
        )}
      </div>

      {/* CREATE CHANNEL DIALOG */}
      <Channeldialogue
        isopen={isdialogeopen}
        onclose={() => setisdialogeopen(false)}
        mode="create"
      />
    </header>
  );
};

export default Header;