import { useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import PlotWidget from "./PlotWidget";
import peaksData from "./peaks.json";
import wavesData from "./waveData.json";
import scatterPlotData from "./scatterPlot.json"

const TasksInfoPage = () => {

    const [tasksData, setTasksData] = useState([
        {
            taskName: "Finger Tap",
            startTime: "1.235",
            endTime: "4.387",
            linePlot: {
                lineData: {
                    data: wavesData.dataRight,
                    time: wavesData.timeRight
                },
                Peaks: {
                    data: peaksData.peaksRight.Peaks.data,
                    time: peaksData.peaksRight.Peaks.time
                },
                Valleys: {
                    data: peaksData.peaksRight.Valleys.data,
                    time: peaksData.peaksRight.Valleys.time
                }
            },
            radar: scatterPlotData
        },
        {
            taskName: "Toe Tap",
            startTime: "7.894",
            endTime: "12.456",
            linePlot: {
                lineData: {
                    data: wavesData.dataRight,
                    time: wavesData.timeRight
                },
                Peaks: {
                    data: peaksData.peaksRight.Peaks.data,
                    time: peaksData.peaksRight.Peaks.time
                },
                Valleys: {
                    data: peaksData.peaksRight.Valleys.data,
                    time: peaksData.peaksRight.Valleys.time
                }
            },
            radar: scatterPlotData
        },
        {
            taskName: "Hand Movement",
            startTime: "24.759",
            endTime: "29.503",
            linePlot: {
                lineData: {
                    data: wavesData.dataRight,
                    time: wavesData.timeRight
                },
                Peaks: {
                    data: peaksData.peaksRight.Peaks.data,
                    time: peaksData.peaksRight.Peaks.time
                },
                Valleys: {
                    data: peaksData.peaksRight.Valleys.data,
                    time: peaksData.peaksRight.Valleys.time
                }
            },
            radar: scatterPlotData
        }
    ]);

    const downloadCsvData = () => {
        // Prepare CSV data
        const csvData = [];

        // Add CSV header
        csvData.push(['task name', 'start time', 'end time', 'peaks_data', 'peaks_time', 'valleys_data', 'valleys_time']);

        // Add data for each task
        tasksData.forEach((taskRecord) => {
            const taskName = taskRecord.taskName;
            const startTime = taskRecord.startTime || '';
            const endTime = taskRecord.endTime || '';
            const peaks_data = `"${JSON.stringify(taskRecord.linePlot.Peaks.data)}"`;
            const peaks_time = `"${JSON.stringify(taskRecord.linePlot.Peaks.time)}"`;
            const valleys_data = `"${JSON.stringify(taskRecord.linePlot.Valleys.data)}"`;
            const valleys_time = `"${JSON.stringify(taskRecord.linePlot.Valleys.time)}"`;

            csvData.push([taskName, startTime, endTime, peaks_data, peaks_time, valleys_data, valleys_time]);
        });

        // Convert to CSV string
        const csvContent = csvData.map((row) => row.join(',')).join('\n');

        // Create a Blob
        const blob = new Blob([csvContent], { type: 'text/csv' });

        // Create a URL for the Blob
        const url = window.URL.createObjectURL(blob);

        // Create an anchor element for download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'tasks.csv';

        // Programmatically click the anchor element to initiate the download
        a.click();

        // Revoke the URL to free up resources
        window.URL.revokeObjectURL(url);
    };





    useEffect(() => {
        async function fetchTaskData() {
            // const taskIdArr = taskIds.split('&');
            // const data = [];
            // for (let taskIdx = 0; taskIdx < taskIdArr.length; taskIdx++) {
            //     const taskInfo = await getSingleTask(taskIdArr[taskIdx]);
            //     data.push(taskInfo);
            // }

            // videoRefs.current = videoRefs.current.slice(0, taskIdArr.length);
            // setTaskData(data);
        }
        fetchTaskData();
    }, []);

    const [selectedItems, setSelectedItems] = useState([]);

    const toggleItem = (item) => {
        if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter((selectedItem) => selectedItem !== item));
        } else {
            setSelectedItems([...selectedItems, item]);
        }
    };


    return (

        <div className="p-10 bg-slate-400 h-full">
            <div className="flex justify-end">
                <button onClick={downloadCsvData} className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Download CSV
                </button>
            </div>
            <div className="flex flex-col gap-4 w-4/5">
                {tasksData.map((taskRecord, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg">
                        <div onClick={() => toggleItem(taskRecord.taskName)} className="flex items-center gap-4"> {/* Use flex to align title and arrow */}
                            <span
                                className="cursor-pointer"
                            >
                                {selectedItems.includes(taskRecord.taskName) ? '▼' : '►'}
                            </span>
                            <div >
                                <h2>{taskRecord.taskName}</h2>
                            </div>

                        </div>
                        {selectedItems.includes(taskRecord.taskName) && (
                            <PlotWidget key={index} taskRecord={taskRecord} />
                        )}
                    </div>
                ))}
            </div>
        </div>



    );
}

export default TasksInfoPage;