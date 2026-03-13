import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@/lib/AuthContext";
import axiosInstance from "@/lib/axiosinstance";

interface Comment {
  _id: string;
  videoid: string;
  userid: string;
  commentbody: string;
  usercommented: string;
  commentedon: string;
  city?: string;
  dislikes?: number;
}

const Comments = ({ videoId }: any) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [translatedText, setTranslatedText] = useState<Record<string, string>>({});
  const { user } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async () => {
    try {
      const res = await axiosInstance.get(`/comment/${videoId}`);
      setComments(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-gray-500 dark:text-gray-400">
        Loading comments...
      </div>
    );
  }

  /* ---------------- SUBMIT COMMENT ---------------- */

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);

    try {
      // Fetch user city
      const locationRes = await fetch("https://ipapi.co/json/");
      const locationData = await locationRes.json();

      const res = await axiosInstance.post("/comment/postcomment", {
        videoid: videoId,
        userid: user._id,
        commentbody: newComment,
        usercommented: user.name,
        city: locationData.city,
      });

      if (res.data.comment) {
        setComments([
          {
            _id: Date.now().toString(),
            videoid: videoId,
            userid: user._id,
            commentbody: newComment,
            usercommented: user.name || "Anonymous",
            commentedon: new Date().toISOString(),
            city: locationData.city,
            dislikes: 0,
          },
          ...comments,
        ]);
      }

      setNewComment("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------------- TRANSLATE ---------------- */

  const translateComment = async (text: string, id: string) => {
    try {
      const res = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      const data = await res.json();
      setTranslatedText((prev) => ({
        ...prev,
        [id]: data[0][0][0],
      }));
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- DISLIKE ---------------- */

  const handleDislike = async (id: string) => {
    try {
      const res = await axiosInstance.post(`/comment/dislikecomment/${id}`);

      if (res.data.removed) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      } else {
        setComments((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, dislikes: (c.dislikes || 0) + 1 }
              : c
          )
        );
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.commentbody);
  };

  const handleUpdateComment = async () => {
    if (!editText.trim()) return;

    try {
      const res = await axiosInstance.post(
        `/comment/editcomment/${editingCommentId}`,
        { commentbody: editText }
      );

      if (res.data) {
        setComments((prev) =>
          prev.map((c) =>
            c._id === editingCommentId
              ? { ...c, commentbody: editText }
              : c
          )
        );
        setEditingCommentId(null);
        setEditText("");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await axiosInstance.delete(`/comment/deletecomment/${id}`);
      if (res.data.comment) {
        setComments((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (error) {
      console.log(error);
    }
  };

  /* ---------------- UI ---------------- */

  return (
  <div className="space-y-6">

    {/* COMMENT HEADING */}

    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
      {comments.length} Comments
    </h2>


    {/* COMMENT INPUT */}

    {user && (
      <div className="flex gap-4">

        <Avatar className="w-10 h-10">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-2">

          <Textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="
              min-h-[80px]
              resize-none
              border
              rounded-lg
              p-3
              bg-white
              text-gray-900
              border-gray-300
              placeholder-gray-500
              dark:bg-gray-800
              dark:text-gray-100
              dark:border-gray-600
              dark:placeholder-gray-400
            "
          />

          <div className="flex gap-2 justify-end">

            <Button
              variant="ghost"
              onClick={() => setNewComment("")}
              disabled={!newComment.trim()}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              Comment
            </Button>

          </div>

        </div>

      </div>
    )}


    {/* COMMENT LIST */}

    <div className="space-y-5">

      {comments.length === 0 ? (

        <p className="text-sm italic text-gray-500 dark:text-gray-400">
          No comments yet.
        </p>

      ) : (

        comments.map((comment) => (

          <div
            key={comment._id}
            className="
              flex gap-4
              p-4
              rounded-lg
              bg-gray-100
              border border-gray-200
              dark:bg-gray-900
              dark:border-gray-700
            "
          >

            <Avatar className="w-10 h-10">
              <AvatarImage src="/placeholder.svg?height=40&width=40" />
              <AvatarFallback>
                {comment.usercommented[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">

              {/* USER INFO */}

              <div className="flex items-center gap-2 mb-1 flex-wrap">

                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {comment.usercommented}
                </span>

                {comment.city && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    • {comment.city}
                  </span>
                )}

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.commentedon))} ago
                </span>

              </div>


              {/* COMMENT TEXT */}

              <p className="text-sm text-gray-800 dark:text-gray-200">
                {comment.commentbody}
              </p>


              {/* TRANSLATED TEXT */}

              {translatedText[comment._id] && (
                <p className="text-sm mt-1 text-blue-600 dark:text-blue-400">
                  {translatedText[comment._id]}
                </p>
              )}


              {/* COMMENT ACTIONS */}

              <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">

                <button
                  className="hover:underline"
                  onClick={() =>
                    translateComment(comment.commentbody, comment._id)
                  }
                >
                  Translate
                </button>

                <button
                  className="hover:underline"
                  onClick={() => handleDislike(comment._id)}
                >
                  Dislike ({comment.dislikes || 0})
                </button>

                {comment.userid === user?._id && (
                  <>
                    <button
                      className="hover:underline"
                      onClick={() => handleEdit(comment)}
                    >
                      Edit
                    </button>

                    <button
                      className="hover:underline text-red-500"
                      onClick={() => handleDelete(comment._id)}
                    >
                      Delete
                    </button>
                  </>
                )}

              </div>

            </div>

          </div>

        ))

      )}

    </div>

  </div>
);
};

export default Comments;