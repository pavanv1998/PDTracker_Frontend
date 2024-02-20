export function setupFPSCalculation(videoElement, afterCalcFunc) {
    let frameTimes = [];
    let totalFramesToMeasure = 600;
    let skippedFrames = 200;


    function onFrameDisplayed(now, metadata) {
        if (skippedFrames > 0) {
            skippedFrames--;
        } else {
            frameTimes.push(metadata.mediaTime);
            if (frameTimes.length >= totalFramesToMeasure) {
                // videoElement.removeEventListener('timeupdate', onTimeUpdate);
                calculateAverageFPS();
            }
        }

        if (frameTimes.length < totalFramesToMeasure + skippedFrames) {
            videoElement.requestVideoFrameCallback(onFrameDisplayed);
        }
    }

    function calculateAverageFPS() {
        let totalDelta = 0;
        for (let i = 1; i < frameTimes.length; i++) {
            totalDelta += frameTimes[i] - frameTimes[i - 1];
        }
        let averageDeltaTime = totalDelta / (frameTimes.length - 1);
        let averageFPS = 1 / averageDeltaTime;
        console.log("fps : " + averageFPS);
        afterCalcFunc(averageFPS);
        videoElement.pause();
        videoElement.currentTime = 0;
        videoElement.muted = false;
    }

    videoElement.muted = true;
    videoElement.requestVideoFrameCallback(onFrameDisplayed);
}
