
import React, { useEffect,useState } from 'react';
import Plot from 'react-plotly.js';
import Popup from './Popup';
import './Popup.css'; 

const WaveImage = ({taskRecord}) => {
  const [plotlyData, setPlotlyData] = useState([]);
  const [plotlyLayout, setPlotlyLayout] = useState({});
  const [plotlyConfig, setPlotlyConfig] = useState({});

  const [isPopupVisible, setIsPopupVisible] = useState(false);

  useEffect(() => {

    let data = [
      {
        y: taskRecord.linePlot.lineData.data,
        x: taskRecord.linePlot.lineData.time,
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
        y: taskRecord.linePlot.Peaks.data,
        x: taskRecord.linePlot.Peaks.time,
        name: 'peak values',
        type:'scatter',
        mode:'markers',
        marker : {  size: 6,
                    color:'#41337A'}
        },
        {
          y: taskRecord.linePlot.Valleys.data,
          x: taskRecord.linePlot.Valleys.time,
          name: 'valley values',
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
      height: 100,
      width: 300,
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
      modeBarButtonsToRemove: ['pan2d','zoom2d','zoomOut2d','zoomIn2d','select2d','lasso2d','resetScale2d','toImage'],
      responsive: true,
      displaylogo: false
    }

    setPlotlyData(data);
    setPlotlyLayout(layout);
    setPlotlyConfig(config);

  }, []);

  const handlePlotClick = () => {
    setIsPopupVisible(true);
  };
  
  const closePopup = () => {
    setIsPopupVisible(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div id="graph-container" onClick={handlePlotClick}>
      <Plot
        data={plotlyData}
        layout={plotlyLayout}
        config={plotlyConfig}
        editable= {true}
      />
      </div>
      {isPopupVisible && (
          <Popup taskRecord={taskRecord} onClose={closePopup} />
        )}
    </div>

    // <div></div>

  )
}


export default WaveImage;