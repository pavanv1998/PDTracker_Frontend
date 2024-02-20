import VideoPlayer from "../../components/commons/VideoPlayer/VideoPlayer";
import HeaderSection from "./HeaderSection";
import {useEffect, useRef, useState} from "react";
import TaskSelectionTab from "./TaskSelectionTab";
import TasksWaveForm from "./TasksWaveForm";
import TaskDetails from "../TaskDetails 2";

const TaskSelection = ({videoURL, setVideoURL, fileName, setFileName, setVideoData, boundingBoxes, setBoundingBoxes, setElement, fps, setFPS}) => {
    const videoRef = useRef(null);
    const [videoReady, setVideoReady] = useState(false);
    // const [fps, setFPS] = useState(60);
    const [tasks, setTasks] = useState([]);
    const [taskBoxes, setTaskBoxes] = useState([]);
    const [tasksReady, setTasksReady] = useState(false);

    useEffect(() => {
        if (!videoReady) {
            // setFPS(60);
        }
    }, [videoReady]);

    const getBoundingRectangleForRegion = (task) => {
        const startFrame = Math.ceil(task.start * fps);
        const endFrame = Math.floor(task.end * fps);
        let meanX = 0, meanY = 0, meanWidth = 0, meanHeight = 0, finalX = 20000, finalY = 20000, finalWidth = 0, finalHeight = 0;
        let total = 0;
        let finalBottom = 0, finalRight = 0;
        const regionFrameBoundingBoxes = [];

        for (let boundingBox of boundingBoxes) {
            if (boundingBox.frameNumber >= startFrame && boundingBox.frameNumber <=endFrame)
                regionFrameBoundingBoxes.push(boundingBox);
        }


        for (let regionFrameBoundingBox of regionFrameBoundingBoxes) {
            if (regionFrameBoundingBox.hasOwnProperty('data')) {
                for (let box of regionFrameBoundingBox.data) {
                    meanX = meanX + box.x;
                    meanY = meanY + box.y;
                    meanWidth = meanWidth + box.width;
                    meanHeight = meanHeight + box.height;
                    total += 1;
                }
            }
        }

        meanX = meanX / total;
        meanY = meanY / total;
        meanWidth = meanWidth / total;
        meanHeight = meanHeight / total;


        for (let regionFrameBoundingBox of regionFrameBoundingBoxes) {
            if (regionFrameBoundingBox.hasOwnProperty('data')) {
                for (let box of regionFrameBoundingBox.data) {
                    if (!(Math.abs(meanX - box.x) > meanX / 2 || Math.abs(meanY - box.y) > meanY / 2
                        || Math.abs(meanWidth - box.width) > meanWidth / 2 || Math.abs(meanHeight - box.height) > meanHeight / 2)) {
                        finalX = finalX > box.x ? box.x : finalX;
                        finalY = finalY > box.y ? box.y : finalY;
                        finalWidth = finalWidth < box.width ? box.width : finalWidth;
                        finalRight = finalRight < (box.width + box.x) ? (box.width + box.x) : finalRight;
                        finalBottom = finalBottom < (box.height + box.y) ? (box.height + box.y) : finalBottom;
                        finalHeight = finalHeight < box.height ? box.height : finalHeight;
                    }
                }
            }
        }


        const data = {
            x: finalX,
            y: finalY,
            width: finalRight - finalX,
            height: finalBottom - finalY
        }
        return {...task, ...data};
    }


    useEffect(() => {
        const newTaskBoxes = [];
        for (let task of tasks) {
            newTaskBoxes.push(getBoundingRectangleForRegion(task));
        }
        setTaskBoxes(newTaskBoxes);

    }, [tasks]);


    const onTaskChange = (newTask) => {
        const newTasks = tasks.map(task => task.id === newTask.id ? newTask : task);
        setTasks(newTasks);
    }

    const onTaskDelete = (deletedTask) => {
        const newTasks = tasks.filter(task => task.id !== deletedTask.id);
        setTasks(newTasks);
    }

    const onNewTask = (newTask) => {
        const newTasks = [...tasks, newTask];
        setTasks(newTasks);

    }

    const onFPSCalculation = (fps) => {
        setVideoReady(true);
    }

    const moveToNextScreen = () => {
        setElement(TaskDetails, {taskBoxes});
    }

    const resetTaskSelection = () => {
        setTasksReady(false);
        setTasks([]);
    }


    return (
        <div className="flex flex-col min-h-screen max-h-screen overflow-hidden">
            <div className="flex flex-1 flex-row max-h-screen flex-wrap">
                <div className={"flex w-1/2 max-h-screen bg-red-600"}>
                    <VideoPlayer
                        screen={"tasks"}
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
                        setTaskBoxes={setTaskBoxes}
                    />
                </div>
                <div className={"flex flex-col min-h-[100vh] w-1/2 "}>
                    <HeaderSection title={"Task selection"} isVideoReady={videoReady} fileName={fileName} fps={fps} boundingBoxes={boundingBoxes} taskBoxes={taskBoxes} moveToNextScreen={moveToNextScreen} />
                    <TasksWaveForm setTasks={setTasks} videoRef={videoRef} tasks={tasks} isVideoReady={videoReady} onNewTask={onNewTask} onTaskChange={onTaskChange} tasksReady={tasksReady} setTasksReady={setTasksReady}/>
                    <TaskSelectionTab setTasks={setTasks} setTaskBoxes={setTaskBoxes} tasksReady={tasksReady} setBoundingBoxes={setBoundingBoxes} setFPS={setFPS} tasks={tasks} onTaskChange={onTaskChange} onTaskDelete={onTaskDelete} isVideoReady={videoReady} videoRef={videoRef} taskReady={tasksReady} setTasksReady={setTasksReady} resetTaskSelection={resetTaskSelection}/>
                </div>
            </div>

        </div>
    );
}

export default TaskSelection;