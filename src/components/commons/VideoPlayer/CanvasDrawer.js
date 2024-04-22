import {rgb} from "plotly.js/src/components/color";

export class CanvasDrawer {
    constructor(videoElement, canvasElement, boundingBoxes, fps, persons, zoomLevel, screen, taskBoxes, setTaskBoxes, selectedTask, landMarks, setLandMarks, frameOffset) {
        this.videoElement = videoElement;
        this.canvasElement = canvasElement;
        this.canvasContext = canvasElement.getContext('2d');
        this.boundingBoxes = boundingBoxes;
        this.fps = fps;
        this.persons = persons;
        this.zoomLevel = zoomLevel;
        this.currentFrame = -1;
        this.screen = screen;
        this.taskBoxes = taskBoxes;
        this.isResizing = false;
        this.hoverSide = null;
        this.setTaskBoxes = setTaskBoxes;
        this.landMarks = landMarks;
        this.setLandMarks = setLandMarks;
        this.selectedTask = selectedTask;
        this.frameOffset = frameOffset;
    }

    getBoundingBoxForCurrentFrame() {
        const boxData = this.boundingBoxes?.find(box => box.frameNumber === this.currentFrame);
        return boxData ? boxData.data : null;
    }

    getCurrentTaskBox(seconds) {

        const region = this.taskBoxes.filter((reg) => {
            return (seconds >= reg.start && seconds <= reg.end)
        });
        if (region[0] != null) {
            return region[0];
        } else
            return null;
    }

    getCurrentLandMark() {

        let currentTask = this.taskBoxes[this.selectedTask];
        if (currentTask) {
            let offSet = Math.round(currentTask.start*this.fps);
            if (this.landMarks)
                return this.landMarks[ this.currentFrame - offSet];
        } else
            return null;

    }

    drawTaskBoxes(seconds) {
        const box = this.getCurrentTaskBox(seconds);
        if (box !== null) {
            this.canvasContext.beginPath();
            this.canvasContext.strokeStyle = 'green';
            this.canvasContext.lineWidth = 8;
            this.canvasContext.rect(box.x, box.y, box.width, box.height);
            this.canvasContext.stroke();
        }
    }


    drawLandMarks(seconds) {
        if (this.taskBoxes && !isNaN(this.selectedTask)) {
            this.currentFrame = this.getFrameNumber(seconds);
            let boundingBox = this.taskBoxes[this.selectedTask];

            const landMark = this.getCurrentLandMark();
            if (landMark !== null && Array.isArray(landMark) && landMark.length >= 2) {
                if (Array.isArray(landMark[0])) {
                    for (let mark of landMark) {

                        this.canvasContext.fillStyle = "rgba(255, 0, 0, 1)";
                        this.canvasContext.beginPath();

                        // this.canvasContext.lineWidth = 8;
                        // this.canvasContext.fillRect(mark[0] + boundingBox.x - 15, mark[1] + boundingBox.y - 15, 30, 30);
                        this.canvasContext.arc(mark[0] + boundingBox.x , mark[1] + boundingBox.y, 12, 0, Math.PI*2);
                        this.canvasContext.fill();
                        //
                        // this.canvasContext.fillStyle = "rgba(57,255,20, 1)";
                        //
                        // this.canvasContext.arc(mark[0] + boundingBox.x, mark[1] + boundingBox.y, 10, 0, Math.PI * 2);
                        // this.canvasContext.fill();
                    }
                } else {
                    this.canvasContext.beginPath();
                    this.canvasContext.fillStyle = 'red';
                    this.canvasContext.lineWidth = 8;
                    this.canvasContext.fillRect(landMark[0] + boundingBox.x - 25, landMark[1] + boundingBox.y - 25, 50, 50);
                    this.canvasContext.stroke();
                }
            }
        }
    }

