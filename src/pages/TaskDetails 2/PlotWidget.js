import { useEffect, useState } from "react";

import WaveImage from "./WaveImage";
import ScatterPlot from "./ScatterPlot";


const PlotWidget = (props) => {

    return (
        <div className="overflow-scroll">
            <div className="pt-2 border-b border-gray-300">
                {props.taskRecord.hasOwnProperty("linePlot") ? <WaveImage taskRecord={props.taskRecord} videoRef={props.videoRef} startTime={props.startTime} endTime={props.endTime} handleJSONUpload={props.handleJSONUpload} /> : ""}
            </div>

            <div className="pt-6">
                {props.taskRecord.hasOwnProperty("radar") ? <ScatterPlot taskRecord={props.taskRecord} /> : ""}
            </div>
        </div>

    );
}

export default PlotWidget;