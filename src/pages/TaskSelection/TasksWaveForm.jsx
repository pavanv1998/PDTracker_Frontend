import React, {useEffect, useRef, useState} from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/plugins/regions";
import CircularProgressWithLabel from "../SubjectResolution/CircularProgressWithLabel";
import {Slider} from "@mui/material";
import HoverPlugin from "wavesurfer.js/plugins/hover";

const TasksWaveForm = ({setTasks, videoRef, tasks, isVideoReady, setTasksReady, tasksReady, onNewTask, onTaskChange}) => {
    const waveformRef = useRef(null);
    const waveSurfer = useRef(null);
    const waveSurferRegions = useRef(null);
    const [waveLoading, setWaveLoading] = useState(false);
    const [loadPercent, setLoadPercent] = useState(0);
    const tasksRef = useRef(tasks);

    useEffect(() => {

        if (!isVideoReady)
            return;

        if (waveSurfer.current === null)
            waveSurfer.current = WaveSurfer.create(getWaveSurferOptions());
        else {
            waveSurfer.current.destroy();
            waveSurfer.current = WaveSurfer.create(getWaveSurferOptions());
        }


        waveSurfer.current.on("loading", (percent) => {
            setLoadPercent(percent);
            setWaveLoading(true);
        });
        waveSurfer.current.on("ready", () => {
            setWaveLoading(false);
        });

        waveSurferRegions.current = waveSurfer.current.registerPlugin(RegionsPlugin.create());
        waveSurferRegions.current.enableDragSelection();
        waveSurfer.current.registerPlugin(HoverPlugin.create({}));

        waveSurferRegions.current?.on("region-updated", handleRegionUpdate);
        waveSurferRegions.current?.on("region-created", handleNewRegionDrag);

        // Cleanup on unmount
        return () => {
            waveSurfer.current?.destroy();
        };
    }, [isVideoReady]);

    useEffect(() => {
        tasksRef.current = tasks;
    }, [tasks]);



    useEffect(() => {

        waveSurferRegions.current?.on("region-created", handleNewRegionDrag);
        waveSurferRegions.current?.on("region-updated", handleRegionUpdate);

        const getTaskById = (id) => {
            return tasks.find(task => task.id === id);
        }

        let curRegions = waveSurferRegions.current?.getRegions();

        if (curRegions && curRegions.length !== tasksRef.current?.length)
            updateRegions();

        curRegions = waveSurferRegions.current?.getRegions();

        if (curRegions) {
            for (let region of curRegions) {
                const curTask = getTaskById(region.id);
                if (curTask) {
                    if (curTask.start !== region.start || curTask.end !== region.end || curTask.name !== region.content) {
                        region.setOptions({
                            ...region.options,
                            start: curTask.start,
                            end: curTask.end,
                            content: curTask.name
                        });
                    }
                }
            }
        }
    }, [tasks]);

    const updateRegions = () => {
        const wsRegions = waveSurferRegions.current;
        if (wsRegions) {
            wsRegions.clearRegions();
            const curTasks = tasksRef.current;
            for (let curTask of curTasks) {
                wsRegions.addRegion({
                    id: curTask.id,
                    start: curTask.start,
                    end: curTask.end,
                    content: curTask.name
                })
            }
        }
    }


    const handleNewRegionDrag = (region) => {

        if (region.content)
            return;

        const taskId = getHighestId() + 1;
        const startTime = Number(Number(region.start).toFixed(3));
        const endTime = Number(Number(region.end).toFixed(3));
        const regionName = `Region ${taskId}`;

        region.setContent(regionName);
        region.setOptions({
            ...region.options, id: taskId
        });

        const newTask = {
            start: startTime,
            end: endTime,
            name: regionName,
            id: taskId
        };

        setTasks([...tasksRef.current, newTask]);

        if (!tasksReady)
            setTasksReady(true);
    };

    const handleRegionUpdate = (region) => {
        const updatedTasks = tasksRef.current.map(task => {
            if (task.id === region.id && (task.start !== region.start || task.end !== region.end)) {
                const startTime = Number(Number(region.start).toFixed(3));
                const endTime = Number(Number(region.end).toFixed(3));
                region.setOptions({
                    ...region.options,
                    start: startTime,
                    end: endTime
                });
                return {
                    ...task,
                    start: startTime,
                    end: endTime
                };
            } else {
                return {...task};
            }
        });
        setTasks(updatedTasks);
    }

    const getWaveSurferOptions = () => {
        return {
            container: waveformRef.current,
            waveColor: 'violet',
            progressColor: 'purple',
            cursorColor: 'navy',
            barWidth: 2,
            barRadius: 3,
            responsive: true,
            height: 100,
            minPxPerSec: (680 / videoRef.current.duration),
            autoScroll: true,
            normalize: true,
            zoom: true,
            scrollParent: true,
            media: videoRef.current
        };
    }

    const onZoomChange = (zoomLevel) => {
        if (isVideoReady) {
            let pxPerSec = (670 / videoRef.current?.duration) * zoomLevel;
            if (waveSurfer.current !== null && !waveLoading)
                waveSurfer.current.zoom(pxPerSec);
        }
    }

    // const onRegionUpdate = (region) => {
    //     let updatedTask = {
    //         start: Number(Number(region.start).toFixed(3)),
    //         end: Number(Number(region.end).toFixed(3)),
    //         name: `Region ${region.id}`,
    //         id: region.id
    //     }
    //
    //     onTaskChange(updatedTask);
    // }

    const getHighestId = () => {
        const curTasks = tasksRef.current;
        let maxId = curTasks[0]?.id;
        if (maxId) {
            for (let task of curTasks) {
                if (task.id > maxId) {
                    maxId = task.id;
                }
            }
        } else {
            return 0;
        }
        return maxId;
    }

    return (
        <>
            <div className={"flex flex-col gap-2 justify-center items-center w-full pt-4 px-2"}>
                <div className={"flex flex-col gap-2 justify-center items-center w-full pt-4 px-2"}>
                    {
                        isVideoReady
                        &&
                        <div className={"flex items-center justify-between w-full"}>
                            <div
                                className={"w-full font-semibold text-center"}>Waveform {waveLoading && "loading ..."}
                            </div>
                            <Slider
                                orientation={"horizontal"}
                                min={1}
                                max={10}
                                step={0.1}
                                onChange={(e) => {
                                    onZoomChange(e.target.value);
                                }}
                                style={{width: 200}}
                                aria-label={"Zoom"}
                                valueLabelFormat={(value) => value + "x"}
                            />
                        </div>
                    }
                    {
                        isVideoReady && waveLoading
                        &&
                        <CircularProgressWithLabel value={loadPercent} size={80}/>
                    }
                </div>
                <div id="waveform" className="flex w-full px-8 py-4 overflow-x-scroll overflow-y-hidden"
                     ref={waveformRef}/>
            </div>
        </>

    );
}

export default TasksWaveForm;