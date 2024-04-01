import React, { useState, useRef, useEffect } from 'react';
import Plot from 'react-plotly.js';

const WavePlotEditable = ({ taskRecord, videoRef, onClose, startTime, endTime, handleJSONUpload }) => {



    const [plotData, setPlotdata] = useState(taskRecord.linePlot.data);
    const [plotTimes, setPlotTimes] = useState(taskRecord.linePlot.time);

    const [peaksData, setPeaksData] = useState(taskRecord.peaks.data);
    const [peaksTimes, setPeaksTimes] = useState(taskRecord.peaks.time);

    // const [valleysData, setValleysData] = useState(taskRecord.valleys?.data);
    // const [valleysTimes, setValleysTimes] = useState(taskRecord.valleys.time);

    const [valleysStartData, setValleysStartData] = useState(taskRecord.valleys_start.data);
    const [valleysStartTime, setValleysStartTime] = useState(taskRecord.valleys_start.time);

    const [valleysEndData, setValleysEndData] = useState(taskRecord.valleys_end.data);
    const [valleysEndTimes, setValleysEndTime] = useState(taskRecord.valleys_end.time);

    const [blurEnd, setBlurEnd] = useState(startTime);
    const [blurStart, setBlurStart] = useState(endTime);

    const [popupMsg, setPopupMsg] = useState('');
    const [showPopup, setShowPopup] = useState(false);

    const [alertPopupMsg, setAlertPopupMsg] = useState('');
    const [showAlertPopup, setShowAlertPopup] = useState(false);
    const [alertAgreed, setAlertAgreed] = useState(false);


    const [addNewPoint, setAddNewPoint] = useState(false);
    const [showAddButton, setShowAddButton] = useState(false);
    const [addPointName, setAddPointName] = useState('valley_start');

    // const [valleysData, setValleysData] = useState([...taskRecord.valleys_start.data, ...taskRecord.valleys_end.data]);
    // const [valleysTimes, setValleysTimes] = useState([...taskRecord.valleys_start.time, ...taskRecord.valleys_end.time]);

    const [isMarkUp, setIsMarkUp] = useState(false);
    const [revision, setRevision] = useState(0);
    const [isAddNewPeakHigh, setIsAddNewPeakHigh] = useState(false);
    const [isAddNewPeakLowStart, setIsAddNewPeakLowStart] = useState(false);
    const [isAddNewPeakLowEnd, setIsAddNewPeakLowEnd] = useState(false);
    const [isViewinPlot, setIsViewinPlot] = useState(false);
    const [selectedPoint, setSelectedPoint] = useState({});

    const [isKeyDown, setIsKeyDown] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    const [videoCurrentTime, setVideoCurrentTime] = useState(startTime); // Initialize to 0

    const plotRef = useRef(null);

    // Effect to update state when taskRecord prop changes
    useEffect(() => {
        setPlotdata(taskRecord.linePlot.data);
        setPlotTimes(taskRecord.linePlot.time);

        setPeaksData(taskRecord.peaks.data)
        setPeaksTimes(taskRecord.peaks.time)

        setValleysStartData(taskRecord.valleys_start.data);
        setValleysStartTime(taskRecord.valleys_start.time);

        setValleysEndData(taskRecord.valleys_end.data)
        setValleysEndTime(taskRecord.valleys_end.time)

        setRevision(revision+1);
        // Update other state variables if needed
    }, [taskRecord]);


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
    }, [isMarkUp, selectedPoint, revision, isAddNewPeakHigh, isAddNewPeakLowStart, isAddNewPeakLowEnd]);

    useEffect(() => {
        const handleTimeUpdate = () => {
            setVideoCurrentTime(videoRef.current.currentTime);
        };

        const videoElement = videoRef.current;
        videoElement.addEventListener('timeupdate', handleTimeUpdate);

        return () => {
            videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        };
    }, []);

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
            Valleys_Start: {
                data: valleysStartData,
                time: valleysStartTime
            },
            Valleys_End: {
                data: valleysEndData,
                time: valleysEndTimes
            }
        }

        //savePlotData(taskRecord.uid,waveData);

        setIsSaved(false); // Set the saved state to true after saving

    }


    const handleSave = () => {

        // if (peaksData.length != valleysData.length) {
        //     window.alert('Different number of peaks and valleys, please correct');
        //     return;
        // }

        const shouldSave = window.confirm('Do you want to save the changes?');

        console.log("should have : " + shouldSave);
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
                setIsAddNewPeakLowStart(false);
                break;
            case 'KeyE':
                setIsAddNewPeakLowEnd(false);
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
                        // if (selectedPoint.name === 'peak values') {
                        //     let newPeaksData = peaksData;
                        //     newPeaksData.splice(selectedPoint.idx, 1);
                        //     setPeaksData(newPeaksData);

                        //     let newPeaksTimes = peaksTimes;
                        //     newPeaksTimes.splice(selectedPoint.idx, 1);
                        //     setPeaksTimes(newPeaksTimes);
                        // }
                        // if (selectedPoint.name === 'valley start') {
                        //     let newValleysStartData = valleysStartData;
                        //     newValleysStartData.splice(selectedPoint.idx, 1);
                        //     setValleysStartData(newValleysStartData);

                        //     let newValleysStartTimes = valleysStartTime;
                        //     newValleysStartTimes.splice(selectedPoint.idx, 1);
                        //     setValleysStartTime(newValleysStartTimes);
                        // }
                        // if (selectedPoint.name === 'valley end') {
                        //     let newValleysEndData = valleysEndData;
                        //     newValleysEndData.splice(selectedPoint.idx, 1);
                        //     setValleysEndData(newValleysEndData);

                        //     let newValleysEndTimes = valleysEndTimes;
                        //     newValleysEndTimes.splice(selectedPoint.idx, 1);
                        //     setValleysEndTime(newValleysEndTimes);
                        // }

                        if (!alertAgreed) {
                            setAlertPopupMsg('On removing this point, the valley start, peak and valley end related to that point will also be removed. Do you still want to remove the point ?');
                            setShowAlertPopup(true);
                            break;
                        }

                        if (selectedPoint.name === 'peak values' || selectedPoint.name === 'valley start' || selectedPoint.name === 'valley end') {
                            //remove the peaks
                            let newPeaksData = peaksData;
                            newPeaksData.splice(selectedPoint.idx, 1);
                            setPeaksData(newPeaksData);

                            let newPeaksTimes = peaksTimes;
                            newPeaksTimes.splice(selectedPoint.idx, 1);
                            setPeaksTimes(newPeaksTimes);

                            //remove the valleys start
                            let newValleysStartData = valleysStartData;
                            newValleysStartData.splice(selectedPoint.idx, 1);
                            setValleysStartData(newValleysStartData);

                            let newValleysStartTimes = valleysStartTime;
                            newValleysStartTimes.splice(selectedPoint.idx, 1);
                            setValleysStartTime(newValleysStartTimes);

                            //remove the valleys End
                            let newValleysEndData = valleysEndData;
                            newValleysEndData.splice(selectedPoint.idx, 1);
                            setValleysEndData(newValleysEndData);

                            let newValleysEndTimes = valleysEndTimes;
                            newValleysEndTimes.splice(selectedPoint.idx, 1);
                            setValleysEndTime(newValleysEndTimes);

                            setShowAddButton(true);
                            setAlertAgreed(false);
                        }

                        // reset point
                        setSelectedPoint({});
                        setIsMarkUp(false);
                        resetBlurValues();
                        setRevision(revision + 1);
                        

                    }
                    break;
                case 'Escape':
                    if (isMarkUp) {
                        // reset point
                        console.log("Entered inside escape case");
                        setSelectedPoint({});
                        resetBlurValues();
                        setIsMarkUp(false);
                        setRevision(revision + 1);
                    }
                    if (!isMarkUp && addNewPoint) {
                        //remove the valleys start at the end
                        let newValleysStartData = valleysStartData;
                        newValleysStartData.splice(valleysStartData.length - 1, 1);
                        setValleysStartData(newValleysStartData);

                        let newValleysStartTimes = valleysStartTime;
                        newValleysStartTimes.splice(valleysStartTime.length - 1, 1);
                        setValleysStartTime(newValleysStartTimes)

                        if (addPointName === 'valley_end') {

                            //remove the peaks also
                            let newPeaksData = peaksData;
                            newPeaksData.splice(peaksData.length - 1, 1);
                            setPeaksData(newPeaksData);

                            let newPeaksTimes = peaksTimes;
                            newPeaksTimes.splice(peaksTimes.length - 1, 1);
                            setPeaksTimes(newPeaksTimes);
                        }
                        setRevision(revision + 1);
                        closePopup();
                        setAddNewPoint(false);
                        setShowAddButton(true);
                        resetBlurValues();
                        setAddPointName('valley_start');
                    }
                    break;
                case 'KeyQ':
                    setIsAddNewPeakHigh(true);
                    break;
                case 'KeyW':
                    setIsAddNewPeakLowStart(true);
                    break;
                case 'KeyE':
                    setIsAddNewPeakLowEnd(true);
                    break;
                case 'KeyV':
                    setIsViewinPlot(true);
                    break;
                default:
                    break;
            }

        }

    }

    const addPoint = () => {
        setShowAddButton(false);
        //TODO :: display the popup
        showPopUp('please start adding the valley start point');
        setAddNewPoint(true);
    }

    const addNewPeakAndValley = (data) => {
        if (addPointName === 'valley_start') {
            let newX = data.points[0].x;

            if (isBetweenValleys(newX)) {
                showPopUp('You are trying to place new valley start between other valleys. So please select a new point');
            }
            else {
                let newValleysStartData = valleysStartData;
                newValleysStartData.push(data.points[0].y);
                setValleysStartData(newValleysStartData);

                let newValleysStartTimes = valleysStartTime;
                newValleysStartTimes.push(data.points[0].x);
                setValleysStartTime(newValleysStartTimes);

                setRevision(revision + 1);
                setAddPointName('peak');
                setBlurEnd(data.points[0].x);
                setBlurStart(getNextClosestPoint(data.points[0].x));
                showPopUp('Now please start adding the new peak');
            }
        }

        else if (addPointName === 'peak') {
            let newX = data.points[0].x;

            if (validatePeak(newX)) {
                let newPeaksData = peaksData;
                newPeaksData.push(data.points[0].y);
                setPeaksData(newPeaksData);

                let newPeaksTimes = peaksTimes;
                newPeaksTimes.push(data.points[0].x);
                setPeaksTimes(newPeaksTimes);

                setRevision(revision + 1);
                setAddPointName('valley_end');
                setBlurEnd(data.points[0].x);
                setBlurStart(getNextClosestPoint(data.points[0].x));
                showPopUp('Now please start adding the valley end');
            }
            else {
                showPopUp('You are trying to place new peak in other valley');
            }
        }

        else if (addPointName === 'valley_end') {
            let newX = data.points[0].x;

            if (validateValleyEnd(newX)) {
                let newValleysEndData = valleysEndData;
                newValleysEndData.push(data.points[0].y);
                setValleysEndData(newValleysEndData);

                let newValleysEndTimes = valleysEndTimes;
                newValleysEndTimes.push(data.points[0].x);
                setValleysEndTime(newValleysEndTimes);

                setRevision(revision + 1);
                closePopup();
                setAddNewPoint(false);
                setShowAddButton(true);
                resetBlurValues();
                setAddPointName('valley_start');
                updateRadarTable();
            }
            else {
                showPopUp('You are trying to place new valley end in other valley');
            }
        }
    }

    const getNextClosestPoint = (newX) => {
        let min = endTime;
        for (let i = 0; i < valleysStartTime.length; i++) {
            if (valleysStartTime[i] > newX && valleysStartTime[i] < min) {
                min = valleysStartTime[i];
            }
        }
        return min;
    }

    const validatePeak = (newX) => {
        let newvalleyStart = valleysStartTime[valleysStartTime.length - 1];
        if (newX < newvalleyStart) return false;
        for (let i = 0; i < peaksTimes.length; i++) {
            if ((peaksTimes[i] >= newvalleyStart && peaksTimes[i] <= newX)
                || (valleysStartTime[i] >= newvalleyStart && valleysStartTime[i] <= newX)
                || (valleysEndTimes[i] >= newvalleyStart && valleysEndTimes[i] <= newX)) {
                return false;
            }
        }
        return true;
    }

    const validateValleyEnd = (newX) => {
        let newPeak = peaksTimes[peaksTimes.length - 1];
        if (newX < newPeak) return false;
        for (let i = 0; i < valleysEndTimes.length; i++) {
            if ((peaksTimes[i] >= newPeak && peaksTimes[i] <= newX)
                || (valleysStartTime[i] >= newPeak && valleysStartTime[i] <= newX)
                || (valleysEndTimes[i] >= newPeak && valleysEndTimes[i] <= newX)) {
                return false;
            }
        }
        return true;
    }

    const isBetweenValleys = (newX) => {
        for (let i = 0; i < valleysStartTime.length; i++) {
            if (newX >= valleysStartTime[i] && newX <= valleysEndTimes[i]) {
                return true;
            }
        }
        return false;
    };


    const handleClickonPlot = (data) => {

        videoRef.current.currentTime = data.points[0].x;
        videoRef.current.pause();

        console.log("Entered handclePlotClick with isMarkUp = " + isMarkUp);

        if (!isMarkUp && addNewPoint) {
            addNewPeakAndValley(data);
        }

        else if (!isMarkUp) {
            // see if they click on a peak
            if (data.points[0].data.name === 'peak values') {
                if ((peaksData.some(e => e === data.points[0].y)) && (peaksTimes.some(e => e === data.points[0].x))) {
                    setSelectedPoint(handleSelectElementfromArray(peaksData, peaksTimes, data.points[0].x, data.points[0].data.name));
                }
            }

            if (data.points[0].data.name === 'valley start') {
                if ((valleysStartData.some(e => e === data.points[0].y)) && (valleysStartTime.some(e => e === data.points[0].x))) {
                    setSelectedPoint(handleSelectElementfromArray(valleysStartData, valleysStartTime, data.points[0].x, data.points[0].data.name));
                }
            }

            if (data.points[0].data.name === 'valley end') {
                if ((valleysEndData.some(e => e === data.points[0].y)) && (valleysEndTimes.some(e => e === data.points[0].x))) {
                    setSelectedPoint(handleSelectElementfromArray(valleysEndData, valleysEndTimes, data.points[0].x, data.points[0].data.name));
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
            updateRadarTable();
        }

        else if (isAddNewPeakLowStart) {

            // let newValleysData = valleysData;
            // newValleysData.push(data.points[0].y);
            // setValleysData(newValleysData);

            // let newValleysTimes = valleysTimes;
            // newValleysTimes.push(data.points[0].x);
            // setValleysTimes(newValleysTimes);

            // setRevision(revision + 1);

            let newValleysStartData = valleysStartData;
            newValleysStartData.push(data.points[0].y);
            setValleysStartData(newValleysStartData);

            let newValleysStartTimes = valleysStartTime;
            newValleysStartTimes.push(data.points[0].x);
            setValleysStartTime(newValleysStartTimes);

            setRevision(revision + 1);
            updateRadarTable();
        }

        else if (isAddNewPeakLowEnd) {

            let newValleysEndData = valleysEndData;
            newValleysEndData.push(data.points[0].y);
            setValleysEndData(newValleysEndData);

            let newValleysEndTimes = valleysEndTimes;
            newValleysEndTimes.push(data.points[0].x);
            setValleysEndTime(newValleysEndTimes);

            setRevision(revision + 1);
            updateRadarTable();
        }

        else if (isMarkUp) {
            if (selectedPoint.name !== null && selectedPoint.name === 'peak values') {
                if (data.points[0].x > valleysStartTime[selectedPoint.idx]
                    && data.points[0].x < valleysEndTimes[selectedPoint.idx]) {
                    let newPeaksData = peaksData;
                    newPeaksData[selectedPoint.idx] = data.points[0].y;
                    setPeaksData(newPeaksData);
                    let newPeaksTime = peaksTimes;
                    newPeaksTime[selectedPoint.idx] = data.points[0].x;
                    setPeaksTimes(newPeaksTime);
                    setSelectedPoint({});
                    resetBlurValues();
                    setIsMarkUp(false);
                    setRevision(revision + 1);
                }
                else {
                    showPopUp("The point should be selected within the range");
                }
            }

        }

        console.log("Exiting handclePlotClick with isMarkUp = " + isMarkUp);

    }

    const resetBlurValues = () => {
        setBlurEnd(startTime)
        setBlurStart(endTime);
        closePopup();
    }

    const showPopUp = (msg) => {
        setPopupMsg(msg);
        setShowPopup(true);
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    const continueAlert = () => {
        setAlertAgreed(true);
        setShowAlertPopup(false);
        // // Create a new keyboard event
        // const event = new KeyboardEvent('keydown', { key: 'r', code: 'KeyR', keyCode: 82 });

        // // Dispatch the event on the document
        // document.dispatchEvent(event);
        //setSelectedPoint({});
        resetBlurValues();
        //setIsMarkUp(false);
        setRevision(revision + 1);

    }

    const handleSelectElementfromArray = (arrayValues, arrayTimes, element, name) => {

        if (!isMarkUp) //No mark up
        {
            setIsMarkUp(true);
            console.log("did set markup as true in state " + isMarkUp)
            const idx = arrayTimes.indexOf(element)
            const peak_data = [arrayValues[idx]]
            const peak_time = [arrayTimes[idx]]

            if (name === 'peak values') {
                setBlurEnd(valleysStartTime[idx])
                setBlurStart(valleysEndTimes[idx]);
            }
            return { peak_data, peak_time, idx, name }
        }
    }

    const updateRadarTable = async () => {
        try {

            let uploadData = new FormData();

            let jsonData = {
                peaks_Data: peaksData,
                peaks_Time: peaksTimes,
                valleys_StartData: valleysStartData,
                valleys_StartTime: valleysStartTime,
                valleys_EndData: valleysEndData,
                valleys_EndTime: valleysEndTimes,
                _velocity: taskRecord.velocity
            };

            jsonData = JSON.stringify(jsonData);

            uploadData.append('json_data', jsonData);
            const response = await fetch('http://localhost:8000/api/update_plot/', {
                method: 'POST',
                body: uploadData
            });
            if (response.ok) {
                const data = await response.json();
                let newJsonData = { ...taskRecord };
                // let newRadarData = {...taskRecord.radarTable, ...data}
                newJsonData['radarTable'] = data

                if (true) {
                    handleJSONUpload(true, newJsonData);
                }

                else {
                    throw new Error("Invalid input received from server");
                }
            } else {
                throw new Error('Server responded with an error!');
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
        }
    };

    const annotations = [
        {
            x: 0.5,
            y: 1.25, // Adjust this value to position the annotations on top of the plot
            xref: 'paper',
            yref: 'paper',
            text: '<b>Select Point</b> - (click)         <b>Remove Point</b> - (R)          <b>Add Peak</b> - (Q+click)',
            showarrow: false, // Do not show arrows for the annotations
            font: {
                size: 12,
                color: 'black',
                bold: true
            },
        },
        {
            x: 0.5,
            y: 1.15, // Adjust this value to position the annotations on top of the plot
            xref: 'paper',
            yref: 'paper',
            text: '<b>Add Valley Start</b> - (W)         <b>Add Valley Start</b> - (E)',
            showarrow: false, // Do not show arrows for the annotations
            font: {
                size: 12,
                color: 'black',
                bold: true
            },
        }
        // {
        //     x: videoCurrentTime,
        //     y: 0,
        //     xref: 'x',
        //     yref: 'paper',
        //     showarrow: true,
        //     arrowhead: 2,
        //     ax: 0,
        //     ay: -30,
        //     bordercolor: '#c7c7c7',
        //     arrowcolor: '#c7c7c7'
        //   }

    ];

    const shapes = [
        // ... your other shapes if any,
        {
            type: 'line',
            x0: videoCurrentTime,
            y0: 0,
            x1: videoCurrentTime,
            y1: 1,
            xref: 'x',
            yref: 'paper',
            line: {
                color: 'grey',
                width: 1,
            },
            layer: 'below',
        },
        {
            type: 'rect',
            x0: startTime,
            y0: Math.min(...plotData),
            x1: blurEnd,
            y1: Math.max(...plotData),
            fillcolor: 'rgba(128, 128, 128, 0.4)', // Semi-transparent white
            line: {
                width: 0,
            },
            layer: 'above',
        },
        {
            type: 'rect',
            x0: blurStart,
            y0: Math.min(...plotData),
            x1: endTime,
            y1: Math.max(...plotData),
            fillcolor: 'rgba(128, 128, 128, 0.4)', // Semi-transparent white
            line: {
                width: 0,
            },
            layer: 'above',
        },

    ];


    return (
        <div className="relative">
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
                        // {
                        //     y: valleysData,
                        //     x: valleysTimes,
                        //     name: 'valley values',
                        //     type: 'scatter',
                        //     mode: 'markers',
                        //     marker: {
                        //         size: 10,
                        //         color: '#76B041'
                        //     }
                        // },
                        {
                            y: valleysStartData,
                            x: valleysStartTime,
                            name: 'valley start',
                            type: 'scatter',
                            mode: 'markers',
                            marker: {
                                size: 10,
                                color: '#76B041'
                            }
                        },
                        {
                            y: valleysEndData,
                            x: valleysEndTimes,
                            name: 'valley end',
                            type: 'scatter',
                            mode: 'markers',
                            marker: {
                                size: 10,
                                color: 'red'
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
                    modeBarButtonsToRemove: ['zoom2d', 'select2d', 'lasso2d', 'resetScale2d'],
                    responsive: true,
                    displaylogo: false
                }}
                layout={{
                    annotations: annotations,
                    shapes: shapes,
                    dragmode: 'pan',
                    //dragmode: 'lasso',
                    xaxis: { title: 'Time [s]', range: [startTime, endTime] },
                    yaxis: { title: 'Distance' },
                    responsive: true,
                    autosize: false,
                    datarevision: revision, // datarevision helps to update the plot when the data is updated 
                    uirevision: true // uirevision helps to maintain the current zoom leven when the state chages
                }}

            />
            {/* <div className="flex justify-center">
                // {revision != 0 ? <button type="submit" onClick={handleSave} className=" bg-menu px-2 w-36 h-10 text-white rounded-md mt-3 py-2 font-semibold hover:bg-sky-500">Save Points</button> : ""}
            </div> */}
            {/* <button className="bg-blue-900 text-white">Download</button> */}
            {showAlertPopup && (
                <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
                    <div className="bg-white w-1/2 rounded-lg shadow-lg p-6">
                        <span className="block mb-4">{alertPopupMsg}</span>
                        <div className="flex justify-center gap-4">
                            <button className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-sky-500" onClick={() => setShowAlertPopup(false)} >Cancel</button>
                            <button className="bg-slate-800 text-white px-4 py-2 rounded hover:bg-sky-500" onClick={continueAlert} >Continue</button>
                        </div>
                    </div>
                </div>
            )}



            {showAddButton && <button onClick={addPoint} className="relative bottom-2 bg-slate-800 px-2 w-36 h-10 text-white rounded-md mt-3 py-2 font-semibold hover:bg-sky-500">Add New Point</button>}
            {showPopup && (
                <div className="relative bottom-2 bg-gray-300 hover:bg-gray-400 left-1/2 transform -translate-x-1/2 p-8 rounded-lg shadow-lg w-2/3 h-auto">
                    <span>{popupMsg}</span>
                </div>
            )}
        </div>

    );
};

export default WavePlotEditable;