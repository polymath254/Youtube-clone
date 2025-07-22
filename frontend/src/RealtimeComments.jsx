import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import "./RealtimeComments.css";

// Get username from localStorage or fallback
function getUsername() {
  return localStorage.getItem("username") || "Anonymous";
}

export default function RealtimeComments({ videoId }) {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const username = getUsername();

  // Create a socket connection once per component instance
  const [socket] = useState(() => io("http://localhost:5000"));

  useEffect(() => {
    if (!videoId) return;

    // Join the room for this video
    socket.emit("join_video_room", { video: videoId });

    // Listen for incoming comments for this video
    const handleReceiveComment = (data) => {
      if (data.video === videoId) {
        setComments((prev) => [...prev, data]);
      }
    };

    socket.on("receive_comment", handleReceiveComment);

    // Cleanup on unmount or when videoId changes
    return () => {
      socket.emit("leave_video_room", { video: videoId });
      socket.off("receive_comment", handleReceiveComment);
    };
  }, [videoId, socket]);

  const sendComment = () => {
    if (comment.trim() && videoId && username) {
      const data = {
        text: comment,
        user: username,
        video: videoId,
      };
      setComments((prev) => [...prev, { ...data, you: true }]);
      socket.emit("send_comment", data);
      setComment("");
    }
  };

  return (
    <div className="live-comments-container">
      <h2>Live Comments</h2>
      <div className="comments-list">
        {comments.map((c, idx) => (
          <div
            key={idx}
            className={c.you ? "comment-you" : "comment-other"}
          >
            <span style={{ fontWeight: "bold" }}>
              {c.you ? "You" : c.user}:
            </span>{" "}
            {c.text}
          </div>
        ))}
      </div>
      <div className="comment-input-row">
        <input
          type="text"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Type a comment…"
          disabled={!videoId}
        />
        <button onClick={sendComment} disabled={!videoId || !comment.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}
