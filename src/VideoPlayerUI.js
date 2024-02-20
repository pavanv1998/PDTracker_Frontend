// VideoPlayerUI.js
import React, { useState } from "react";
import ReactPlayer from "react-player";

const VideoPlayerUI = ({ videoUrl, videoPlayerRef }) => {
    const [playing, setPlaying] = useState(false);

    const handlePlay = () => {
        setPlaying(true);
    };

    const handlePause = () => {
        setPlaying(false);
    };

    return (
        <div className="flex w-1/2 align-middle justify-center p-10">
            <ReactPlayer
                ref={videoPlayerRef}
                url={videoUrl}
                controls
                playing={playing}
                width="40%"
                height="auto"
                className="rounded-lg"
                onPlay={handlePlay}
                onPause={handlePause}
            />
        </div>
    );
};

export default VideoPlayerUI;
