import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {CircularProgress, Input, Typography} from "@mui/material";
import {useState} from "react";
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export default function JSONUploadDialog({dialogOpen, setDialogOpen, handleJSONUpload, videoRef}) {

    const [fileName, setFileName] = useState('');
    const [fileError, setFileError] = useState('');
    const [jsonContent, setJSONContent] = useState(null);
    const [serverProcessing, setServerProcessing] = useState(false);

    const handleClose = () => {
        setDialogOpen(false);
        setFileName("");
        setFileError("")
    };

    const handleJSONProcess = () => {
        setFileName("");
        setFileError("")
        handleJSONUpload(true, jsonContent);
        setDialogOpen(false);
    }

    const  getVideoData = async () => {
        setServerProcessing(true);
        const videoURL = videoRef.current.src;

        let blob = await fetch(videoURL).then(r => r.blob());

        fetchBoundingBoxes(blob);
    }

    const fetchBoundingBoxes = async (content) => {
        try {
            let uploadData = new FormData();
            uploadData.append('video', content);
            const response = await fetch('http://localhost:8000/api/video/', {
                method: 'POST',
                body: uploadData
            });
            if (response.ok) {
                const data = await response.json();
                if (validateJson(data)) {
                    handleJSONUpload(true, data);
                    setDialogOpen(false);
                }

                else {
                    throw new Error("Invalid input received from server");
                }
                setServerProcessing(false);
            } else {
                throw new Error('Server responded with an error!');
            }
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            setFileError(error);
        }
    };


    const handleAutoProcess = async () => {

       await getVideoData();
    }



    const validateJson = (data) => {
        try {
            // const data = JSON.parse(content);

            if (!data.hasOwnProperty('fps')) {
                throw new Error('fps field is missing.');
            } else if (typeof data.fps !== 'number') {
                throw new Error('fps should be a number.');
            }

            if (!data.hasOwnProperty('boundingBoxes')) {
                throw new Error('boundingBoxes field is missing.');
            } else if (!Array.isArray(data.boundingBoxes)) {
                throw new Error('boundingBoxes should be an array.');
            }

            data.boundingBoxes.forEach((box) => {
                if (!box.hasOwnProperty('frameNumber')) {
                    throw new Error('frameNumber field in boundingBoxes is missing.');
                } else if (typeof box.frameNumber !== 'number') {
                    throw new Error('frameNumber in boundingBoxes should be a number.');
                }

                if (!box.hasOwnProperty('data')) {
                    throw new Error('data field in boundingBoxes is missing.');
                } else if (!Array.isArray(box.data)) {
                    throw new Error('data in boundingBoxes should be an array.');
                }

                box.data.forEach((item) => {
                    if (!item.hasOwnProperty('id')) {
                        throw new Error('id field in boundingBoxes data is missing.');
                    }
                    // } else if (typeof item.id !== 'number') {
                    //     throw new Error('id in boundingBoxes data should be a number.');
                    // }

                    ['x', 'y', 'width', 'height'].forEach((prop) => {
                        if (!item.hasOwnProperty(prop)) {
                            throw new Error(`${prop} field in boundingBoxes data is missing.`);
                        } else if (typeof item[prop] !== 'number') {
                            throw new Error(`${prop} in boundingBoxes data should be a number.`);
                        }
                    });
                });
            });

            return true;
        } catch (error) {
            setFileError(error.message);
            return false;
        }
    };


    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            if (file.name.endsWith('.json')) {
                try {
                    const content = await file.text();
                    const jsonContent = JSON.parse(content);
                    if (validateJson(jsonContent)) {

                        setJSONContent(JSON.parse(content));
                        setFileName(file.name);
                        setFileError('');

                    }
                } catch (error) {
                    setFileError('Error reading the file.');
                }
            } else {
                setFileError('Please select a valid JSON file.');
            }
        }
    };

    return (
        <React.Fragment>

            <Dialog open={dialogOpen} onClose={handleClose}>
                <DialogTitle>Video parser</DialogTitle>
                <IconButton
                    aria-label="close"
                    onClick={handleClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <DialogContent>
                    <DialogContentText>
                        {
                            !serverProcessing
                            &&
                            <>
                                Upload JSON manually containing the bounding boxes for the video or click on auto-parse to let
                                the
                                serve handle it.
                            </>
                        }
                        {
                            serverProcessing
                            &&
                            <div className={"flex flex-col w-full h-full justify-center items-center gap-10"}>
                                <div>Server processing the request</div>
                                <CircularProgress size={80}/>
                            </div>
                        }
                    </DialogContentText>
                    {
                        !serverProcessing
                        &&
                        <div>
                            <Input
                                type="file"
                                accept=".json"
                                onChange={handleFileChange}
                                style={{margin: '10px 0'}}
                                label="Upload JSON file"
                            />
                            {fileError && <Typography color="error">{fileError}</Typography>}
                        </div>
                    }
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleJSONProcess} disabled={jsonContent === null || serverProcessing}>Process using JSON</Button>
                    <Button onClick={handleAutoProcess} disabled={serverProcessing}>Auto-Process</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
