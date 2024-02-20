import { red } from '@mui/material/colors';
import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';

const Popup = ({ taskRecord, videoRef, onClose }) => {



    const [plotData, setPlotdata] = useState(taskRecord.linePlot.data);
    const [plotTimes, setPlotTimes] = useState(taskRecord.linePlot.time);

    const [peaksData, setPeaksData] = useState(taskRecord.peaks.data);
    const [peaksTimes, setPeaksTimes] = useState(taskRecord.peaks.time);

    const [valleysData, setValleysData] = useState(taskRecord.valleys.data);
    const [valleysTimes, setValleysTimes] = useState(taskRecord.valleys.time);

    const [isMarkUp, setIsMarkUp] = useState(false);
    const [revision, setRevision] = useState(0);
    const [isAddNewPeakHigh, setIsAddNewPeakHigh] = useState(false);
    const [isAddNewPeakLow, setIsAddNewPeakLow] = useState(false);
    const [isViewinPlot, setIsViewinPlot] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState({});

    const [isKeyDown, setIsKeyDown] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const plotRef = useRef(null);

    useEffect(() => {
        // Add event listeners when the component mounts
        console.log("rerendered the component");
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', (event) => {
            if (event.isComposing || event.code === 229) {
                return;
            }
            handleKeyUp(event)
        });

        //Clean up the event listeners when the component unmounts
        return () => {
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }, [isMarkUp, selectedPoint, revision, isAddNewPeakHigh, isAddNewPeakLow]);

    const savePeaksAndValleys = () => {

        const waveData = {
            lineData: {
                data: plotData,
                time: plotTimes
            },
            Peaks: {
                data: peaksData,
                time: peaksTimes
            },
            Valleys: {
                data: valleysData,
                time: valleysTimes
            }
        }

        //savePlotData(taskRecord.uid,waveData);

        setIsSaved(false); // Set the saved state to true after saving

    }


    const handleSave = () => {

        if(peaksData.length != valleysData.length){
            window.alert('Different number of peaks and valleys, please correct');
            return;
        }

        const shouldSave = window.confirm('Do you want to save the changes?');

        console.log("should have : "+shouldSave);
        if (shouldSave) {
            savePeaksAndValleys();
        }
    };


    const handleKeyUp = (event) => {
        setIsKeyDown(false);
        console.log('triggered handle keyUp')
        switch (event.code) {
            case 'KeyQ':
                setIsAddNewPeakHigh(false);
                break;
            case 'KeyW':
                setIsAddNewPeakLow(false);
                break;
            case 'KeyV':
                isViewinPlot(false);
                break;
            default:
                break;
        }
    }

    const handleKeyDown = (event) => {
        // Handle key press
        // console.log('code-down', event.code)
        if (!isKeyDown) {
            setIsKeyDown(true);
            console.log("triggered handle down with event = ")
            console.log(event.code)
            console.log(selectedPoint.name)
            console.log(selectedPoint.idx)
            console.log("isMarkup =  " + isMarkUp)
            switch (event.code) {
                case 'KeyR':
                    if (isMarkUp) {
                        //find and remove the appropiate element in the array
                        if (selectedPoint.name === 'peak values') {
                            let newPeaksData = peaksData;
                            newPeaksData.splice(selectedPoint.idx, 1);
                            setPeaksData(newPeaksData);

                            let newPeaksTimes = peaksTimes;
                            newPeaksTimes.splice(selectedPoint.idx, 1);
                            setPeaksTimes(newPeaksTimes);
                        }
                        if (selectedPoint.name === 'valley values') {
                            let newValleysData = valleysData;
                            newValleysData.splice(selectedPoint.idx, 1);
                            setValleysData(newValleysData);

                            let newValleysTimes = valleysTimes;
                            newValleysTimes.splice(selectedPoint.idx, 1);
                            setValleysTimes(newValleysTimes);
                        }

                        // reset point
                        setSelectedPoint({});
                        setIsMarkUp(false);
                        setRevision(revision + 1);
                    }
                    break;
                case 'Escape':
                    if (isMarkUp) {
                        // reset point
                        console.log("Entered inside escape case");
                        setSelectedPoint({});
                        setIsMarkUp(false);
                        setRevision(revision + 1);
                    }
                    break;
                case 'KeyQ':
                    setIsAddNewPeakHigh(true);
                    break;
                case 'KeyW':
                    setIsAddNewPeakLow(true);
                    break;
                case 'KeyV':
                    setIsViewinPlot(true);
                    break;
                default:
                    break;
            }

        }

    }

    const handleClickonPlot = (data) => {

        videoRef.current.currentTime = data.points[0].x;
        videoRef.current.pause();

        console.log("Entered handclePlotClick with isMarkUp = " + isMarkUp);
        if (!isMarkUp) {
            // see if they click on a peak
            if (data.points[0].data.name === 'peak values') {
                if ((peaksData.some(e => e === data.points[0].y)) && (peaksTimes.some(e => e === data.points[0].x))) {
                    setSelectedPoint(handleSelectElementfromArray(peaksData, peaksTimes, data.points[0].x, data.points[0].data.name));
                }
            }

            if (data.points[0].data.name === 'valley values') {
                if ((valleysData.some(e => e === data.points[0].y)) && (valleysTimes.some(e => e === data.points[0].x))) {
                    setSelectedPoint(handleSelectElementfromArray(valleysData, valleysTimes, data.points[0].x, data.points[0].data.name));
                }
            }

            setRevision(revision + 1);
        }

        if (isAddNewPeakHigh) {

            let newPeaksData = peaksData;
            newPeaksData.push(data.points[0].y);
            setPeaksData(newPeaksData);

            let newPeaksTimes = peaksTimes;
            newPeaksTimes.push(data.points[0].x);
            setPeaksTimes(newPeaksTimes);

            setRevision(revision + 1);
        }

        if (isAddNewPeakLow) {

            let newValleysData = valleysData;
            newValleysData.push(data.points[0].y);
            setValleysData(newValleysData);

            let newValleysTimes = valleysTimes;
            newValleysTimes.push(data.points[0].x);
            setValleysTimes(newValleysTimes);

            setRevision(revision + 1);
        }

        console.log("Exiting handclePlotClick with isMarkUp = " + isMarkUp);

    }

    const handleSelectElementfromArray = (arrayValues, arrayTimes, element, name) => {

        if (!isMarkUp) //No mark up
        {
            setIsMarkUp(true);
            console.log("did set markup as true in state " + isMarkUp)
            const idx = arrayTimes.indexOf(element)
            const peak_data = [arrayValues[idx]]
            const peak_time = [arrayTimes[idx]]
            return { peak_data, peak_time, idx, name }
        }
    }

    const annotations = [
        {
            x: 0.5,
            y: 1.25, // Adjust this value to position the annotations on top of the plot
            xref: 'paper',
            yref: 'paper',
            text: '<b>Select Point</b> - (click)          <b>Remove Point</b> - (R)          <b>Add Peak</b> - (Q+click)          <b>Add Valley</b> - (W+click)',
            showarrow: false, // Do not show arrows for the annotations
            font: {
                size: 12,
                color: 'black',
                bold: true
            },
        },
    ];


    return (
        <div className="popup">
            <div className="popup-content">
                <button className="close-button" onClick={onClose}>
                    <b>X</b>
                </button>
                <div className="plotRef"  >
                    <Plot ref={plotRef}
                        data={
                            [
                                {
                                    y: plotData,
                                    x: plotTimes,
                                    type: 'scatter',
                                    mode: 'lines',
                                    marker: {
                                        color: '#1f77b4',
                                        width: 5
                                    }

                                },
                                {
                                    y: peaksData,
                                    x: peaksTimes,
                                    name: 'peak values',
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: {
                                        size: 10,
                                        color: '#41337A'
                                    }
                                },
                                {
                                    y: valleysData,
                                    x: valleysTimes,
                                    name: 'valley values',
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: {
                                        size: 10,
                                        color: '#76B041'
                                    }
                                },
                                {
                                    y: selectedPoint.peak_data,
                                    x: selectedPoint.peak_time,
                                    name: 'Selected Point',
                                    type: 'scatter',
                                    mode: 'markers',
                                    marker: {
                                        size: 13,
                                        color: '#01FDF6'
                                    }
                                }
                            ]
                        }
                        revision={revision}
                        onClick={(data) => handleClickonPlot(data)}
                        config={{
                            modeBarButtonsToRemove: [ 'zoom2d', 'select2d', 'lasso2d', 'resetScale2d', 'toImage'],
                            responsive: true,
                            displaylogo: false
                        }}
                        layout={{
                            // title: {
                            //     text: 'Your Plot Title',
                            //     font: {
                            //       size: 20,
                            //       family: 'Arial',
                            //     },
                            //     yref: 'paper', // Set reference to the paper (entire plot area)
                            //     y: 2
                            // },
                            annotations: annotations,
                            xaxis: { title: 'Time [s]' },
                            yaxis: { title: 'Distance [m]' },
                            autosize: false,
                            responsive: true,
                            datarevision: revision, // datarevision helps to update the plot when the data is updated 
                            uirevision: true // uirevision helps to maintain the current zoom leven when the state chages
                        }}
                    />
                </div>
                <div className="flex justify-center">
                    {revision!=0 ? <button type="submit" onClick={handleSave} className=" bg-menu px-2 w-36 h-10 text-white rounded-md mt-3 py-2 font-semibold hover:bg-sky-500">Save Points</button> : "" }
                </div>
            </div>
        </div>
    );
};

export default Popup;