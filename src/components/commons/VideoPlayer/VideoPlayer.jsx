import React, {useEffect, useRef, useState} from 'react';
import VideoControls from "./VideoControls";
import {Button, Slider, IconButton} from '@mui/material';
import {Close} from "@mui/icons-material";
import {setupFPSCalculation} from "./FPSCalculator";
import {CanvasDrawer} from "./CanvasDrawer";

const VideoPlayer = ({
                         videoRef,
                         fps,
                         fpsCallback,
                         boundingBoxes,
                         persons,
                         setVideoReady,
                         videoURL,
                         setVideoURL,
                         fileName,
                         setFileName,
                         setVideoData,
                         screen,
                         taskBoxes,
                         setTaskBoxes,
                         landMarks,
                         setLandMarks,
                         selectedTask,
                         postVideoLoad,
                         frameOffset
                     }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const canvasRef = useRef(null);
    const canvasDrawerInstance = useRef(null);
    const [currentFrame, setCurrentFrame] = useState(0);

    useEffect(() => {
        if (canvasRef.current && !canvasDrawerInstance.current) {
            canvasDrawerInstance.current = new CanvasDrawer(videoRef.current, canvasRef.current, boundingBoxes, fps, persons, zoomLevel, screen, taskBoxes, setTaskBoxes, selectedTask, landMarks, setLandMarks, frameOffset);
        }
    }, [videoRef, boundingBoxes, fps]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updatePersons(persons);
        }
    }, [persons]);

    useEffect(() => {
        if (canvasDrawerInstance.current)
            canvasDrawerInstance.current.updateSetLandMarks(setLandMarks);
    }, [setLandMarks]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateLandMarks(landMarks);
        }
    }, [landMarks]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateTaskBoxes(taskBoxes);
        }
    }, [taskBoxes]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateFrameOffset(frameOffset);
        }
    })

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateBoundingBoxes(boundingBoxes);
        }
    }, [boundingBoxes]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.handleZoom(zoomLevel);
        }
    }, [zoomLevel]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateSelectedTask(selectedTask);
        }
    }, [selectedTask]);

    useEffect(() => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.updateFPS(fps);
        }
    }, [fps]);


    const updateFrameNumber = () => {
        if (videoRef && videoRef.current) {
            const currentTime = videoRef.current.currentTime;
            const frameNumber = Math.round(fps * currentTime);

            setCurrentFrame(frameNumber);
        }

    }

    useEffect(() => {

    }, [currentFrame]);

    useEffect(() => {

        if (videoRef && videoRef.current)
            videoRef.current.addEventListener("timeupdate", updateFrameNumber);

        return () => {
            if (videoRef && videoRef.current)
                videoRef.current.removeEventListener("timeupdate", updateFrameNumber);
        }
    });

    const handleVideoUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            setVideoData(file);
            setFileName(file.name);
            const videoUrl = URL.createObjectURL(file);
            setVideoURL(videoUrl);
        }
    };


    const drawFrames = (now, metadata) => {

        if (now === null || metadata === null)
            return;

        canvasDrawerInstance.current = new CanvasDrawer(videoRef.current, canvasRef.current, boundingBoxes, fps, persons, zoomLevel, screen, taskBoxes, setTaskBoxes, selectedTask, landMarks, setLandMarks, frameOffset);

        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;

        const onFrame = (now, metadata) => {
            if (now === null || metadata === null)
                return;

            if (videoRef.current) {
                canvasDrawerInstance.current.drawFrame(videoRef.current.currentTime);
                videoRef.current.requestVideoFrameCallback(onFrame);
            }
        };

        canvasDrawerInstance.current.drawFrame(videoRef.current.currentTime);
        videoRef.current.requestVideoFrameCallback(onFrame);
    }

    const onVideoLoad = () => {
        videoRef.current.requestVideoFrameCallback(drawFrames);
        setVideoReady(true);
        if (postVideoLoad)
            postVideoLoad();
    }

    const resetVideo = () => {
        setVideoURL('');
        setFileName('');
        setIsPlaying(false);
        setVideoReady(false);
        videoRef.current.remove();
    }

    const handleDragStart = (event) => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.handleDragStart(event);
        }
    }

    const handleMouseMove = (event) => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.handleMouseMove(event);
        }
    }

    const handleMouseUp = (event) => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.handleMouseUp(event);
        }
    }

    const handleMouseDown = (event) => {
        if (canvasDrawerInstance.current) {
            canvasDrawerInstance.current.handleMouseDown(event);
        }
    }

    const getTotalFrameCount = () => {
        if (videoRef && videoRef.current) {
            const duration = videoRef.current.duration;
            return Math.round(fps * duration);
        }

        return 0;
    }

    return (
        <div className="flex flex-col gap-4 p-4 justify-center items-center bg-gray-200 w-full h-full">
            {videoURL === '' && (
                <label>
                    <input
                        type="file"
                        accept="video/*"
                        className="opacity-0"
                        onChange={handleVideoUpload}
                    />
                    <div
                        className="p-4 rounded border border-dashed border-gray-400 hover:border-gray-500 transition-all">
                        <Button variant="contained" component="span" title="Upload a video">
                            Upload Video
                        </Button>
                    </div>
                </label>
            )}

            {videoURL !== '' && (
                <div className={"flex h-full items-center px-10 w-full gap-2"}>
                    <div className={"h-full w-full flex flex-col gap-2 items-center"}>
                        <div className="w-full flex justify-between items-center">
                            <div className="flex justify-center items-center flex-grow">
                                <div className="flex items-center justify-center">
                                    <div className="text-lg font-semibold">{fileName}</div>
                                    <IconButton color={"error"} onClick={resetVideo} title="Close Video">
                                        <Close/>
                                    </IconButton>
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input className="w-1/4" type="number" value={currentFrame}/>
                                <div>/</div>
                                <div>{getTotalFrameCount()}</div>
                            </div>
                        </div>


                        <div className={"flex h-full w-full items-center px-10"}>
                            <div className="w-full h-full relative overflow-hidden">
                                <video
                                    src={videoURL}
                                    className="absolute top-0 left-0 w-full h-full"
                                    ref={videoRef}
                                    style={{
                                        objectFit: 'contain',
                                        width: '100%',
                                        height: '100%'
                                    }}
                                    onLoadedMetadata={onVideoLoad}
                                    onPlay={() => {
                                        setIsPlaying(true);
                                    }}
                                    onPause={() => {
                                        setIsPlaying(false);
                                    }}
                                    loop
                                    // controls
                                />
                                <canvas
                                    className="absolute w-auto h-full cursor-auto"
                                    style={{
                                        objectFit: "contain",
                                        width: "100%",
                                        height: "100%",
                                        transform: `scale(${zoomLevel})`
                                    }}
                                    ref={canvasRef}
                                    onDrag={handleDragStart}
                                    onMouseDown={handleMouseDown}
                                    onMouseMove={handleMouseMove}
                                    onMouseUp={handleMouseUp}
                                />
                            </div>


                        </div>
                        <VideoControls videoRef={videoRef} isPlaying={isPlaying} fps={fps}/>

                    </div>
                    <div className={"flex flex-col items-center gap-4 "}>
                        <Slider
                            orientation="vertical"
                            min={1}
                            max={10}
                            step={0.1}
                            value={zoomLevel}
                            onChange={(e) => {
                                setZoomLevel(e.target.value);
                            }}
                            aria-labelledby="Zoom"
                            style={{height: 200}}
                            valueLabelDisplay={"on"}
                            valueLabelFormat={(value) => value + "x"}
                        />
                        <div className={"font-semibold"}>Zoom</div>
                        <button
                            className={"p-2 bg-gray-800 text-white rounded-md"}
                            onClick={() => {
                                setZoomLevel(1);
                                // setZoomLevel(1);
                                videoRef.current.style.left = "0px";
                                videoRef.current.style.top = "0px";

                                canvasRef.current.style.left = "0px";
                                canvasRef.current.style.top = "0px";
                            }}
                        >
                            Reset
                        </button>
                    </div>

                </div>
            )}
        </div>
    );
};

export default VideoPlayer;