import VideoPlayer from "../../components/commons/VideoPlayer/VideoPlayer";
import React, { useEffect, useRef, useState } from "react";
import HeaderSection from "./HeaderSection";
import Button from "@mui/material/Button";
import JSONUploadDialog from "./JSONUploadDialog";
import wavesData from "./waveData.json";
import peaksData from "./peaks.json";
import scatterPlotData from "./scatterPlot.json";
import PlotWidget from "./PlotWidget.js";
import {RestartAlt,CloudDownload, TouchApp} from '@mui/icons-material';

function useDebounce(callback, delay) {
    const argsRef = useRef();
    const timeout = useRef();

    function debouncedFunction(...args) {
        argsRef.current = args;
        clearTimeout(timeout.current);
        timeout.current = setTimeout(() => {
            if (argsRef.current) {
                callback(...argsRef.current);
            }
        }, delay);
    }

    return debouncedFunction;
}

const TaskDetails = ({ videoURL, setVideoURL, fileName, setFileName, setVideoData, boundingBoxes, setBoundingBoxes, setElement, taskBoxes, fps, setFPS }) => {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    // const [tasks, setTasks] = useState([]);
    // const [taskBoxes, setTaskBoxes] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [openJsonUpload, setOpenJsonUpload] = useState(false);
    const [selectedTask, setSelectedTask] = useState(0);
    const [selectedTaskName, setSelectedTaskName] = useState();
    const [taskRecord, setTaskRecord] = useState({})
    const [taskToPlotMap, setTaskToPlotMap] = useState({});
    const [landMarks, setLandMarks] = useState([]);
    const [normalizationLandMarks, setNormalizationLandMarks] = useState([]);
    const [normalizationFactor, setNormalizationFactor] = useState();
    const [frameOffset, setFrameOffset] = useState(0);
    
    const tasks = taskBoxes;

    useEffect(() => {
        const taskData = tasks[selectedTask];
        const startTime = taskData.start;
        setSelectedTaskName(tasks[selectedTask].name);

        videoRef.current.currentTime = startTime;

        videoRef.current.ontimeupdate = (event => {
            const currentTime = event.target.currentTime;
            if (currentTime >= taskData.end) {
                videoRef.current.currentTime = startTime;
            }
        });

    }, [selectedTask]);

    const onFPSCalculation = (fps) => {
        setVideoReady(true);
    }

    useEffect(() => {
        // console.log(JSON.stringify(taskToPlotMap));
    }, [taskToPlotMap])

    const handleProcessing = (jsonFileUploaded, jsonContent) => {
        if (jsonFileUploaded && jsonContent !== null) {
            if (jsonContent.hasOwnProperty("linePlot")) {

                let updatedRecord =  taskToPlotMap[selectedTaskName] ;

                if (jsonContent.hasOwnProperty("linePlot")) {
                    updatedRecord = {
                        ...updatedRecord,
                        linePlot: jsonContent.linePlot,
                        peaks: jsonContent.peaks,
                        valleys_start: jsonContent.valleys_start,
                        valleys_end: jsonContent.valleys_end,
                        valleys : jsonContent.valleys

                    };
                }

                if (jsonContent.hasOwnProperty("radar")) {
                    updatedRecord = {
                        ...updatedRecord,
                        radar: jsonContent.radar,
                        velocity: jsonContent.radar.velocity
                    };
                }

                if (jsonContent.hasOwnProperty("radarTable")) {
                    updatedRecord = {
                        ...updatedRecord,
                        radarTable: {
                            ...updatedRecord.radarTable,  // Merge existing radarTable
                            ...jsonContent.radarTable     // Add or override with new values
                        }
                    };
                }

                if (jsonContent.hasOwnProperty("landMarks")) {
                    updatedRecord = {
                        ...updatedRecord,
                        landMarks: jsonContent.landMarks
                    };
                    setLandMarks(jsonContent.landMarks);
                }

                if (jsonContent.hasOwnProperty("normalization_landmarks")) {
                    updatedRecord = {
                        ...updatedRecord,
                        normalizationLandMarks: jsonContent.normalization_landmarks
                    };
                    setNormalizationLandMarks(jsonContent.normalization_landmarks);
                }

                if (jsonContent.hasOwnProperty("normalization_factor")) {
                    updatedRecord = {
                        ...updatedRecord,
                        normalization_factor: jsonContent.normalization_factor
                    };
                    setNormalizationFactor(jsonContent.normalization_factor);
                }


                //console.log("updated record is :: " + updatedRecord);


                let taskToPlotMap_New = {...taskToPlotMap};
                taskToPlotMap_New[selectedTaskName] = updatedRecord;

                setTaskToPlotMap(taskToPlotMap_New);

            } else {
                console.log("Error while reading the json content of graph");
            }

            setDataReady(true); 
        } else {
            //setDataReady(true);
        }
    }


    const resetTask = () => {
        let newTaskToPlotMap = {...taskToPlotMap};

        if (newTaskToPlotMap.hasOwnProperty(selectedTaskName)) {
            newTaskToPlotMap[selectedTaskName] = null;
            setTaskToPlotMap(newTaskToPlotMap);
        }
    }

    const DownloadCurrentTask = () => {
        const fileData = taskToPlotMap[selectedTaskName];

        const downloadContent = {
            linePlot: fileData.linePlot,
            peaks: fileData.peaks,
            valleys : fileData.valleys,
            valleys_start: fileData.valleys_start,
            valleys_end: fileData.valleys_end,
            radar: {
                ...fileData.radar,
                velocity : fileData.radar.velocity
            },
            radarTable: fileData.radarTable,
            landMarks: fileData.landMarks,
            normalization_landmarks: fileData.normalizationLandMarks,
            normalization_factor: fileData.normalizationFactor

        };
        const json = JSON.stringify(downloadContent);
        const blob = new Blob([json], {type: "application/json"});
        const href = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = href;
        link.download = fileName.replace(/\.[^/.]+$/, "") + "_"+selectedTaskName + ".json";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }

    // Debounced function for updating landmarks to backend
    const debouncedUpdateLandmarks = useDebounce(async (newLandMarks) => {
        try {

            const taskData = tasks[selectedTask];
            let uploadData = new FormData();

            let jsonData = {
                task_name: selectedTaskName,
                start_time: taskData.start,
                end_time: taskData.end,
                fps: fps,
                landmarks: taskToPlotMap[selectedTaskName].landMarks,
                normalization_factor : taskToPlotMap[selectedTaskName].normalization_factor
            };

            jsonData = JSON.stringify(jsonData);

            uploadData.append('json_data', jsonData);
            const response = await fetch('http://localhost:8000/api/update_landmarks/', {
                method: 'POST',
                body: uploadData
            });
            if (response.ok) {
                const data = await response.json();
                // let newJsonData = { ...taskRecord };

                if (true) {
                    handleProcessing(true, data);
                }

                else {
                    throw new Error("Invalid input received from server");
                }
            } else {
                throw new Error('Server responded with an error!');
            }
    } catch (error) {
        console.error("Failed to fetch projects:", error);
    }
    }, 1000);

    const updateNewLandMarks = (newLandMarks) => {
        let newTaskToPlotMap = { ...taskToPlotMap };
    
        if (newTaskToPlotMap.hasOwnProperty(selectedTaskName)) {
            newTaskToPlotMap[selectedTaskName].landMarks = newLandMarks;
            setTaskToPlotMap(newTaskToPlotMap);
        }
    }

    const handleLandMarksChange = (newLandMarks) => {
        setLandMarks(newLandMarks);
        updateNewLandMarks(newLandMarks);
        debouncedUpdateLandmarks(newLandMarks);
    };

    return (
        <div className="flex flex-col min-h-screen max-h-screen">
            <div className="flex flex-1 flex-row max-h-screen">
                <div className={"flex w-1/2 max-h-screen bg-red-600 overflow-hidden"}>
                    <VideoPlayer
                        screen={"taskDetails"}
                        taskBoxes={taskBoxes}
                        videoRef={videoRef}
                        boundingBoxes={boundingBoxes}
                        fps={fps} persons={[]}
                        fpsCallback={onFPSCalculation}
                        setVideoReady={setVideoReady}
                        // boxesReady={boxesReady}
                        videoURL={videoURL}
                        setVideoData={setVideoData}
                        fileName={fileName}
                        setFileName={setFileName}
                        setVideoURL={setVideoURL}
                        landMarks={taskToPlotMap[selectedTaskName]?.landMarks}
                        setLandMarks={handleLandMarksChange}
                        setTaskBoxes={() => {}}
                        selectedTask={selectedTask}
                        frameOffset={frameOffset}
                    />
                </div>
                
                <div className={"flex flex-col min-h-[100vh] w-1/2 overflow-auto"}>
                    <HeaderSection title={"Task Details"} isVideoReady={videoReady} fileName={fileName} fps={fps} boundingBoxes={boundingBoxes} taskBoxes={taskBoxes} />

                    <div className={"flex items-center justify-center gap-2 mt-2 mb-4"}>
                        <div className={"text-lg font-bold"}>Current task -</div>
                        <select className={"text-lg"} name="Tasks" id="tasks" value={selectedTask} onChange={e => {
                            setSelectedTask(e.target.value);
                        }}>
                            {
                                tasks.map((task, index) => <option key={index} value={index}>{task.name}</option>)
                            }
                        </select>
                        <button
                            className={"p-2 pl-2 px-4 rounded-md bg-blue-600 text-white font-bold flex flex-row gap-2"}
                            onClick={resetTask}
                        >
                         <RestartAlt/> Reset
                        </button>
                        { taskToPlotMap[selectedTaskName] != null && <button
                            className={"p-2 pl-2 px-4 rounded-md bg-blue-600 text-white font-bold flex flex-row gap-2"}
                            onClick={DownloadCurrentTask}
                        >
                         <CloudDownload/>
                        </button>
                        }
                    </div>

                    <div className={"flex items-center justify-center gap-2 mt-2 mb-4"}>
                        <div className={"font-bold"}>Adjust frame offset</div>
                        <button className={"p-2 bg-blue-700 px-4 text-white"} onClick={()=>{setFrameOffset(prevVal => prevVal - 1)}}>-</button>
                        <div>{frameOffset}</div>
                        <button className={"p-2 bg-blue-700 px-4 text-white"}  onClick={()=>{setFrameOffset(prevVal => prevVal + 1)}}>+</button>
                    </div>


                    {
                        taskToPlotMap[selectedTaskName] == null
                        &&
                        <div className={"flex justify-center items-center h-full flex-col gap-4 w-full px-10 flex-1 py-4 overflow-y-scroll  "}>
                            <div>Analyse the task</div>
                            <Button variant="contained" onClick={() => { setOpenJsonUpload(true) }}>Analyse</Button>
                            <JSONUploadDialog dialogOpen={openJsonUpload} fps={fps} setDialogOpen={setOpenJsonUpload} handleJSONUpload={handleProcessing} boundingBoxes={boundingBoxes} videoRef={videoRef} tasks={tasks} selectedTask={selectedTask}/>
                        </div>

                    }

                    {
                        taskToPlotMap[selectedTaskName] != null
                        &&
                        <PlotWidget key={selectedTask} taskRecord={taskToPlotMap[selectedTaskName]}  videoRef={videoRef} startTime={taskBoxes[selectedTask].start} endTime={taskBoxes[selectedTask].end} handleJSONUpload={handleProcessing}/>
                    }
                </div>
            </div>

        </div>
    );
}

export default TaskDetails;