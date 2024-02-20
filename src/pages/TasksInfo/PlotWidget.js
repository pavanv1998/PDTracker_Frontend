import { useEffect, useState } from "react";

import WaveImage from "./WaveGenerator";
import ScatterPlot from "./ScatterPlot";


const PlotWidget = (props) => {

    return (
        <div className={"flex flex-col h-full justify-center"}>
            <div className="pb-2 pt-2 min-w-full">
                {props.taskRecord.hasOwnProperty("linePlot") ? <WaveImage taskRecord={props.taskRecord} /> : ""}
            </div>

            <div>
                {props.taskRecord.hasOwnProperty("radar") ? <ScatterPlot taskRecord={props.taskRecord} /> : ""}
            </div>
        </div>
    );
}

export default PlotWidget;