import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL as string);

export default function index() {

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);

  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [joinRequest, setJoinRequest] = useState<any>(null);

  /* ---------------- START CAMERA ---------------- */

  const startLocalStream = async () => {

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localStream.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
    }

  };

  /* ---------------- CREATE MEETING ---------------- */

  const generateMeetingCode = async () => {

    const letters = "abcdefghijklmnopqrstuvwxyz";

    const part1 = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");

    const part2 = Array.from({ length: 3 }, () =>
      letters[Math.floor(Math.random() * letters.length)]
    ).join("");

    const code = `yt-${part1}-${part2}`;

    setRoomId(code);
    setIsHost(true);

    socket.emit("create-room", code);

    await startLocalStream();

    socket.emit("join-room", code);

    setJoined(true);

  };

  /* ---------------- REQUEST JOIN ---------------- */

  const requestJoin = async () => {

    if (!roomId) return;

    await startLocalStream();

    socket.emit("request-join", { roomId });

    setWaiting(true);

  };

  /* ---------------- HOST APPROVE ---------------- */

  const approveJoin = () => {

    socket.emit("approve-join", joinRequest);

    setJoinRequest(null);

  };

  /* ---------------- PEER CONNECTION ---------------- */

  const createPeer = () => {

    peerConnection.current = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    localStream.current?.getTracks().forEach((track) => {
      peerConnection.current?.addTrack(track, localStream.current as MediaStream);
    });

    peerConnection.current.ontrack = (event) => {

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }

    };

    peerConnection.current.onicecandidate = (event) => {

      if (event.candidate) {

        socket.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });

      }

    };

  };

  /* ---------------- HOST CREATE OFFER ---------------- */

  const createOffer = async () => {

    if (!peerConnection.current) createPeer();

    const offer = await peerConnection.current!.createOffer();

    await peerConnection.current!.setLocalDescription(offer);

    socket.emit("offer", { roomId, offer });

  };

  /* ---------------- SOCKET EVENTS ---------------- */

  useEffect(() => {

    socket.on("join-request", (data) => {

      if (isHost) {
        setJoinRequest(data);
      }

    });

    socket.on("join-approved", async (roomId) => {

      setWaiting(false);

      socket.emit("join-room", roomId);

      setJoined(true);

      createPeer();

    });

    socket.on("user-joined", async () => {

      if (isHost) {
        await createOffer();
      }

    });

    socket.on("offer", async (offer) => {

      if (!peerConnection.current) createPeer();

      await peerConnection.current!.setRemoteDescription(offer);

      const answer = await peerConnection.current!.createAnswer();

      await peerConnection.current!.setLocalDescription(answer);

      socket.emit("answer", { roomId, answer });

    });

    socket.on("answer", async (answer) => {

      await peerConnection.current?.setRemoteDescription(answer);

    });

    socket.on("ice-candidate", async (candidate) => {

      try {
        await peerConnection.current?.addIceCandidate(candidate);
      } catch (err) {
        console.log(err);
      }

    });

  }, [roomId, isHost]);

  /* ---------------- COPY CODE ---------------- */

  const copyCode = () => {

    navigator.clipboard.writeText(roomId);

    alert("Meeting code copied!");

  };

  /* ---------------- LEAVE CALL ---------------- */

  const leaveCall = () => {

    peerConnection.current?.close();

    socket.disconnect();

    window.location.reload();

  };

  /* ---------------- UI ---------------- */

  return (

    <div className="max-w-6xl mx-auto p-6 text-gray-900 dark:text-gray-100">

      <h1 className="text-3xl font-bold text-center mb-6">
        YouTube Video Meeting
      </h1>

      {/* MEETING CONTROLS */}
      {!joined && (

        <div className="flex gap-3 mb-6">

          <button
            onClick={generateMeetingCode}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Create Meeting
          </button>

          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter meeting code"
            className="border px-3 py-2 rounded flex-1 bg-white dark:bg-gray-800"
          />

          {!isHost && (
            <button
              onClick={requestJoin}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Request to Join
            </button>
          )}

        </div>

      )}

      {/* WAITING MESSAGE */}
      {waiting && (
        <p className="text-yellow-500 mb-4">
          Waiting for host to admit you...
        </p>
      )}

      {/* MEETING CODE DISPLAY */}
      {isHost && roomId && (
        <div className="mb-6 p-3 rounded-lg bg-gray-200 dark:bg-gray-800 flex items-center justify-between">
          <span className="font-medium">
            Meeting Code: {roomId}
          </span>

          <button
            onClick={copyCode}
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded"
          >
            Copy
          </button>
        </div>
      )}

      {/* HOST ADMIT POPUP */}
      {joinRequest && (

        <div className="bg-gray-200 dark:bg-gray-800 p-4 rounded mb-6">

          <p>User wants to join the meeting</p>

          <button
            onClick={approveJoin}
            className="bg-green-600 text-white px-3 py-1 rounded mt-2"
          >
            Admit
          </button>

        </div>

      )}

      {/* VIDEO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-full rounded-lg bg-black"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full rounded-lg bg-black"
        />

      </div>

      {/* LEAVE BUTTON */}
      {joined && (

        <div className="flex justify-center mt-6">

          <button
            onClick={leaveCall}
            className="bg-red-600 text-white px-4 py-2 rounded-full"
          >
            Leave Call
          </button>

        </div>

      )}

    </div>

  );

}