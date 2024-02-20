import React from "react";

const Resizer = ({videoWidth, setVideoWidth}) => {
   return (
       <div className="flex gap-4">
           <select value={videoWidth} onChange={event => {
               setVideoWidth(event.target.value);
           }}>
               <option value={10}>10%</option>
               <option value={20}>20%</option>
               <option value={30}>30%</option>
               <option value={40}>40%</option>
               <option value={50}>50%</option>
               <option value={60}>60%</option>
               <option value={70}>70%</option>
               <option value={80}>80%</option>
               <option value={90}>90%</option>
               <option value={100}>100%</option>
           </select>
           <span>Video Size</span>
       </div>
   );
}

export default Resizer;