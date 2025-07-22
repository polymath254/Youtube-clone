import React, { useState, useEffect } from "react";
import io from "socket.io-client";

// Connect to your real-time server (adjust if not localhost or port 5000)
const socket = io("http://localhost:5000");

export default function RealtimeComments() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);

  useEffect(() => {
    socket.on("receive_comment", (data) => {
      setComments((prev) => [...prev, data]);
    });

    // Clean up on unmount
    return () => {
      socket.off("receive_comment");
    };
  }, []);

  const sendComment = () => {
    if (comment.trim()) {
      setComments((prev) => [...prev, { text: comment, you: true }]);
      socket.emit("send_comment", { text: comment });
      setComment("");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", border: "1px solid #aaa", borderRadius: 8, padding: 20 }}>
      <h2>Live Comments</h2>
      <div style={{ minHeight: 100, marginBottom: 10, background: "#fafafa", padding: 10 }}>
        {comments.map((c, idx) => (
          <div key={idx} style={{ textAlign: c.you ? "right" : "left", color: c.you ? "green" : "#333" }}>
            {c.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Type a comment…"
        style={{ width: "70%", marginRight: 10 }}
      />
      <button onClick={sendComment}>Send</button>
    </div>
  );
}
