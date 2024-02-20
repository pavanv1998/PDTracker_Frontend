import {Pause, PlayArrow} from "@mui/icons-material";
import React, {useEffect, useState} from "react";

const VideoControls = ({videoRef, isPlaying, fps}) => {
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        console.log("Flag has changed to " + flag);
    }, [flag]);

    const checkVideoLoaded = () => {
        if (!videoRef.current) {
            console.error("Video reference not found.");
            return false;
        }

        if (videoRef.current.error) {
            console.error("Video failed to load due to an error:", videoRef.current.error.message);
            return false;
        }

        if (!videoRef.current.src && !videoRef.current.currentSrc) {
            console.error("No video source is set.");
            return false;
        }

        if (videoRef.current.readyState === 4) {
            return true;
        } else {
            console.warn("Video is not fully loaded yet. Current state:", videoRef.current.readyState);
            return false;
        }
    }

    const playOrPause = () => {

        if (checkVideoLoaded()) {
            if (videoRef.current.paused)
                videoRef.current.play();
            else
                videoRef.current.pause();
        }
    }

    const changeVideoTime = (offset) => {
        if (checkVideoLoaded())
            videoRef.current.currentTime = videoRef.current.currentTime + offset;
    }

    const changeVideoFrame = (offset) => {
        if (checkVideoLoaded()){
            const timeOffset = offset/fps;
            changeVideoTime(timeOffset);
        }
    }

    const handleKey = (event) => {
        const video = videoRef.current;

        if (!video) return;

        switch (event.key) {
            case 'ArrowRight':
                // setFlag(true);
                changeVideoFrame(1);
                break;
            case 'ArrowLeft':
                changeVideoFrame(-1);
                break;
            case 'ArrowUp':
                changeVideoFrame(5);
                break;
            case 'ArrowDown':
                changeVideoFrame(-5);
                break;

            case ' ':
                playOrPause();
                event.preventDefault();
                break;
            default:
                break;
        }
    };

    const handleKeyUp = (event) => {
       if (event.key === 'ArrowRight')
           setFlag(false);
    }

    useEffect(() => {
        window.addEventListener('keydown', handleKey);
        // window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKey);
            // window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return (
        <div className={"flex gap-4 text-2xl items-center"}>
            <button onClick={() => {
                changeVideoFrame(-5);
            }}>
                -5
            </button>
            <button onClick={() => {
                changeVideoFrame(-1);
            }}>
                -1
            </button>
            {
                isPlaying ? <Pause className="cursor-pointer" onClick={playOrPause}/> :
                    <PlayArrow className="cursor-pointer" onClick={playOrPause}/>
            }
            <button onClick={() => {
                changeVideoFrame(1);
            }}>
                +1
            </button>
            <button onClick={() => {
                changeVideoFrame(5);
            }}>+5
            </button>
        </div>
    );
}

export default VideoControls;