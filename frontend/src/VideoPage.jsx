import React from "react";
import RealtimeComments from "./RealtimeComments";

export default function VideoPage() {
  const videoId = 1; // Use dynamic IDs in real app

  return (
    <div>
      <h1>Video Player for Video #{videoId}</h1>
      <RealtimeComments videoId={videoId} />
    </div>
  );
}
