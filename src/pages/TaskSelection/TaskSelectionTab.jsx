import React, {useState} from "react";
import TaskList from "./TaskList";
import Button from "@mui/material/Button";
import JSONUploadDialog from "./JSONUploadDialog";

const TaskSelectionTab = ({tasks, setBoundingBoxes, setTasks, setFPS, setTaskBoxes, onTaskChange, onTaskDelete, isVideoReady, videoRef, tasksReady, setTasksReady, resetTaskSelection}) => {
    const [openJsonUpload, setOpenJsonUpload] = useState(false);

    const getTasksFromTaskBoxes = (curTaskBoxes) => {
        const newTasks = [];
        for (let curTaskBox of curTaskBoxes) {
            const curTask = {
                id: curTaskBox?.id,
                start: curTaskBox?.start,
                end: curTaskBox?.end,
                name: curTaskBox?.name
            };
            newTasks.push(curTask);
        }

        return newTasks;

    }
    const jsonFileHandle = (jsonFileUploaded, jsonContent) => {
        if (jsonFileUploaded && jsonContent !== null) {
            if (jsonContent.hasOwnProperty("boundingBoxes")) {
                //new json
                setBoundingBoxes(jsonContent["boundingBoxes"]);
                setFPS(jsonContent["fps"]);
                if (jsonContent.hasOwnProperty("tasks")) {
                    const curTaskBoxes = jsonContent["tasks"];
                    setTaskBoxes(curTaskBoxes);
                    setTasks(getTasksFromTaskBoxes(curTaskBoxes));
                }
            } else {
                //old json
                const transformedData = jsonContent.map((item, index) => ({
                    start: item.start,
                    end: item.end,
                    name: item.attributes.label,
                    id: index + 1
                }));
                setTasks(transformedData);
            }

            console.log("JSON file details captured and added.")
            setTasksReady(true);
        } else {
            setTasksReady(true);
        }
    }

    return (
        <div className={"flex p-2 flex-1 h-full w-full flex-col "}>
            {
                isVideoReady && !tasksReady
                &&
                <div className={"flex justify-center items-center h-full flex-col gap-4 w-full px-10 flex-1 py-4 overflow-y-scroll  bg-gray-200 "}>
                    <div>Setup the tasks</div>
                    <Button variant="contained" onClick={()=> {setOpenJsonUpload(true)}}>Setup</Button>
                    <JSONUploadDialog dialogOpen={openJsonUpload} setDialogOpen={setOpenJsonUpload} handleJSONUpload={jsonFileHandle} videoRef={videoRef}/>
                </div>
            }
            {
                isVideoReady && tasksReady
                &&
                <TaskList tasks={tasks} onTaskChange={onTaskChange} onTaskDelete={onTaskDelete} videoRef={videoRef} resetTaskSelection={resetTaskSelection}/>
            }

        </div>
    )
}

export default TaskSelectionTab;