import React, { useState } from 'react';

const TaskSelectionTab = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(null);
    const [taskName, setTaskName] = useState('');

    const startTask = () => {
        const startTime = new Date().toLocaleTimeString(); // Replace with actual video time
        setCurrentTask({ name: taskName, startTime, endTime: '' });
    };

    const stopTask = () => {
        if (currentTask) {
            const endTime = new Date().toLocaleTimeString(); // Replace with actual video time
            setCurrentTask({ ...currentTask, endTime });
            setTasks([...tasks, { ...currentTask, endTime }]);
            setCurrentTask(null);
            setTaskName('');
        }
    };

    const handleTaskNameChange = (e, index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index].name = e.target.value;
        setTasks(updatedTasks);
    };

    const handleTimeChange = (timeType, time, index) => {
        const updatedTasks = [...tasks];
        updatedTasks[index][timeType] = time;
        setTasks(updatedTasks);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-white shadow-md rounded-lg">
            <div className="mb-4">
                <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={startTask}>
                    Start Task
                </button>
                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={stopTask}>
                    Stop Task
                </button>
            </div>
            <input
                type="text"
                placeholder="Enter Task Name"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                className="px-3 py-2 border rounded shadow w-full mb-4"
            />
            <div className="mt-4 w-full max-h-96 overflow-auto">
                <div className="font-bold mb-2">Tasks:</div>
                {tasks.map((task, index) => (
                    <div key={index} className="border-b py-2 flex flex-col md:flex-row justify-between">
                        <input
                            type="text"
                            value={task.name}
                            onChange={(e) => handleTaskNameChange(e, index)}
                            className="px-2 py-1 border rounded mb-2 md:mb-0 md:mr-2"
                        />
                        <input
                            type="text"
                            value={task.startTime}
                            onChange={(e) => handleTimeChange('startTime', e.target.value, index)}
                            className="px-2 py-1 border rounded mb-2 md:mb-0 md:mr-2"
                        />
                        <input
                            type="text"
                            value={task.endTime}
                            onChange={(e) => handleTimeChange('endTime', e.target.value, index)}
                            className="px-2 py-1 border rounded"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskSelectionTab;
