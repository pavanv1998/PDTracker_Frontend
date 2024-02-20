import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import Popup from './Popup';
import ScatterPopup from './ScatterPopup';

const ScatterPlot = ({taskRecord}) => {
    const [plotlyData, setPlotlyData] = useState([]);
    const [plotlyLayout, setPlotlyLayout] = useState({});
    const [plotlyConfig, setPlotlyConfig] = useState({});

    const [isPopupVisible, setIsPopupVisible] = useState(false);

     useEffect(() => {
        console.log(taskRecord)
        let data = [
            {
              type: 'scatterpolar',
              r: taskRecord.radar.A,
              theta: taskRecord.radar.labels,
              fill: 'toself',
              name: 'Group A'
            },
            {
              type: 'scatterpolar',
              r: taskRecord.radar.B,
              theta: taskRecord.radar.labels,
              fill: 'toself',
              name: 'Group B'
            }
          ]
      
          let layout = {
            polar: {
              radialaxis: {
                visible: true,
                range: [0, 10]
              }
            },
            showlegend: false,
            autosize: false,
            height: 250,        
            width: 300,
            plot_bgcolor: '#E4E4E4', // Color of the plot area
            paper_bgcolor: '#E4E4E4', // Color of the entire plotting area
            font: {
                size:4
            },
            // yaxis: {
            //     automargin: true
            // },
            // xaxis: {
            //     automargin: true
            // }
            margin: {
                t: 25, //top margin
                l: 25, //left margin
                r: 20, //right margin
                b: 25 //bottom margin
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
              <ScatterPopup plotData={plotlyData} plotConfig={plotlyConfig} onClose={closePopup} />
            )}
        </div>
    
        // <div></div>
    
      )
}

export default ScatterPlot;