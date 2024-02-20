import React, { useEffect, useRef, useState } from "react";
import "./VideoAnalysis.css";
import { ZoomIn, ZoomOut, PlayArrow, Pause, RestartAlt } from "@mui/icons-material";
import TimelinePlugin from "wavesurfer.js/plugins/timeline";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/plugins/regions";
import BoundingBoxData from "./boundingBoxes";
import frameBoxes from "./framesToBoxes";
import { green } from "@mui/material/colors";
import JSONUploadDialog from "./JSONUploadDialog";
const VideoAnalysis = () => {
    const [zoomLevel, setZoomLevel] = useState(1);
    const [videoWidth, setVideoWidth] = useState(50);
    const [videoURL, setVideoURL] = useState("");
    const videoRef = useRef(null);
    const loadButtonRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [waveLoading, setWaveLoading] = useState(false);
    const [waveSurfer, setWaveSurfer] = useState(null)
    const [surferTimeline, setSurferTimeline] = useState(null);
    const [wsRegions, setWsRegions] = useState(null);
    const [videoStyle, setVideoStyle] = useState({});
    const [clearStyle, setClearStyle] = useState({});
    const [estimatedFPS, setEstimatedFPS] = useState(0.0);
    const [currentBox, setCurrentBox] = useState(null);
    const [isResizing, setIsResizing] = useState(false);
    const [hoverDetails, setHoverDetails] = useState(null);
    const [boundingBoxes, setBoundingBoxes] = useState(BoundingBoxData);
    const [frameBoundingBoxes, setFrameBoundingBoxes] = useState([]);
    const [showDetails, setShowDetails] = useState(null);
    const [isRegionsScreen, setIsRegionsScreen] = useState(false);

    const [openJsonUpload, setOpenJsonUpload] = useState(false);
    const [jsonParserAvailable, setJsonParserAvailable] = useState(false);

    const canvasRef = useRef(null);
    const estimatedFPSRef = useRef(null);

    const currentFrameNumber = useRef(0);

    const [subjectToFrameMap, setSubjectToFrameMap] = useState(new Map());

    const [regions, setRegions] = useState([
        {
            start: 0,
            end: 10,
            name: "region1",
            id: "1"
        },
        {
            start: 15,
            name: "region2",
            end: 25,
            id: "2"
        },
        {
            start: 35,
            end: 50,
            name: "region3",
            id: "3"
        },

    ]);
    const [subjectIDs, setSubjectIDs] = useState([]);
    const [callback, setCallback] = useState([]);
    const [subjectRect, setSubjectRect] = useState([]);

    // const boundingBoxes = BoundingBoxData;

    useEffect(() => {
        setVideoStyle({
            width: videoWidth + "%"
        })
    }, [videoWidth]);


    useEffect(() => {
        if (!isRegionsScreen)
            return;


        if (wsRegions != null) {
            wsRegions.clearRegions();

            for (let regionIndex in regions) {

                let region = regions[Number(regionIndex)];
                console.log({
                    start: region.start,
                    end: region.end
                });

                const tempRegion = wsRegions.addRegion({
                    start: region.start,
                    end: region.end,
                    content: region.name,
                    drag: false,
                    resize: true,
                });

                tempRegion.on("update-end", (newRegion) => {

                    setRegions(regions.map((x, i) => Number(regionIndex) === i ? {
                        ...x,
                        start: Math.round(tempRegion.start),
                        end: Math.round(tempRegion.end)
                    } : x));

                });
            }
        }

    }, [regions]);


    useEffect(() => {

        if (!isRegionsScreen)
            return;

        if (waveSurfer !== null) {
            waveSurfer.destroy();
            setWaveSurfer(null);
        }
        if (videoURL === "" || videoURL === null)
            return;


        const timeline = TimelinePlugin.create({
            height: 20,
            notchWidth: 1,
            notchMargin: 0.5,
            notchOffset: 0.5,
            timeInterval: 5
        })

        const wavesurfer = WaveSurfer.create({
            barWidth: 1,
            cursorWidth: 1,
            height: 100,
            mergeTracks: true,
            container: '#timeline',
            waveColor: "#ccc",
            progressColor: "#4a74a5",
            media: videoRef.current,
            minPxPerSec: 10,
            zoom: true,
            responsive: true,
            normalize: true,
            scrollParent: true,
            plugins: [timeline],
        });


        const wsRegions = wavesurfer.registerPlugin(RegionsPlugin.create());

        wsRegions.enableDragSelection();
        setWsRegions(wsRegions);

        setWaveSurfer(wavesurfer);
        setSurferTimeline(timeline);

        wavesurfer.on("loading", () => {
            setWaveLoading(true)
        })
        wavesurfer.on("ready", () => {
            setWaveLoading(false)
        })

        // wsRegions.on("region-created", (region) => {
        //     console.log(" region created");
        //
        //     // if (!isRegionPresent(region))
        //     //     setRegions(regions.concat({
        //     //         start: region.start,
        //     //         end: region.end,
        //     //         name: "New Region",
        //     //         id : ""
        //     //     }))
        // });

        wavesurfer.on("decode", () => {
            wsRegions.clearRegions();

            let curRegions = [];
            for (let regionIndex in regions) {
                let region = regions[regionIndex];
                const tempRegion = wsRegions.addRegion({
                    start: region.start,
                    end: region.end,
                    content: region.name,
                    color: 'rgba(255,0,0)',
                    drag: false,
                    resize: true
                });
                curRegions.push({ ...region, id: tempRegion.id });
                tempRegion.on("update-end", (newRegion) => {

                    console.log({
                        start: tempRegion.start,
                        end: tempRegion.end
                    })

                    setRegions(regions.map((x, i) => Number(regionIndex) === i ? {
                        ...x,
                        start: Math.round(tempRegion.start),
                        end: Math.round(tempRegion.end)
                    } : x));

                });

                tempRegion.on("click", () => {
                    changeVideoTime(tempRegion.start);
                })
            }
            setRegions(curRegions);

        })

        // setSubjectIDMapping();

    }, [videoURL]);

    useEffect(() => {
        drawRects();
    }, [boundingBoxes])

    useEffect(() => {
        drawFramesRects();
        setSubjectIDMapping();
    }, [frameBoundingBoxes])

    // useEffect(()=> {
    //     addMarkersToWave();
    // },[videoURL]);

    useEffect(() => {
        updateCanvas(callback);
    }, [callback]);

    useEffect(() => {
        updateCanvas(callback)
    }, [subjectIDs]);

    useEffect(() => {
        // setJSONParsed(false);
        // setParsingJSONURL(false);

        // setFrameBoundingBoxes([]);
        setJsonParserAvailable(false);

        if (videoURL !== "") {
            setOpenJsonUpload(true);
        }
    }, [videoURL]);
    //
    // useEffect(() => {
    //     setSubjectIDMapping();
    //
    // }, [frameBoundingBoxes])




    const isRegionPresent = (region) => {
        for (let curRegion of regions) {
            if (curRegion.id === region.id)
                return true;
        }

        return false;
    }

    const setSubjectIDMapping = () => {
        let newMap = new Map();
        // if (frameBoundingBoxes === null)
        //     return;
        frameBoundingBoxes.map((x) => {
            x.data.map((d) => {
                // if (!newMap.has(d.id)) {
                //     newMap.set(d.id, { ...d, frameNumber: x.frameNumber, total: 1, avgX : d.x, avgY : d.y, avgWidth : d.width, avgHeight : d.height});
                // } else{
                //     newMap.set(d.id, { ...d, total: d.total+1 , avgX : (d.x+avgX)/(d.total+1), avgY : (d.y+avgY)/(d.total+1), avgWidth : (d.width+avgWidth)/(d.total+1), avgHeight : (d.height+avgHeight)/(d.total+1)});
                // }
                if (!newMap.has(d.id)) {
                    newMap.set(d.id, { ...d, frameNumber: x.frameNumber});
                }
            })
        });
        setSubjectToFrameMap(newMap);
        addMarkersToWave();
    }

    const addMarkersToWave = () => {
        if (isRegionsScreen)
            return;

        if (waveSurfer !== null) {
            waveSurfer.destroy();
            setWaveSurfer(null);
        }
        if (videoURL === "" || videoURL === null)
            return;


        const timeline = TimelinePlugin.create({
            height: 20,
            notchWidth: 1,
            notchMargin: 0.5,
            notchOffset: 0.5,
            timeInterval: 5
        })

        const wavesurfer = WaveSurfer.create({
            barWidth: 1,
            cursorWidth: 1,
            height: 100,
            mergeTracks: true,
            container: '#subject-selection',
            waveColor: "#ccc",
            progressColor: "#4a74a5",
            media: videoRef.current,
            minPxPerSec: 10,
            zoom: true,
            responsive: true,
            normalize: true,
            scrollParent: true,
            plugins: [timeline],
        });

        setWaveSurfer(wavesurfer);


        const wsRegions = wavesurfer.registerPlugin(RegionsPlugin.create());

        // wsRegions.enableDragSelection();
        setWsRegions(wsRegions);

        setWaveSurfer(wavesurfer);
        setSurferTimeline(timeline);

        wavesurfer.on("loading", () => {
            setWaveLoading(true)
        })
        wavesurfer.on("ready", () => {
            setWaveLoading(false)
        })

        // wsRegions.on("region-created", (region) => {
        //     console.log(" region created");
        //
        //     // if (!isRegionPresent(region))
        //     //     setRegions(regions.concat({
        //     //         start: region.start,
        //     //         end: region.end,
        //     //         name: "New Region",
        //     //         id : ""
        //     //     }))
        // });

        wavesurfer.on("decode", () => {
            wsRegions.clearRegions();

            let curRegions = [];
            for (let regionIndex in Array.from(subjectToFrameMap)) {
                let region = Array.from(subjectToFrameMap)[regionIndex][1];
                const timestamp = Math.round((region.frameNumber/60)*100)/100
                const tempRegion = wsRegions.addRegion({
                    start: timestamp,
                    content: 'id' + region.id,
                    color: 'rgba(255,0,0)',

                    // drag: false,
                    // resize: true
                });
                // curRegions.push({ ...region, id: tempRegion.id });
                // tempRegion.on("update-end", (newRegion) => {
                //
                //     console.log({
                //         start: tempRegion.start,
                //         end: tempRegion.end
                //     })
                //
                //     setRegions(regions.map((x, i) => Number(regionIndex) === i ? {
                //         ...x,
                //         start: Math.round(tempRegion.start),
                //         end: Math.round(tempRegion.end)
                //     } : x));
                //
                // });

                tempRegion.on("click", () => {
                    changeVideoTime(tempRegion.start);
                })
            }
            // setRegions(curRegions);

        })

        // setSubjectIDMapping();

    //    let newRegions = [];
    //    const mapAsArray = Array.from(subjectToFrameMap);
    //    mapAsArray.map(([key, value]) => {
    //    newRegions = newRegions.push({
    //         start: Math.round((value.frameNumber/estimatedFPSRef.current)*100)/100 ,
    //         content: key
    //     });
    //    });
    //    setRegions(newRegions);
    }

    const getRegionId = () => {
        if (regions.length === 0)
            return "region0";

        const lastRegionId = regions[regions.length - 1].id;



    }

    const updateBoundingBox = () => {
        console.log("video current time : " + videoRef.current.currentTime);
        if (videoRef.current) {
            const currentTime = videoRef.current.currentTime;

            const data = boundingBoxes.find(x => x.timestamp === Math.round(currentTime));

            if (data) {
                drawRectangle(data.data);
                setClearStyle({
                    left: data.data.x + "px",
                    top: data.data.y + "px"
                })
            } else
                clearCanvas();
        }
    };

    // Give regions a random color when they are created
    // const random = (min, max) => Math.random() * (max - min) + min
    // const randomColor = () => `rgba(${random(0, 255)}, ${random(0, 255)}, ${random(0, 255)}, 0.5)`

    const handlePause = () => {
        if (videoRef.current != null) {
            videoRef.current.pause();
            setIsPlaying(false);
        }

    }

    const handlePlay = () => {
        if (videoRef.current != null) {
            videoRef.current.play();
            setIsPlaying(true);
        }
    }


    const handleZoomIn = () => {
        setZoomLevel(prevZoom => Math.min(10, prevZoom + 0.2));
    };

    const handleZoomOut = () => {
        setZoomLevel(prevZoom => Math.max(1, prevZoom - 0.2));
    };

    const handleZoomScroll = (e) => {
        // Prevent default behavior (like scrolling the page)

        if (e.deltaY < 0) {
            // Zoom in when scrolling up
            handleZoomIn();
        } else {
            // Zoom out when scrolling down
            handleZoomOut();
        }

        e.preventDefault();

    };

    const handleDragStart = (e) => {
        e.preventDefault();
        const video = canvasRef.current;


        let startX = e.clientX - video.offsetLeft;
        let startY = e.clientY - video.offsetTop;

        const handleDrag = (event) => {
            let left = event.clientX - startX;
            let top = event.clientY - startY;

            const containerWidth = video.parentElement.offsetWidth;
            const containerHeight = video.parentElement.offsetHeight;

            const maxLeft = Math.max((video.offsetWidth * zoomLevel - containerWidth) / 2, 0);
            const minLeft = Math.min(0, (containerWidth - video.offsetWidth * zoomLevel) / 2);
            const maxTop = Math.max((video.offsetHeight * zoomLevel - containerHeight) / 2, 0);
            const minTop = Math.min(0, (containerHeight - video.offsetHeight * zoomLevel) / 2);

            left = Math.max(Math.min(left, maxLeft), minLeft);
            top = Math.max(Math.min(top, maxTop), minTop);

            video.style.left = `${left}px`;
            video.style.top = `${top}px`;
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    };


    const handleVideoChange = (event) => {
        if (waveSurfer != null ) {
            waveSurfer.destroy();
            if (surferTimeline != null)
                surferTimeline.destroy();
        }
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        setVideoURL(url);
    };

    const drawRectangle = (data) => {
        if (data) {
            const canvas = canvasRef.current;
            let context = canvas.getContext("2d");
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            if (!Array.isArray(data)) data = [data];
            for (let rect of data) {
                context.rect(rect.x, rect.y, rect.width, rect.height);
                context.strokeStyle = "green";
                context.lineWidth = "3";
                context.stroke();
            }


        }
    }

    const updateRect = (rect) => {
        // const newRects = boundingBoxes.map((currentRect) => {
        //     if (currentRect.id === rect.id) {
        //         console.log("something called")
        //         return rect;
        //     }
        //     return currentRect;
        // })
        // setBoundingBoxes(newRects);

        // console.log("New rect : " + rect);


        const newData = boundingBoxes.map(currentTime => {
            if (currentTime.timestamp === Math.round(videoRef.current.currentTime)) {
                const rectData = currentTime.data.map((currentRect) => {
                    if (currentRect.id === rect.id)
                        return { ...rect };
                    return currentRect;
                })

                return {
                    timestamp: currentTime.timestamp,
                    data: rectData
                };
            }
            return currentTime;
        })

        setBoundingBoxes(newData);
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

    }

    const handleReset = (event) => {
        setZoomLevel(1);
        videoRef.current.style.left = "0px";
        videoRef.current.style.top = "0px";

        canvasRef.current.style.left = "0px";
        canvasRef.current.style.top = "0px";
    }

    const changeVideoTime = (offset) => {
        videoRef.current.currentTime = videoRef.current.currentTime + offset;
    }

    const setVideoTime = (time) => {
        videoRef.current.currentTime = time;
    }

    let previousTime = 0;
    let arrayFrameRate = [];
    let frameCounter = 0;

    const average = (array) => {
        return array.reduce((a, b) => a + b) / array.length;
    }

    const loadedVideo = () => {
        handlePlay();
        videoRef.current.requestVideoFrameCallback(findFrameRate);
    }

    const handleMoveBackward = (numFrames) => {
        // check if the video is exists
        if (videoRef.current !== null) {
            console.log(estimatedFPS);
            if (estimatedFPS > 0) {
                const proposedTime = videoRef.current.currentTime - numFrames / estimatedFPS;
                if (proposedTime >= 0) {
                    handlePause();
                    videoRef.current.currentTime = proposedTime;
                } else {
                    handlePause();
                    videoRef.current.currentTime = 0;
                }
            }
        }
    }

    const handleMoveForward = (numFrames) => {
        if (videoRef.current !== null) {
            if (estimatedFPS > 0) {
                const proposedTime = videoRef.current.currentTime + numFrames / estimatedFPS;
                if (proposedTime <= videoRef.current.duration) {
                    handlePause();
                    videoRef.current.currentTime = proposedTime;
                } else {
                    handlePause();
                    videoRef.current.currentTime = this.duration;
                }

            }
        }
    }


    const findFrameRate = () => {

        const video = videoRef.current;
        if (frameCounter === 0)
            videoRef.current.muted = true;

        let currentVideoTime = video.currentTime

        if (currentVideoTime !== previousTime) {
            arrayFrameRate.push(1 / (currentVideoTime - previousTime))
            previousTime = currentVideoTime

        }

        if (frameCounter <= 50) {
            frameCounter++
            videoRef.current.requestVideoFrameCallback(findFrameRate);

        } else {

            handlePause();
            let estimatedFrameRate = average(arrayFrameRate.slice(5));
            console.log("Estimated frame rate : " + estimatedFrameRate);
            //setEstimatedFPS(estimatedFrameRate);
            setEstimatedFPS(60);
            estimatedFPSRef.current = estimatedFrameRate;
            frameCounter = 0;
            video.currentTime = 0;
            video.muted = false;
            videoRef.current.muted = false;

            videoRef.current.requestVideoFrameCallback(changeCallback);

        }

    }

    const getCurrentFrame = () => {
        // const framerate = estimatedFPSRef.current;
        const  framerate = 59.94005994005994;
        const currentTime = videoRef.current.currentTime;
        //10.864753
        const currentSec = Math.floor(currentTime);
        //864
        const extraMilliSec = Math.floor((currentTime - currentSec) * 1000);
        // 1000/28 = 35.7
        const milliSecToFrameRate = 1000 / framerate;
        const currentFrame = Math.round((currentTime * framerate) );

        // console.log("currentTime = " + currentTime);
        // console.log("extraMilliSec = " + extraMilliSec);
        // console.log("framerate = " + framerate);
        // console.log("milliSecToFrameRate (1000/estimatedFPS) = " + milliSecToFrameRate);
        // console.log("CurrentFrame =" + currentFrame);

        return currentFrame;
    }

    const drawFramesRects = () => {
        // console.log("framerects : "+this.state.estimatedFPS);
        if (videoRef.current && videoURL !== "") {
            clearCanvas();
            const canvas = canvasRef.current;
            const currentFrame = getCurrentFrame();
            const context = canvasRef.current.getContext("2d");
            context.imageSmoothingEnabled = false;
            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const widthRatio = (1920/1080);
            const heightRatio = (1080/1920);
            if(isRegionsScreen){
                    context.beginPath();
                    // context.rect(rect.x+220, rect.y-850, rect.width, rect.height/2);
                    context.rect(subjectRect[0]*widthRatio, subjectRect[1]*heightRatio, subjectRect[2]*widthRatio, subjectRect[3]*heightRatio);
                    context.strokeStyle = "green";
                    context.lineWidth = "3";
                    context.stroke();
                    return;
            }
            let data = frameBoundingBoxes.find(x => x.frameNumber === Math.round(currentFrame));

            
            console.log("data = " + data);
            data = data?.data;
            if (data) {
                setCurrentBox(data);
                if (!Array.isArray(data)) data = [data];
                const colors = ["red", "blue", "orange", "purple", "pink", "yellow", "cyan"];
                for (let index in data) {
                    const rect = data[index];
                    let color = colors[data[index].id % colors.length];

                    if (subjectIDs.includes(data[index].id))
                        color = "green";

                    if (isRegionsScreen && color !== "green")
                        continue;
                    context.beginPath();
                    // context.rect(rect.x+220, rect.y-850, rect.width, rect.height/2);
                    context.rect(rect.x*widthRatio, rect.y*heightRatio, rect.width*widthRatio, rect.height*heightRatio);
                    context.strokeStyle = color;
                    context.lineWidth = "3";
                    context.stroke();
                    if (!isRegionsScreen){
                        context.font = "bold 50px Arial";
                        context.fillStyle = color;
                        if (rect.x * widthRatio > 50 && rect.y * heightRatio > 50)
                            context.fillText(rect.id, rect.x * widthRatio, rect.y * heightRatio);
                        else {
                            let x, y;

                            x = rect.x * widthRatio <= 10 ? rect.x * widthRatio + 50 : rect.x * widthRatio;
                            y = rect.y * heightRatio <= 10 ? rect.y * heightRatio + 50 : rect.y * heightRatio;

                            context.fillText(rect.id, x, y);


                        }
                    }
                }
            }
        }
    }

    const drawRects = () => {

        if (videoRef.current && videoURL !== "") {
            clearCanvas();

            // console.log("draw rects estmatedFPS = "+estimatedFPS)
            const canvas = canvasRef.current;
            const currentTime = videoRef.current.currentTime;
            const context = canvasRef.current.getContext("2d");
            context.imageSmoothingEnabled = false;

            context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            let data = boundingBoxes.find(x => x.timestamp === Math.round(currentTime));
            data = data?.data;

            const widthRatio = (600/1080);
            const heightRatio = (1080/1920);
            if (data) {
                setCurrentBox(data);
                if (!Array.isArray(data)) data = [data];
                const colors = ["red", "green"];
                for (let index in data) {
                    const rect = data[index];
                    console.log("rect being drawn : " + rect);
                    context.beginPath();
                    context.rect(rect.x*widthRatio, rect.y*heightRatio, rect.width*widthRatio, rect.height*heightRatio);
                    context.strokeStyle = rect.id === 1 ? "red" : "green";
                    context.lineWidth = "3";
                    context.stroke();
                }
            }
        }
    }

    const updateCanvas = (callbackData) => {
        const metadata = callbackData[1];

        if (metadata === undefined || metadata === null)
            return;

        clearCanvas();

        const canvas = canvasRef.current;
        canvas.height = metadata.height;
        canvas.width = metadata.width;

        const context = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;

        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

        // if (videoRef.current) {
        //     const currentTime = videoRef.current.currentTime;
        //
        //     let data = boundingBoxes.find(x => x.timestamp === Math.round(currentTime));
        //     data = data?.data;
        //     if (data) {
        //         setCurrentBox(data);
        //         if (!Array.isArray(data)) data = [data];
        //         const colors = ["red", "green"];
        //         for (let index in data) {
        //             const rect = data[index];
        //             context.beginPath();
        //             context.rect(rect.x, rect.y, rect.width, rect.height);
        //             context.strokeStyle = colors[index];
        //             context.lineWidth = "3";
        //             context.stroke();
        //         }
        //     }
        // }
        //drawRects(); //change to update rects based on the timestamp
        drawFramesRects();

        videoRef.current.requestVideoFrameCallback(changeCallback);
    };

    const changeCallback = (now, metadata) => {
        setCallback([now, metadata]);
    }


    const checkHover = (x, y) => {

        let rects = getCurRect();

        let dets = {
            cursor: " x: " + x + " y: " + y,
            rects: getCurRect()
        }

        // setShowDetails(dets);

        if (rects === null)
            return null;

        if (!Array.isArray(rects)) rects = [rects];



        let edgeSize = 10;
        let edge = null;
        let hoverRect = null;
        for (let rect of rects) {
            hoverRect = rect;
            if (x > rect.x - edgeSize && x < rect.x + edgeSize) {
                if (y > rect.y && y < rect.y + rect.height) {
                    edge = 'left';
                    break;
                }
            } else if (x > rect.x + rect.width - edgeSize && x < rect.x + rect.width + edgeSize) {
                if (y > rect.y && y < rect.y + rect.height) {
                    edge = 'right';
                    break;
                }
            } else if (y > rect.y - edgeSize && y < rect.y + edgeSize) {
                if (x > rect.x && x < rect.x + rect.width) {
                    edge = 'top';
                    break;
                }
            } else if (y > rect.y + rect.height - edgeSize && y < rect.y + rect.height + edgeSize) {
                if (x > rect.x && x < rect.x + rect.width) {
                    edge = 'bottom';
                    break;
                }
            }
        }

        if (edge !== null) {
            setHoverDetails({
                rect: hoverRect,
                hoverEdge: edge
            })
        } else {
            setHoverDetails(null);
        }


        return edge;
    }

    // const getCurRect = () => {
    //     let data = boundingBoxes.find(x => x.timestamp === Math.round(videoRef.current.currentTime));
    //     return data === null ? null : data.data;
    // }

    const getCurRect = () => {

        const currentFrame = getCurrentFrame();
        let data = frameBoundingBoxes.find(x => x?.frameNumber === Math.round(currentFrame));
        return data === undefined ? null : data.data;
    }

    const processVideo = async () => {

        let meanX = 0, meanY = 0, meanWidth = 0, meanHeight = 0, finalX = 20000, finalY = 20000, finalWidth = 0, finalHeight = 0;
        let total = 0;

        let finalBottom = 0, finalRight = 0;
        await frameBoundingBoxes.map((x) => {
            x.data.map((d) => {
                if (subjectIDs.includes(d.id)) {
                    meanX = meanX + d.x;
                    meanY = meanY + d.y;
                    meanWidth = meanWidth + d.width;
                    meanHeight = meanHeight + d.height;
                    total = total + 1;
                } 
            })
        });
        meanX = meanX/total;
        meanY = meanY/total;
        meanWidth = meanWidth/total;
        meanHeight = meanHeight/total;
        console.log("Mean values are :: [" + meanX+", "+meanY+", "+meanWidth+", "+meanHeight+"]");
        
        await frameBoundingBoxes.map((x) => {
            x.data.map((d) => {
                if (subjectIDs.includes(d.id)) {
                   if(!(Math.abs(meanX-d.x) > meanX/2 || Math.abs(meanY-d.y) > meanY/2 
                   || Math.abs(meanWidth-d.width) > meanWidth/2 || Math.abs(meanHeight-d.height) > meanHeight/2)){
                    
                    finalX = finalX > d.x ? d.x : finalX;
                    finalY = finalY > d.y ? d.y : finalY;
                    finalWidth = finalWidth < d.width ? d.width : finalWidth;
                    finalRight = finalRight < (d.width + d.x) ? (d.width + d.x) : finalRight;
                    finalBottom = finalBottom < (d.height + d.y) ? (d.height + d.y) : finalBottom;
                    finalHeight = finalHeight < d.height ? d.height : finalHeight;
                   }
                } 
            })
        });

        console.log("Final values are :: [" + finalX+", "+finalY+", "+finalWidth+", "+finalHeight+"]");
        setSubjectRect([finalX,finalY,(finalRight - finalX),(finalBottom - finalY)]);
        setIsRegionsScreen(true);

    }

    const changeToSubject = (idToChange) => {

        const index = subjectIDs.findIndex(subjectId => subjectId === idToChange);
        if (index !== -1){
            setSubjectIDs(subjectIDs.filter(x => x !== idToChange));
        } else {
            setSubjectIDs([...subjectIDs, idToChange]);
        }
        //
        //
        // // console.log("enterd changeToSubject method. Need to change subject id "+ idToChange+ " to 1");
        // let newFrameBoundingBoxes = frameBoundingBoxes;
        // let count = 0;
        // newFrameBoundingBoxes = newFrameBoundingBoxes.map((x) => {
        //     const updatedData = x.data.map((d) => {
        //       if (d.id === idToChange) {
        //         d.id = 1;
        //         count = count + 1;
        //       }
        //       return d;
        //     });
        //     return { ...x, data: updatedData };
        //   });
        //
        // console.log("need to change "+ count + " ids")
        //
        // setFrameBoundingBoxes(newFrameBoundingBoxes);
    }

    const handleMouseDown = (e) => {
        if (hoverDetails) {
            setIsResizing(true);
        } else if (zoomLevel !== 1) {
            handleDragStart(e);
        }
    }

    const handleMouseUp = () => {
        setIsResizing(false);
    }

    const checkForConflict = (rect) => {
        const otherRects = getCurRect().filter(currentRect => currentRect.id !== rect.id);

        for (let otherRect of otherRects) {
            const checkYOverlap = () => {

                if (rect.y >= otherRect.y && rect.y <= (otherRect.y + otherRect.height))
                    return true;

                if (otherRect.y >= rect.y && otherRect.y <= (rect.y + rect.height))
                    return true;

                if ((rect.y + rect.height) >= otherRect.y && (rect.y + rect.height) <= (otherRect.y + otherRect.height))
                    return true;

                if ((otherRect.y + otherRect.height) >= rect.y && (otherRect.y + otherRect.height) <= (rect.y + rect.height))
                    return true;


                if (rect.y >= (otherRect.y - 50) && ((rect.y) <= (otherRect.y + otherRect.height + 50)))
                    return true;
                if ((rect.height + rect.y) >= (otherRect.y - 50) && (rect.height + rect.y) <= (otherRect.y + otherRect.height + 50))
                    return true;
                return false;
            }

            const checkXOverlap = () => {

                if (rect.x >= otherRect.x && rect.x <= (otherRect.x + otherRect.width))
                    return true;
                if (otherRect.x >= rect.x && otherRect.x <= (rect.x + rect.width))
                    return true;

                if ((rect.x + rect.width) >= otherRect.x && (rect.x + rect.width) <= (otherRect.x + otherRect.width))
                    return true;
                if ((otherRect.x + otherRect.width) >= rect.x && (otherRect.x + otherRect.width) <= (rect.x + rect.width))
                    return true;


                if (rect.x >= (otherRect.x - 50) && (rect.x) <= (otherRect.x + otherRect.width + 50))
                    return true;

                if ((rect.x + rect.width) >= (otherRect.x - 50) && (rect.x + rect.width) <= (otherRect.x + otherRect.width + 50))
                    return true;

                return false;
            }

            if (checkYOverlap() && checkXOverlap())
                return true;
        }



        // if (hoverDetails !== null){
        //     let edge = hoverDetails.hoverEdge;
        //     if (edge === "left") {
        //         if ((rect.x - (otherRect.x + otherRect.width) < 50) && checkYOverlap())
        //             return true;
        //         // if (Math.abs(rect.x - otherRect.x) < 40 || Math.abs(rect.x - (otherRect.x + otherRect.width)) < 40)
        //         //     return true;
        //     } else if ( edge === "right") {
        //         //
        //         // if ((otherRect.x - (rect.x + rect.width) < 50) && checkYOverlap())
        //         //     return true;
        //         //
        //         // if (Math.abs((rect.x + rect.width) - otherRect.x) < 40 || Math.abs((rect.x + rect.width) - (otherRect.x + otherRect.width)) < 40)
        //         //     return true;
        //     }
        // }
        //
        // let xOverlap = checkXOverlap();
        // let yOverlap = checkYOverlap();
        // return xOverlap && yOverlap;

        // return checkYOverlap() && checkYOverlap();
        return false;
    }

    function getMousePos(canvas, evt) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

    function drawSample() {
        const canvas = canvasRef.current;
        let context = canvas.getContext("2d");
        // 245, "y": 323, "width": 502, "height": 1373
        const widthRatio = (canvas.width/ canvas.clientWidth);
        const ratio = (canvas.height / canvas.clientHeight);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.beginPath();
        // context.rect(rect.x, rect.y, rect.width, rect.height);
        // context.rect(245/widthRatio, 323/ratio, 502/widthRatio, 1373/ratio);
        context.rect(245*(1920/1080), 323*(1080/1920), 502*(1920/1080), 1373*(1080/1920));
        context.strokeStyle = "green";
        context.lineWidth = "3";
        context.stroke();
    }
    const handleMouseMove = (event) => {

        const canvas = canvasRef.current;
        const widthRatio = (canvas.width/ canvas.clientWidth);
        const ratio = (canvas.height / canvas.clientHeight);

        let x = event.nativeEvent.offsetX * widthRatio;
        let y = event.nativeEvent.offsetY * ratio;

        setShowDetails("x : " +  x + " y : "+y);

        // setShowDetails(JSON.stringify(getMousePos(canvas, event)));


        let hoverEdge;//= checkHover(x, y);

        if (isResizing) hoverEdge = hoverDetails ? hoverDetails.hoverEdge : null;
        else
            hoverEdge = checkHover(x, y);



        // canvasRef.current.removeEventListener('mousedown', handleMouseDown);
        // canvasRef.current.addEventListener('mousedown', handleMouseDown);
        //
        // window.addEventListener('mouseup', function (e) {
        //     setIsResizing(false);
        // });

        if (hoverEdge) {
            if (hoverEdge === 'left' || hoverEdge === 'right') {
                canvasRef.current.style.cursor = 'ew-resize';
            } else {
                canvasRef.current.style.cursor = 'ns-resize';
            }
        } else {
            canvasRef.current.style.cursor = 'grab';
        }



        let rect = hoverDetails ? hoverDetails.rect : null;

        if (rect !== null && isResizing) {
            if (hoverEdge === 'left') {
                rect.width += rect.x - x;
                rect.x = x;
            } else if (hoverEdge === 'right') {
                rect.width = x - rect.x;
            } else if (hoverEdge === 'top') {
                rect.height += rect.y - y;
                rect.y = y;
            } else if (hoverEdge === 'bottom') {
                rect.height = y - rect.y;
            }
            if (hoverEdge) {
                if (rect.width >= 50 && rect.height >= 50) {
                    if (!checkForConflict(rect)) {
                        console.log("New rect : " + JSON.stringify(rect));
                        updateRect(rect);
                    }
                }

                // drawRectangle(rect);
            }
        }
    }




    const jsonFileHandle = (jsonFileUploaded, jsonContent) => {
        if (jsonFileUploaded) {
            setFrameBoundingBoxes(jsonContent["boundingBoxes"]);
            setJsonParserAvailable(true);
        }
        else {
            setFrameBoundingBoxes(frameBoxes);
            setJsonParserAvailable(true);
        }
    }


    return (
        <div className="flex flex-col items-center gap-4 p-2">
            <div>
                <button className="px-4 py-2 rounded-md bg-black text-white mt-5 text-2xl" onClick={() => {
                    loadButtonRef.current.click()
                }}>Load Video
                </button>
                <input type={"file"} ref={loadButtonRef} onChange={handleVideoChange} className=" hidden" />
            </div>


            <JSONUploadDialog dialogOpen={openJsonUpload} setDialogOpen={setOpenJsonUpload} handleJSONUpload={jsonFileHandle} />
            {isRegionsScreen && <div className="flex gap-4">
                <select value={videoWidth} onChange={event => {
                    setVideoWidth(event.target.value);
                }}>
                    <option value={10}>10%</option>
                    <option value={20}>20%</option>
                    <option value={30}>30%</option>
                    <option value={40}>40%</option>
                    <option value={50}>50%</option>
                    <option value={60}>60%</option>
                    <option value={70}>70%</option>
                    <option value={80}>80%</option>
                    <option value={90}>90%</option>
                    <option value={100}>100%</option>
                </select>
                <span>Video Size</span>
            </div>}
            {/*<div>Is resizing : {isResizing ? "true" : "false"}</div>*/}
            {/*<div onClick={() => {*/}
            {/*    drawSample();*/}
            {/*}}> Details : {subjectIDs }</div>*/}

            { isRegionsScreen && <div className="video-container bg-gray-200 flex-grow" style={videoStyle}>
                <video
                    ref={videoRef}
                    className="video-content"
                    src={videoURL}
                    onWheel={handleZoomScroll}
                    onLoadedMetadata={loadedVideo}
                    loop
                    controls
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        transform: `scale(${zoomLevel})`,
                        cursor: 'grab'
                    }}
                    onWheel={handleZoomScroll}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    className="absolute top-0 left-0 w-full h-full"
                />


            </div>}

            { !isRegionsScreen && <div className={"flex"}>
                <div className="video-container bg-gray-200 flex-grow" style={videoStyle}>
                    <video
                        ref={videoRef}
                        className="video-content"
                        src={videoURL}
                        onWheel={handleZoomScroll}
                        onLoadedMetadata={loadedVideo}
                        loop
                    />
                    <canvas
                        ref={canvasRef}
                        style={{
                            transform: `scale(${zoomLevel})`,
                            cursor: 'grab'
                        }}
                        onWheel={handleZoomScroll}
                        onMouseDown={handleMouseDown}
                        onMouseUp={handleMouseUp}
                        onMouseMove={handleMouseMove}
                        className="absolute top-0 left-0 w-full h-full"
                    />


                </div>

                { (jsonParserAvailable) && <div className="overflow-y-auto overflow-x-scroll flex-shrink-0 h-screen">
                    <table className="border-2 mt-5 ">
                        <thead>
                        <tr className="text-center border-2">
                            <th className="py-2 px-4 ">Subject ID</th>
                            <th className="py-2 px-4 ">Start Time</th>
                            <th className="py-2 px-4"></th>
                            <th className="py-2 px-4 "></th>
                        </tr>
                        </thead>
                        <tbody>
                        {Array.from(subjectToFrameMap).map(([key, value]) => (
                            <tr>
                                <td className="py-2 px-4  text-center">
                                    <input className="text-center" value={key}/>
                                </td>

                                <td className="py-2 px-4 outline-2 text-center">
                                    <input className="text-center"
                                           value={Math.round((value.frameNumber / estimatedFPS) * 100) / 100}/>
                                </td>

                                <td className="py-2 px-4 ">
                                    <button
                                        className="py-2 m-2 px-4 text-left bg-sky-300"
                                        onClick={() => {
                                            setVideoTime(value.frameNumber / estimatedFPS);
                                        }}
                                    >
                                        Go
                                    </button>
                                </td>
                                <td className="py-2 px-4 ">
                                    <button
                                        className={subjectIDs.includes(key) ? "py-2 m-2 rounded-md px-4 text-center bg-lime-500" : "py-2 m-2 rounded-md px-4 text-center bg-sky-300"}
                                        onClick={() => {
                                            //setVideoTime(Math.ceil(value.frameNumber/estimatedFPSRef.current));
                                            changeToSubject(key);
                                        }}
                                    >
                                        {subjectIDs.includes(key) ? "Subject" : "Mark Subject"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>}


            </div>}



            <div className="flex gap-2 justify-center items-center">
                <ZoomIn className="cursor-pointer" onClick={handleZoomIn} />
                <div className={"text-xl px-2 border-2"}>{Math.round(zoomLevel * 10) / 10}x</div>
                <ZoomOut className="cursor-pointer" onClick={handleZoomOut} />
                <RestartAlt className="cursor-pointer" onClick={handleReset} />


            </div>

            <div className={"flex gap-4 text-2xl items-center"}>
                <button onClick={() => {
                    handleMoveBackward(5);
                    // changeVideoTime(-5)
                }}>-5
                </button>
                <button onClick={() => {
                    handleMoveBackward(1);

                    // changeVideoTime(-1)
                }}>-1
                </button>
                {
                    isPlaying
                    &&
                    <Pause className="cursor-pointer" onClick={handlePause} />
                }

                {
                    !isPlaying
                    &&

                    <PlayArrow className="cursor-pointer" onClick={handlePlay} />
                }

                <button onClick={() => {
                    // changeVideoTime(1)
                    handleMoveForward(1);
                }}>+1
                </button>
                <button onClick={() => {
                    // changeVideoTime(+5)
                    handleMoveForward(5);
                }}>+5
                </button>

            </div>

            <div>
                <button className={"px-4 py-2 rounded-md bg-black text-white text-2xl mb-10"}
                    onClick={() => {
                        processVideo();
                    }}>Process
                </button>
            </div>

            {
                (waveLoading)
                &&
                <div>Wave loading ... </div>
            }

            { !isRegionsScreen && <div className={"w-[70%]"} id={"subject-selection"}></div>}

            { isRegionsScreen && <div className={"w-[70%]"} id={"timeline"}>

            </div>}


            { isRegionsScreen && <table className="w-[60%] border-2 mt-5">
                <thead>
                <tr className={"text-center border-2"}>
                    <th className={"py-2 px-4 w-[55%]"}>Region Name</th>
                    <th className={"py-2 px-4 w-[5%]"}></th>
                    <th className="py-2 px-4 w-[15%]">Start Time</th>
                    <th className="py-2 px-4 w-[15%]">End Time</th>
                </tr>
                </thead>
                <tbody className=" overflow-y-scroll">
                {
                    regions.map((region, index) => {
                        return <tr key={index}>
                            <td className="py-2 px-4 w-[55%] text-center">
                                <input className={"text-center"} value={region.name} onChange={(event) => {
                                    setRegions(regions.map((region, i) => index === i ? {
                                        ...region,
                                        name: event.target.value
                                    } : region));
                                }}/>
                            </td>
                            <td className=" w-[5%] ">
                                <button className={"py-2 m-2 px-4 text-left bg-sky-300"} onClick={() => {
                                    setVideoTime(region.start);
                                }}>
                                    Go
                                </button>
                            </td>
                            <td className="py-2 px-4 w-[15%] outline-2 text-center"><input className={"text-center"}
                                                                                           value={region.start}
                                                                                           onChange={(e) => {
                                                                                               setRegions(regions.map((region, i) => index === i ? {
                                                                                                   ...region,
                                                                                                   start: e.target.value
                                                                                               } : region));

                                                                                           }}/></td>
                            <td className="py-2 px-4 w-[15%] text-center"><input className={"text-center"}
                                                                                 value={region.end} onChange={(e) => {
                                setRegions(regions.map((region, i) => index === i ? {
                                    ...region,
                                    end: e.target.value
                                } : region));
                            }}/></td>

                            <td className="py-2 px-4 left-0 w-[10%]">
                                <button
                                    className="flex items-center justify-center align-middle bg-red-700 text-white p-3 w-10 h-10 rounded-md"
                                    onClick={() => {
                                        setRegions(regions.filter((region, i) => {
                                            return i !== index;
                                        }))
                                    }}>
                                    X
                                </button>
                            </td>
                        </tr>;
                    })
                }
                </tbody>
            </table>}

            {/*<table className="w-[60%] border-2 mt-5">*/}
            {/*    <thead>*/}
            {/*        <tr className="text-center border-2">*/}
            {/*            <th className="py-2 px-4 w-[25%]">Subject ID</th>*/}
            {/*            <th className="py-2 px-4 w-[25%]">Start Time</th>*/}
            {/*            <th className="py-2 px-4 w-[25%]"></th>*/}
            {/*            <th className="py-2 px-4 w-[25%]"></th>*/}
            {/*        </tr>*/}
            {/*    </thead>*/}
            {/*    <tbody className="overflow-y-scroll">*/}
            {/*        {Array.from(subjectToFrameMap).map(([key, value]) => (*/}
            {/*            <tr>*/}
            {/*                <td className="py-2 px-4 w-[25%] text-center">*/}
            {/*                    <input className="text-center" value={key} />*/}
            {/*                </td>*/}
            {/*                */}
            {/*                <td className="py-2 px-4 w-[25%] outline-2 text-center">*/}
            {/*                    <input className="text-center" value={Math.round((value.frameNumber/estimatedFPSRef.current)*100)/100 } />*/}
            {/*                </td>*/}

            {/*                <td className="py-2 px-4 w-[25%]">*/}
            {/*                    <button*/}
            {/*                        className="py-2 m-2 px-4 text-left bg-sky-300"*/}
            {/*                        onClick={() => {*/}
            {/*                             setVideoTime(value.frameNumber/estimatedFPSRef.current);*/}
            {/*                        }}*/}
            {/*                    >*/}
            {/*                        Go*/}
            {/*                    </button>*/}
            {/*                </td>*/}
            {/*                <td className="py-2 px-4 w-[25%]">*/}
            {/*                    <button*/}
            {/*                        className="py-2 m-2 px-4 text-left bg-sky-300"*/}
            {/*                        onClick={() => {*/}
            {/*                             //setVideoTime(Math.ceil(value.frameNumber/estimatedFPSRef.current));*/}
            {/*                             changeToSubject(key);*/}
            {/*                        }}*/}
            {/*                    >*/}
            {/*                        Subject*/}
            {/*                    </button>*/}
            {/*                </td>*/}
            {/*            </tr>*/}
            {/*        ))}*/}
            {/*    </tbody>*/}
            {/*</table>*/}

            { isRegionsScreen && <div>
                <button className={"p-4 bg-blue-300 mb-20"} onClick={() => {
                    setRegions(regions.concat({
                        start: 0,
                        end: 10,
                        name: "New Region"
                    }));
                }}> + Add Region
                </button>
            </div>}
        </div>

    );
};

export default VideoAnalysis;
