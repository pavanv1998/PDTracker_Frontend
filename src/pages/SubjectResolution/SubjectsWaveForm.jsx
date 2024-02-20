import React, {useEffect, useRef, useState} from 'react';
import WaveSurfer from 'wavesurfer.js';
import RegionsPlugin from "wavesurfer.js/plugins/regions";
// import {CircularProgress} from "@mui/material";
import CircularProgressWithLabel from "./CircularProgressWithLabel";
import {Slider} from "@mui/material";

const SubjectsWaveForm = ({videoRef, persons, isVideoReady, boxesReady}) => {
    const waveformRef = useRef(null);
    const waveSurfer = useRef(null);
    const [waveLoading, setWaveLoading] = useState(false);
    const [loadPercent, setLoadPercent] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);


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
        })
        waveSurfer.current.on("ready", () => {
            setWaveLoading(false);
        })

        console.log("Wavesurfer created");

        // Cleanup on unmount
        return () => waveSurfer.current?.destroy();
    }, [isVideoReady]);

    useEffect(() => {
        if (!boxesReady || waveSurfer.current === null)
            return;

        const wsRegions = waveSurfer.current.registerPlugin(RegionsPlugin.create());

        if (persons) {
            persons.forEach((subject) => {
                const timestamp = subject.timestamp;
                wsRegions.addRegion({
                    start: timestamp,
                    end: timestamp, // End of the region, you might want to define it accordingly
                    content: subject.id + "",
                    drag: false,
                    resize: false
                });
            });
        }

    }, [boxesReady, persons]);

    // useEffect(() => {
    //     if ( isVideoReady) {
    //         let pxPerSec = (680/videoRef.current?.duration) * zoomLevel;
    //         if (waveSurfer.current !== null && !waveLoading)
    //             waveSurfer.current.zoom(pxPerSec);
    //     }
    // }, [zoomLevel, isVideoReady])

    const onZoomChange = (zoomLevel) => {
        if ( isVideoReady) {
            let pxPerSec = (680/videoRef.current?.duration) * zoomLevel;
            if (waveSurfer.current !== null && !waveLoading)
                waveSurfer.current.zoom(pxPerSec);
        }
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
            minPxPerSec: (680/videoRef.current.duration),
            autoScroll:true,
            normalize: true,
            splitChannels: false,
            media: videoRef.current
        };
    }



    return (
        <>
            <div className={"flex flex-col gap-2 justify-center items-center w-full border-t-2 pt-4 px-2"}>
                {
                    isVideoReady
                    &&
                    <div className={"flex items-center justify-between w-full"}>
                        <div className={"w-full font-semibold text-center"}>Waveform {waveLoading && "loading ..."}</div>

                        <Slider
                            orientation={"horizontal"}
                            min={1}
                            max={10}
                            step={0.1}
                            value={zoomLevel}
                            onChange={(e) => {
                                setZoomLevel(e.target.value);
                                onZoomChange(e.target.value);
                            }}
                            style={{width: 200}}
                            aria-label={"Zoom"}
                            // valueLabelDisplay="on"
                            valueLabelFormat={(value) => value + "x"}
                        />
                    </div>


                }

                {
                    isVideoReady && waveLoading
                    &&
                    <CircularProgressWithLabel value={loadPercent} size={80} />
                }
            </div>
            <div id="waveform" className="flex w-full px-8 py-4 overflow-x-scroll overflow-y-hidden" ref={waveformRef}  />
        </>


    );
};

export default SubjectsWaveForm;
