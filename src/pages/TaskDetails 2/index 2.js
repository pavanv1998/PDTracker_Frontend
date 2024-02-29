import VideoPlayer from "../../components/commons/VideoPlayer/VideoPlayer";
import React, { useEffect, useRef, useState } from "react";
import HeaderSection from "./HeaderSection";
import Button from "@mui/material/Button";
import JSONUploadDialog from "./JSONUploadDialog";
import wavesData from "./waveData.json";
import peaksData from "./peaks.json";
import scatterPlotData from "./scatterPlot.json";
import PlotWidget from "./PlotWidget.js";

const TaskDetails = ({ videoURL, setVideoURL, fileName, setFileName, setVideoData, boundingBoxes, setBoundingBoxes, setElement, taskBoxes }) => {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    const [fps, setFPS] = useState(60);
    // const [tasks, setTasks] = useState([]);
    // const [taskBoxes, setTaskBoxes] = useState([]);
    const [dataReady, setDataReady] = useState(false);
    const [openJsonUpload, setOpenJsonUpload] = useState(false);
    const [selectedTask, setSelectedTask] = useState(0);
    const [taskRecord, setTaskRecord] = useState({})
    const [taskToPlotMap, setTaskToPlotMap] = useState({});
    const [landMarks, setLandMarks] = useState([]);
    const tasks = taskBoxes;
    // useEffect(() => {
    //     if (!videoReady) {
    //         setFPS(60);
    //     }
    // }, [videoReady]);

    const goToTaskStart = () => { }


    const playTaskBegin = (currentTime) => {
        const taskData = tasks[selectedTask];

    }
    useEffect(() => {
        // console.log(tasks[selectedTask]);
        // const taskRecord = tasks[selectedTask];
        // videoRef.current.src = videoRef.current.src + "#t="+taskRecord.start+","+taskRecord.end;
        // console.log(videoRef.current.src);

        const taskData = tasks[selectedTask];
        const startTime = taskData.start;
        const endTime = taskData.end;

        videoRef.current.currentTime = startTime;
        //videoRef.current.play();

        // videoRef.current.timeupdate(currentTime => {
        //     if (currentTime >= taskData.end) {
        //         videoRef.current.currentTime = startTime;
        //         // videoRef.current.play();
        //     }
        // })

        videoRef.current.ontimeupdate = (event => {
            // console.log(event);
            // console.log("Time updated");
            const currentTime = event.target.currentTime;
            if (currentTime >= taskData.end) {
                videoRef.current.currentTime = startTime;
                // videoRef.current.play();
            }
        });

    }, [selectedTask])

    const onFPSCalculation = (fps) => {
        setVideoReady(true);
    }

    

    const handleProcessing = (jsonFileUploaded, jsonContent) => {
        if (jsonFileUploaded && jsonContent !== null) {
            if (jsonContent.hasOwnProperty("linePlot")) {
                //new json
                // setTaskRecord({...taskRecord, linePlot : jsonContent.linePlot})
                // setTaskRecord({...taskRecord, peaks : jsonContent.peaks})
                // setTaskRecord({...taskRecord, valleys : jsonContent.valleys})
                //old json

                // setTasks(transformedData);

                // Start with the current taskRecord
                let updatedRecord = { ...taskToPlotMap.selectedTask };

                // Conditionally add new properties
                if (jsonContent.hasOwnProperty("linePlot")) {
                    updatedRecord = {
                        ...updatedRecord,
                        linePlot: jsonContent.linePlot,
                        peaks: jsonContent.peaks,
                        valleys_start: jsonContent.valleys_start,
                        valleys_end: jsonContent.valleys_end,
                        valleys: jsonContent.valleys

                    };
                }

                if (jsonContent.hasOwnProperty("radar")) {
                    updatedRecord = {
                        ...updatedRecord,
                        radar: jsonContent.radar
                    };
                }

                if (jsonContent.hasOwnProperty("radarTable")) {
                    updatedRecord = {
                        ...updatedRecord,
                        radarTable: jsonContent.radarTable
                    };
                }

                if (jsonContent.hasOwnProperty("landMarks")) {
                    updatedRecord = {
                        ...updatedRecord,
                        landMarks: jsonContent.landMarks
                    };
                    setLandMarks(jsonContent.landMarks);
                }

                console.log("updated record is :: " + updatedRecord);

                //setTaskRecord(updatedRecord); // Return the updated record

                //console.log("task record is :: " + taskRecord);

                setTaskToPlotMap({ ...taskToPlotMap, selectedTask: updatedRecord });

            } else {
                console.log("Error while reading the json content of graph");
            }

            // console.log("JSON file details captured and added.")
            // console.log("now the taskRecord is :: " + taskRecord.linePlot)
            // console.log("now the taskRecord is :: " + taskRecord.peaks)
            // console.log("now the taskRecord is :: " + taskRecord.valleys)
            // console.log("radar is " + taskRecord.radar)
            setDataReady(true);
        } else {
            //setDataReady(true);
        }
    }




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
                        landMarks={landMarks}
                        setTaskBoxes={() => { }}
                        selectedTask={selectedTask}
                    />
                </div>

                <div className={"flex flex-col min-h-[100vh] w-1/2 overflow-auto"}>
                    <HeaderSection title={"Task Details"} isVideoReady={videoReady} fileName={fileName} fps={fps} boundingBoxes={boundingBoxes} taskBoxes={taskBoxes} />

                    <div className={"flex items-center justify-center gap-2 mt-2 mb-4"}>
                        <div className={"text-lg font-bold"}>Current task -</div>
                        <select className={"text-lg"} name="Tasks" id="tasks" value={selectedTask} onChange={e => {
                            // console.log(JSON.stringify(e.target.value));
                            setSelectedTask(e.target.value);
                            console.log(e.target.value)
                            console.log(tasks)
                        }}>
                            {
                                tasks.map((task, index) => <option key={index} value={index}>{task.name}</option>)
                            }
                        </select>
                        
                    </div>

                    {/*<PlotWidget  taskRecord={taskData} />*/}


                    {
                        taskToPlotMap.selectedTask == null
                        &&
                        <div className={"flex justify-center items-center h-full flex-col gap-4 w-full px-10 flex-1 py-4 overflow-y-scroll  "}>
                            <div>Analyse the task</div>
                            <Button variant="contained" onClick={() => { setOpenJsonUpload(true) }}>Analyse</Button>
                            <JSONUploadDialog dialogOpen={openJsonUpload} fps={fps} setDialogOpen={setOpenJsonUpload} handleJSONUpload={handleProcessing} boundingBoxes={boundingBoxes} videoRef={videoRef} tasks={tasks} selectedTask={selectedTask} />
                        </div>

                    }

                    {
                        taskToPlotMap.selectedTask != null
                        &&
                        <PlotWidget key={selectedTask} taskRecord={taskToPlotMap.selectedTask} videoRef={videoRef} startTime={taskBoxes[selectedTask].start} endTime={taskBoxes[selectedTask].end} />
                    }
                </div>
            </div>

        </div>
    );
}

export default TaskDetails;