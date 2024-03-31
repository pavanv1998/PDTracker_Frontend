import {RestartAlt, TouchApp} from '@mui/icons-material';
import {IconButton} from "@mui/material";
import Creatable from 'react-select/creatable';
import {useState} from "react";

const taskOptions = [
    { label: 'Gait', value: 'Gait' },
    { label: 'Hand movement - Left', value: 'Hand movement - Left' },
    { label: 'Hand movement - Right', value: 'Hand movement - Right' },
    { label: 'Dynamic tremor', value: 'Dynamic tremor' },
    { label: 'Mouth Opening', value: 'Mouth Opening' },
    { label: 'Toe tapping - Left', value: 'Toe tapping - Left' },
    { label: 'Toe tapping - Right', value: 'Toe tapping - Right' },
    { label: 'Passage', value: 'Passage' },
    { label: 'Free speech', value: 'Free speech' },
    { label: 'Hand Tremor', value: 'Hand Tremor' },
    { label: 'Finger Tap - Left', value: 'Finger Tap - Left' },
    { label: 'Finger Tap - Right', value: 'Finger Tap - Right' },
    { label: 'Hand pronation', value: 'Hand pronation' },
    { label: 'Phonation', value: 'Phonation' },
    { label: 'Postural tremor', value: 'Postural tremor' },
    { label: 'DDK', value: 'DDK' },
    { label: 'Eyebrow elevation', value: 'Eyebrow elevation' },
    { label: 'Picture Description', value: 'Picture Description' },
    { label: 'Rest tremor', value: 'Rest tremor' },
    { label: 'Leg agility - Left', value: 'Leg agility - Left' },
    { label: 'Leg agility - Right', value: 'Leg agility - Right' },
    { label: 'Lips spread', value: 'Lips spread' },
    { label: 'Arising from chair', value: 'Arising from chair' }
];


const Task = ({task, onFieldChange, onTaskDelete, onTimeMark, onTimeClick, options, setOptions}) => {
    const [selectedOption, setSelectedOption] = useState(null);

    // const handleNewOption = (option) => {
    //     const newOption = {label: option, value: option};
    //     setOptions([...options, newOption]);
    //     handleTaskChange(newOption);
    // }

    const getSelectBorderColor = () => {
        if (selectedOption === null)
            return 'gray';

        let flag = false;
        options.forEach(option => {
            if (option.value === selectedOption.value) {
                flag = true;
            }
        })

        return flag ? 'green' : 'red';
    }
    const handleTaskChange = (selectedTask) => {
        setSelectedOption(selectedTask);
        onFieldChange(selectedTask.value, "name", task);
    }
    return (
        <div className={"flex justify-between gap-2"} key={task.id}>
            {/*<input className={"p-2 w-1/4"} onChange={e => onFieldChange(e, "name", task)} value={task.name}/>*/}
            <div className={"w-1/4"}>
                <Creatable
                    options={options}
                    value={{label: task.name, value: task.name}}
                    onChange={handleTaskChange}
                    // onCreateOption={handleNewOption}
                    placeholder={"Select or add"}
                    styles={{
                        control: (baseStyles, state) => ({
                            ...baseStyles,
                            borderColor: getSelectBorderColor(),
                            borderWidth: 2
                        }),
                    }}
                />
            </div>
            <input className={"p-2 w-1/4"} type={"number"} onChange={e => onFieldChange(e.target.value, "start", task)}
                   onDoubleClick={e => onTimeClick(e.target.value)} min={0} value={task.start}/>
            <IconButton aria-label="mark" title={"Mark start time"} onClick={() => onTimeMark("start", task)}>
                <TouchApp/>
            </IconButton>
            <input className={"p-2 w-1/4"} type={"number"} onChange={e => onFieldChange(e.target.value, "end", task)}
                   onDoubleClick={e => onTimeClick(e.target.value)} min={0} value={task.end}/>
            <IconButton aria-label="mark" title={"Mark end time"} onClick={() => onTimeMark("end", task)}>
                <TouchApp/>
            </IconButton>

            <button
                className={"p-2 px-4 rounded-md bg-red-600 text-white font-bold"}
                onClick={() => onTaskDelete(task)}
            >
                X
            </button>

            {/*<div>{selectedOption}</div>*/}
        </div>
    );
}

const TaskListLabels = ({resetTaskSelection}) => {
    return (
        <div className={"flex justify-between gap-2 items-center"}>
            <div className={"font-bold"}>Task name</div>
            <div className={"font-bold"}>Start time</div>
            <div className={"font-bold"}>End time</div>
            {/*<div className={"rounded-md bg-gray-800 text-white p-2 px-4 opacity-0 disabled"}>+ </div>*/}
            <div className={"flex gap-2"}>
                <button
                    className={"p-2 pl-2 px-4 rounded-md bg-blue-600 text-white font-bold flex flex-row gap-2"}
                    onClick={resetTaskSelection}
                    // onClick={() => onTaskDelete(task)}
                >
                    <RestartAlt/>
                </button> 
                <button
                    className={"p-2 pl-2 px-4 rounded-md bg-blue-600 text-white font-bold flex flex-row gap-2"}
                    onClick={resetTaskSelection}
                    // onClick={() => onTaskDelete(task)}
                >
                    <RestartAlt/> Reset
                </button>
            </div>
        </div>
    )
}

const TaskList = ({tasks, onTaskChange, onTaskDelete, videoRef, resetTaskSelection}) => {

    const [options, setOptions] = useState(taskOptions);


    const onFieldChange = (newValue, fieldName, task) => {
        let newTask = {...task};

        newTask[fieldName] = fieldName === "start" || fieldName === "end" ? Number(Number(newValue).toFixed(3)) : newValue;
        onTaskChange(newTask);
    }

    const onTimeMark = (fieldName, task) => {
        let newTask = {...task};
        newTask[fieldName] = Number(Number(videoRef.current.currentTime).toFixed(3));
        onTaskChange(newTask);
    }

    const onTimeClick = (time) => {
        if (videoRef.current)
            videoRef.current.currentTime = time;
    }

    return (
        <div className={"px-10 flex-1 py-4 flex flex-col gap-4 h-full overflow-y-scroll  bg-gray-200 "}>
            <TaskListLabels resetTaskSelection={resetTaskSelection}/>
            {
                tasks.map((task, index) => (
                    <Task key={index} task={task} onFieldChange={onFieldChange} onTaskDelete={onTaskDelete}
                          onTimeMark={onTimeMark} onTimeClick={onTimeClick} options={options} setOptions={setOptions}/>
                ))
            }
        </div>
    )
}

export default TaskList;