    drawFrame(seconds) {
        this.currentFrame = this.getFrameNumber(seconds);

        this.clearCanvas();

        // Draw the video frame on the canvas

        this.canvasContext.drawImage(this.videoElement, 0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight);

        if (this.screen === 'tasks') {
            this.drawTaskBoxes(seconds);
        } else if (this.screen === 'taskDetails') {
            // this.drawTaskBoxes(seconds);

            this.drawLandMarks(seconds);
        }
        else {
            const boundingBoxData = this.getBoundingBoxForCurrentFrame();

            // Draw the bounding boxes and ids
            if (boundingBoxData) {
                boundingBoxData.forEach(box => {
                    // Draw the bounding box
                    this.canvasContext.beginPath();
                    this.canvasContext.strokeStyle = this.checkIfSubject(box.id) ? 'green' : 'red';
                    this.canvasContext.lineWidth = 8;
                    this.canvasContext.rect(box.x, box.y, box.width, box.height);
                    this.canvasContext.stroke();

                    // Determine the position for the id text
                    const textPadding = 20;
                    const idTextSize = 50; // size of the text
                    this.canvasContext.font = `${idTextSize}px Arial`;
                    this.canvasContext.fillStyle = 'yellow'; // text color

                    // Measure text width to position it properly
                    const textWidth = this.canvasContext.measureText(box.id).width + 10;
                    let textX = box.x + textPadding;
                    let textY = box.y - textPadding;

                    if (textY < idTextSize) {
                        textY = box.y + idTextSize + textPadding;
                    }

                    if (textX + textWidth > box.x + box.width) {
                        textX = box.x + box.width - textWidth - textPadding;
                    }

                    this.canvasContext.fillText(box.id, textX, textY);
                });
            }
        }

    }

    getFrameNumber(timestamp) {
        return Math.floor(timestamp * this.fps)  + (this.frameOffset ? this.frameOffset : 0);
    }

    checkIfSubject(id) {
        let person = this.persons.find(person => person.id === id);
        return person && person.isSubject;
    }

    clearCanvas() {
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }

    updatePersons(newPersons) {
        this.persons = newPersons;
    }

    updateSelectedTask(selectedTask) {
        this.selectedTask = selectedTask;
    }

    updateTaskBoxes(newTaskBoxes) {
        this.taskBoxes = newTaskBoxes;

        let currentTime = this.videoElement?.currentTime;
        if (currentTime) {
            this.clearCanvas();

            // Draw the video frame on the canvas
            this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

            this.drawTaskBoxes(currentTime);
        }
    }

    updateLandMarks(landMarks) {
        this.landMarks = landMarks;

        let currentTime = this.videoElement?.currentTime;
        if (currentTime) {
            this.clearCanvas();

            // Draw the video frame on the canvas
            this.canvasContext.drawImage(this.videoElement, 0, 0, this.canvasElement.width, this.canvasElement.height);

            this.drawLandMarks(currentTime);
        }
    }

    updateSetLandMarks(setLandMarks) {
        this.setLandMarks = setLandMarks;
    }

    updateBoundingBoxes(newBoundingBoxes) {
        this.boundingBoxes = newBoundingBoxes;
    }

    updateZoomLevel(newZoomLevel) {
        this.zoomLevel = newZoomLevel;
    }

    handleZoom(zoomLevel) {
        this.updateZoomLevel(zoomLevel);

        this.canvasElement.style.transform = 'scale(' + zoomLevel + ')';
        this.canvasElement.style.cursor = this.getDefaultCursor(zoomLevel);
    }

    updateFPS(newFPS) {
        this.fps = newFPS;
    }

    updateFrameOffset(newOffset) {
        this.frameOffset = newOffset;
        this.drawFrame(this.videoElement.currentTime);
    }

