import React, {useEffect, useState} from 'react';
import {PlayCircleOutline} from "@mui/icons-material";
import Button from "@mui/material/Button";
import JSONUploadDialog from "../../VideoAnalysis/JSONUploadDialog";

const PersonRow = ({person, onPlay, onToggleSubject}) => {
    const handlePlay = () => {
        onPlay(person.timestamp);
    };

    const handleToggleSubject = () => {
        onToggleSubject(person);
    };

    return (
        <li className={`flex items-center justify-between p-2 rounded-lg transition-colors duration-150 ${person.isSubject ? 'bg-teal-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>
            <div className="flex items-center">
                <PlayCircleOutline onClick={handlePlay} className="cursor-pointer b-2"/>
                <span className="ml-2 font-medium">{person.name}</span>
                <span className="ml-4 text-sm text-gray-500">{person.timestamp}</span>
            </div>
            <button
                onClick={handleToggleSubject}
                className={`px-4 py-1 rounded text-xs font-semibold shadow-sm transition-colors duration-150 ${person.isSubject ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-teal-600 hover:bg-teal-700 text-white'} disabled:opacity-40`}
                // disabled={true}
            >
                {person.isSubject ? 'Remove Subject' : 'Mark as Subject'}
            </button>
        </li>
    );
};

const SubjectSelectionTab = ({videoRef, setFPS, fps, setBoundingBoxes, boundingBoxes, persons, setPersons, isVideoReady, setBoxesReady, boxesReady}) => {

    const [openJsonUpload, setOpenJsonUpload] = useState(false);

    useEffect(() => {

        if (persons.length !== 0)
            return;

        const firstOccurrenceMap = new Map();

        if (Array.isArray(boundingBoxes)) {
            boundingBoxes.forEach((frameData) => {
                frameData.data.forEach((person) => {
                    if (!firstOccurrenceMap.has(person.id)) {
                        firstOccurrenceMap.set(person.id, frameData.frameNumber);
                    }
                });
            });
        }

        const personArray = Array.from(firstOccurrenceMap, ([id, frameNumber]) => ({
            id: id,
            name: `Person ${id}`,
            frameNumber: frameNumber,
            timestamp: convertFrameNumberToTimestamp(frameNumber),
            isSubject: false
        }));

        setPersons(personArray);

    }, [boundingBoxes]);

    useEffect(() => {
        if (persons.length === 1) {
            let subjectMarkedPersons = persons.map(person => (
                {
                    ...person,
                    isSubject: true
                }
            ));
            setPersons(subjectMarkedPersons);
        }
    },[persons]);

    const convertFrameNumberToTimestamp = (frameNumber) => {
        return (frameNumber / fps).toFixed(2);
    };

    const handlePlay = (timestamp) => {
        if (videoRef && videoRef.current !== null && videoRef.current.readyState === 4) {
            videoRef.current.currentTime = timestamp;
        }
    };

    const handleToggleSubject = (selectedPerson) => {
        setPersons(persons.map(person => (person.id === selectedPerson.id ? {
            ...person,
            isSubject: !person.isSubject
        } : {...person})));
    };

    const jsonFileHandle = (jsonFileUploaded, jsonContent) => {
        if (jsonFileUploaded) {
            setBoundingBoxes(jsonContent["boundingBoxes"]);
            setFPS(jsonContent["fps"]);
            if (jsonContent.hasOwnProperty("persons"))
                setPersons(jsonContent["persons"]);
            console.log("JSON file details captured and added.")
            setBoxesReady(true);
        }
    }

    return (
        <div className="w-full h-[65vh] overflow-y-auto px-4 ">
            {!isVideoReady && (
                <div className="flex items-center justify-center h-full">
                    <div className="bg-gray-200 p-4 rounded-lg shadow-md">
                        <p className="text-center text-lg font-semibold">
                            Waiting for video to load...
                        </p>
                    </div>
                </div>
            )}

            {
                isVideoReady && !boxesReady
                &&
                    <div className={"flex justify-center items-center h-full flex-col gap-4"}>
                       <div>Process the video to start subject selection</div>
                        <Button variant="contained" onClick={()=> {setOpenJsonUpload(true)}}>Process video</Button>
                        <JSONUploadDialog dialogOpen={openJsonUpload} setDialogOpen={setOpenJsonUpload} handleJSONUpload={jsonFileHandle} videoRef={videoRef}/>
                    </div>
            }

            {
                isVideoReady && boxesReady
                &&
                <ul className="flex-1 space-y-2">
                    {
                        persons.map((subject, index) => (
                            <PersonRow
                                key={index}
                                person={subject}
                                onPlay={handlePlay}
                                onToggleSubject={handleToggleSubject}
                            />
                        ))
                    }
                </ul>
            }

        </div>
    );
};

export default SubjectSelectionTab;
