import HeaderSection from "./HeaderSection";
import VideoPlayer from "../../components/commons/VideoPlayer/VideoPlayer";
import SubjectSelectionTab from "./SubjectSelectionTab";
import SubjectsWaveForm from "./SubjectsWaveForm";
import {useEffect, useRef, useState} from "react";
import TaskSelection from "../TaskSelection";

const SubjectResolution = ({setElement, videoURL, setVideoURL, setVideoData, fileName, setFileName, boundingBoxes, setBoundingBoxes, fps, setFPS}) => {
    const videoRef = useRef(null);
    const [persons, setPersons] = useState([]);
    const [videoReady, setVideoReady] = useState(false);
    const [boxesReady, setBoxesReady] = useState(false);

    useEffect(() => {
        if (!videoReady) {
            setPersons([]);
            setBoundingBoxes([]);
        }
    }, [videoReady]);

    const checkIfSubject = (id) => {
        let person = persons.find(person => person.id === id);
        return person && person.isSubject;
    }

    const updateFinalBoundingBoxes = () => {
        const newBoundingBoxes = boundingBoxes.map(frameBoxes => {
            const boxes = frameBoxes.data.filter(box => checkIfSubject(box.id));
            return {...frameBoxes, data: boxes};
        });
        setBoundingBoxes(newBoundingBoxes);
    }
    const moveToNextScreen = () => {
        updateFinalBoundingBoxes();
        setElement(TaskSelection);
    }
    const onFPSCalculation = (fps) => {
        setVideoReady(true);
    }


    return (
        <div className="flex flex-col min-h-screen max-h-screen overflow-hidden">
            <div className="flex flex-1 flex-row flex-wrap">
                <div className={"flex w-1/2 max-h-screen  bg-red-600"}>
                    <VideoPlayer
                        screen={"subject_resolution"}
                        taskBoxes={[]}
                        videoRef={videoRef}
                        boundingBoxes={boundingBoxes}
                        fps={fps} persons={persons}
                        fpsCallback={onFPSCalculation}
                        setVideoReady={setVideoReady}
                        videoURL={videoURL}
                        setVideoURL={setVideoURL}
                        fileName={fileName}
                        setFileName={setFileName}
                        setVideoData={setVideoData}
                    />
                </div>

                <div className={"flex flex-col gap-4 min-h-[100vh] w-1/2 "}>
                    <HeaderSection title="Subject Selection" isVideoReady={videoReady} moveToNextScreen={moveToNextScreen} boundingBoxes={boundingBoxes} persons={persons} fps={fps} videoURL={videoURL} fileName={fileName}/>
                    <SubjectSelectionTab boundingBoxes={boundingBoxes} setBoundingBoxes={setBoundingBoxes} fps={fps} setFPS={setFPS} videoRef={videoRef} persons={persons}
                                         setPersons={setPersons} isVideoReady={videoReady} boxesReady={boxesReady} setBoxesReady={setBoxesReady}/>
                    <SubjectsWaveForm videoRef={videoRef} persons={persons} isVideoReady={videoReady} boxesReady={boxesReady}/>
                </div>

            </div>

        </div>
    );
}

export default SubjectResolution;