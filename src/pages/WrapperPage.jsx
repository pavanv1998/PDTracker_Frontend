import {useEffect, useState} from "react";
import React from "react";

const WrapperPage = ({page}) => {
    const [componentInfo, setComponentInfo] = useState({Component: page, props: {}});
    const [videoURL, setVideoURL] = useState("");
    const [videoData, setVideoData] = useState(null);
    const [fileName, setFileName] = useState("");
    const [boundingBoxes, setBoundingBoxes] = useState([]);
    const [fps, setFPS] = useState(60);

    useEffect(() => {
        const url = videoData ? URL.createObjectURL(videoData) : '';
        setVideoURL(url);
    }, [videoData, componentInfo]);


    const updateComponent = (Component, props = {}) => {
        setComponentInfo({Component, props});
    };

    const element = componentInfo.Component
        ? React.createElement(componentInfo.Component, {
            ...componentInfo.props,
            setElement: updateComponent,
            videoURL: videoURL,
            setVideoURL: setVideoURL,
            videoData: videoData,
            setVideoData: setVideoData,
            fileName: fileName,
            setFileName: setFileName,
            boundingBoxes: boundingBoxes,
            setBoundingBoxes: setBoundingBoxes,
            fps: fps,
            setFPS: setFPS
        })
        : null;

    return (
        <>
            {element}
        </>
    );
};

export default WrapperPage;