    handleDragStart(e) {
        e.preventDefault();
        const canvasElement = this.canvasElement;

        let startX = e.clientX - canvasElement.offsetLeft;
        let startY = e.clientY - canvasElement.offsetTop;

        const handleDrag = (event) => {
            let left = event.clientX - startX;
            let top = event.clientY - startY;

            const containerWidth = canvasElement.parentElement.offsetWidth;
            const containerHeight = canvasElement.parentElement.offsetHeight;

            const maxLeft = Math.max((canvasElement.offsetWidth * this.zoomLevel - containerWidth) / 2, 0);
            const minLeft = Math.min(0, (containerWidth - canvasElement.offsetWidth * this.zoomLevel) / 2);
            const maxTop = Math.max((canvasElement.offsetHeight * this.zoomLevel - containerHeight) / 2, 0);
            const minTop = Math.min(0, (containerHeight - canvasElement.offsetHeight * this.zoomLevel) / 2);

            left = Math.max(Math.min(left, maxLeft), minLeft);
            top = Math.max(Math.min(top, maxTop), minTop);

            canvasElement.style.left = `${left}px`;
            canvasElement.style.top = `${top}px`;
        };

        const stopDrag = () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', stopDrag);
        };

        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', stopDrag);
    }

    resizeTaskBox(resizedTaskBox) {
        const updatedTaskBoxes = this.taskBoxes.map(taskBox => {
            if (taskBox.id === resizedTaskBox.id)
                return resizedTaskBox;
            else
                return taskBox;
        });
        this.setTaskBoxes(updatedTaskBoxes);
    }

    getXY(e) {

        const boundingBox = this.canvasElement.getBoundingClientRect();
        let widthRatio = (this.canvasElement.width / boundingBox.width);
        let heightRatio = (this.canvasElement.height / boundingBox.height);

        let offsetX = boundingBox.left;
        let offsetY = boundingBox.top;

        const ratio = (this.canvasElement.width/this.canvasElement.height);
        const actualWidth = ratio * boundingBox.height;

        const currentWidth = boundingBox.width;

        if (currentWidth > actualWidth) {
            offsetX = boundingBox.left + (currentWidth - actualWidth)/2;
            widthRatio = this.canvasElement.width / actualWidth;
        } else if (currentWidth < actualWidth) {
            const actualHeight = currentWidth / ratio;
            offsetY = boundingBox.top + (boundingBox.height - actualHeight)/2;
            heightRatio = this.canvasElement.height / actualHeight;
        }

        return [(e.clientX - offsetX) * widthRatio, (e.clientY - offsetY) * heightRatio];
    }


    getDefaultCursor(zoomLevel) {
        if (zoomLevel === 1) {
            return 'auto';
        } else
            return 'grab';
    }

    moveLandMark(x,y) {

        let currentTask = this.taskBoxes[this.selectedTask];
        if (currentTask) {
            let frameOffset = Math.round(currentTask.start*this.fps);

            let updatedLandMarks = [...this.landMarks];

            let landMark = updatedLandMarks[this.currentFrame - frameOffset]

            if (landMark !== null && Array.isArray(landMark) && landMark.length >= 2) {

                if(Array.isArray(landMark[0])){
                    let x1 = landMark[0][0];
                    let y1 = landMark[0][1];

                    let index = 0;

                    let minDist = Math.sqrt( Math.pow((x1-x), 2) + Math.pow((y1-y), 2) );

                    for(let i = 1; i<landMark.length; i++){
                        x1 = landMark[i][0];
                        y1 = landMark[i][1];

                        let dist = Math.sqrt( Math.pow((x1-x), 2) + Math.pow((y1-y), 2) );

                        if(dist < minDist){
                            minDist = dist;
                            index = i;
                        }
                    }
                    landMark[index] = [x,y];
                    updatedLandMarks[this.currentFrame - frameOffset] = landMark;
                }
                else{
                    updatedLandMarks[this.currentFrame - frameOffset] = [x,y];
                }
            }

            this.setLandMarks(updatedLandMarks);
        } else
            return null;

    }

    handleMouseMove(e) {
        let [x,y] = this.getXY(e);

        let rect = this.getCurrentTaskBox(this.videoElement?.currentTime);
        let hoverSide = this.getBoxHoverSide(x, y);

        if (this.isResizing) {

            if (this.screen === 'tasks') {
                if (hoverSide === 'left') {
                    rect.width += rect.x - x;
                    rect.x = x;
                } else if (hoverSide === 'right') {
                    rect.width = x - rect.x;
                } else if (hoverSide === 'top') {
                    rect.height += rect.y - y;
                    rect.y = y;
                } else if (hoverSide === 'bottom') {
                    rect.height = y - rect.y;
                }
                if (hoverSide) {
                    if (rect.width >= 50 && rect.height >= 50) {
                        this.resizeTaskBox(rect);
                    }
                }
            } else if (this.screen === 'taskDetails') {
                let boundingBox = this.taskBoxes[this.selectedTask];
                this.moveLandMark(x - boundingBox.x, y - boundingBox.y);
            }
        } else {
            if (hoverSide !== null) {
                this.hoverSide = hoverSide;
                if (hoverSide === 'left' || hoverSide === 'right') {
                    this.canvasElement.style.cursor = 'ew-resize';
                } else if (hoverSide === 'top' || hoverSide === 'bottom'){
                    this.canvasElement.style.cursor = 'ns-resize';
                } else if (hoverSide === 'move') {
                    this.canvasElement.style.cursor = 'move';
                }
            } else {
                this.hoverSide = null;
                this.canvasElement.style.cursor = this.getDefaultCursor(this.zoomLevel);
            }
        }
    }

    handleMouseDown(e) {
        if (this.hoverSide !== null) {
            this.isResizing = true;
        } else {
            this.handleDragStart(e);
        }
        // this.isResizing = this.hoverSide !== null;
    }

    handleMouseUp(e) {
        this.isResizing = false;
    }

    getBoxHoverSide(x, y) {

        if (this.screen === 'tasks') {
            let rect = this.getCurrentTaskBox(this.videoElement?.currentTime);

            if (rect === null)
                return null;

            let edgeSize = 10;
            let edge = null;
            if (x > rect.x - edgeSize && x < rect.x + edgeSize) {
                if (y > rect.y && y < rect.y + rect.height) {
                    edge = 'left';
                }
            } else if (x > rect.x + rect.width - edgeSize && x < rect.x + rect.width + edgeSize) {
                if (y > rect.y && y < rect.y + rect.height) {
                    edge = 'right';
                }
            } else if (y > rect.y - edgeSize && y < rect.y + edgeSize) {
                if (x > rect.x && x < rect.x + rect.width) {
                    edge = 'top';
                }
            } else if (y > rect.y + rect.height - edgeSize && y < rect.y + rect.height + edgeSize) {
                if (x > rect.x && x < rect.x + rect.width) {
                    edge = 'bottom';
                }
            }

            return edge;
        } else if (this.screen === 'taskDetails') {
            this.currentFrame = this.getFrameNumber(this.videoElement.currentTime);
            let boundingBox = this.taskBoxes[this.selectedTask];
            const landMark = this.getCurrentLandMark();
            if (landMark !== null && Array.isArray(landMark) && landMark.length >= 2) {

                if(Array.isArray(landMark[0])){
                    for(let i = 0; i<landMark.length; i++){
                        let landMarkLeft = landMark[i][0] + boundingBox.x;
                        let landMarkTop = landMark[i][1] + boundingBox.y;

                        if ((x >= landMarkLeft - 25 && x <= landMarkLeft + 25) && (y >= landMarkTop - 25 && y <= landMarkTop + 25 ))
                            return 'move';
                        }
                }
                else{
                    let landMarkLeft = landMark[0] + boundingBox.x;
                    let landMarkTop = landMark[1] + boundingBox.y;

                    if ((x >= landMarkLeft - 25 && x <= landMarkLeft + 25) && (y >= landMarkTop - 25 && y <= landMarkTop + 25 ))
                        return 'move';
                }
                
            }
        }

        return null;

    }
}
