// VideoPlayer.jsx
import React, {useEffect, useRef, useState} from "react";
import VideoPlayerUI from "./VideoPlayerUI";

const VideoPlayer = () => {
    const [videoUrl, setVideoUrl] = useState("");
    const videoPlayerRef = useRef(null);
    const [stats, setStats] = useState([])
    const [loading, setLoading] = useState(false);

    const localURL = 'http://127.0.0.1:8000/api/video';

    useEffect(()=> {

    },[stats]);
    const handleVideoChange = (event) => {
        const file = event.target.files[0];
        const url = URL.createObjectURL(file);
        setVideoUrl(url);
        loadStats(file);
    };

    const loadStats = (file) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('video', file);

        fetch(localURL, {
            method: "POST", // or1 'PUT'
            body: formData
        }).then(result => {
            // console.log(result);
            result.json().then(data => {
                const videoStats = [];
                for (let key of Object.keys(data)) {
                    const stat = {
                        title: key,
                        value: data[key]
                    };
                    videoStats.push(stat);
                }
                setStats(videoStats);
            }).catch((exception) => console.log(exception)).finally(()=> setLoading(false));
        }).catch((exception)=> {
            setLoading(false);
            alert(exception);
        }).finally(() => setLoading(false));
    }

    return (
        <div className="flex flex-row items-center justify-center h-screen bg-gray-100">
            {!videoUrl && (
                <div>
                    <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoChange}
                        className="p-4 mb-4 rounded-lg bg-blue-500 text-white"
                    />
                    <p className="text-sm text-gray-500">Please upload a video file.</p>
                </div>
            )}

            {videoUrl && (
                <>
                    <VideoPlayerUI videoUrl={videoUrl} videoPlayerRef={videoPlayerRef}/>

                    <div className="flex flex-col p-10 h-screen w-1/2 bg-gray-200">
                        <h1 className="text-3xl font-bold mb-4">Video Stats</h1>

                        {loading && (
                            <div className={"mt-10 text-2xl"}>Loading ... </div>
                        )}

                        {!loading &&
                            (<table className="border-collapse border border-gray-600">
                            <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-600 p-2">Stat</th>
                                <th className="border border-gray-600 p-2">Value</th>
                            </tr>
                            </thead>
                            <tbody>
                            {stats.map((stat, index) => (
                                <tr key={index} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                                    <td className="border border-gray-600 p-2">{stat.title}</td>
                                    <td className="border border-gray-600 p-2">{stat.value}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>)}
                    </div>
                </>
            )}


        </div>
    );
};

export default VideoPlayer;
