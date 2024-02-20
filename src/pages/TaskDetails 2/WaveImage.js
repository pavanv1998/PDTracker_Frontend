
import React, { useEffect,useState } from 'react';
import Plot from 'react-plotly.js';
import Popup from './Popup';
import './Popup.css'; 
import WavePlotEditable from './WavePlotEditable';

const WaveImage = ({taskRecord, videoRef, startTime, endTime, handleJSONUpload}) => {
  const [plotlyData, setPlotlyData] = useState([]);
  const [plotlyLayout, setPlotlyLayout] = useState({});
  const [plotlyConfig, setPlotlyConfig] = useState({});

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {

    let data = [
      {
        y: taskRecord.linePlot.data,
        x: taskRecord.linePlot.time,
        mode: 'lines'

        // modeBarButtonsToAdd: [{
        //       name: 'custom button',
        //       icon: Icons['home'],
        //       click: function() {
        //           console.log('hello world');     
        //       }
        //   }]
      },
      {
        y: taskRecord.peaks.data,
        x: taskRecord.peaks.time,
        name: 'peak values',
        type:'scatter',
        mode:'markers',
        marker : {  size: 6,
                    color:'#41337A'}
        },
        {
          y: taskRecord.valleys_start.data,
          x: taskRecord.valleys_start.time,
          name: 'valleys start',
          type:'scatter',
          mode:'markers',
          marker : {  size: 6,
                      color:'#76B041'}
        },
        {
          y: taskRecord.valleys_end.data,
          x: taskRecord.valleys_end.time,
          name: 'valleys end',
          type:'scatter',
          mode:'markers',
          marker : {  size: 6,
                      color:'#76B041'}
        }
    ]
       

    let layout = {
      xaxis : {title: 'Time [s]'},
      yaxis : {title: 'Distance [m]'},
      showlegend: false,
      autosize: false,
      height: 200,
      width: 600,
      plot_bgcolor: '#E4E4E4', // Color of the plot area
      paper_bgcolor: '#E4E4E4', // Color of the entire plotting area
      font: {
        size: 6
      },
      // yaxis: {
      //     automargin: true
      // },
      // xaxis: {
      //     automargin: true
      // }
      margin: {
        t: 20, //top margin
        l: 25, //left margin
        r: 10, //right margin
        b: 20 //bottom margin
      }
    }

    let config = {
      modeBarButtonsToRemove: ['pan2d','zoom2d','zoomOut2d','zoomIn2d','select2d','lasso2d','resetScale2d','toImage', 'autoScale'],
      responsive: true,
      displaylogo: false
    }

    setPlotlyData(data);
    setPlotlyLayout(layout);
    setPlotlyConfig(config);
    setIsPopupVisible(isPopupVisible);

  }, [taskRecord]);

  const handlePlotClick = () => {
    setIsPopupVisible(true);
  };
  
  const closePopup = () => {
    setIsPopupVisible(false);
  };

  const handleClickonPlot = (data) => {
    console.log(data.points[0].x + " , "+ data.points[0].y +" ")
    videoRef.current.currentTime = data.points[0].x;
    videoRef.current.play();
  }

  return (
    <div style={{ position: 'relative' }}>
      <button 
      style={{
        position: 'absolute',
        top: '-20px', // Adjust as needed
        right: '0px', // Adjust as needed
        zIndex: 10 // Ensure it's above the plot
      }}
      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
      onClick={handlePlotClick}
    >
      <span>⤢</span> {/* Unicode character for maximize icon */}
    </button>
      <div id="graph-container">
      {/* <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={plotlyConfig}
        editable= {true}
        onClick={(data) => handleClickonPlot(data)}
      /> */}
      {!isPopupVisible && (
       <WavePlotEditable taskRecord={taskRecord} videoRef={videoRef} onClose={closePopup} startTime={startTime} endTime={endTime} handleJSONUpload={handleJSONUpload} />
       )}</div>
      {isPopupVisible && (
          <Popup taskRecord={taskRecord} videoRef={videoRef} onClose={closePopup} />
        )}
    </div>

    // <div></div>

  )
}


export default WaveImage;