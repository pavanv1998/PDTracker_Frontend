import Button from "../../components/commons/Button";
import {Download, NavigateNext} from "@mui/icons-material";
import {useNavigate} from "react-router-dom";

const HeaderSection = ({title, isVideoReady, boundingBoxes, persons, fileName, fps, moveToNextScreen, taskBoxes}) => {

    const navigate = useNavigate();
    const downloadConfig = () => {
        const fileData = {
            fps: fps,
            boundingBoxes: boundingBoxes,
            tasks: taskBoxes
        }

        const json = JSON.stringify(fileData);
        const blob = new Blob([json], {type: "application/json"});
        const href = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = href;
        link.download = fileName.replace(/\.[^/.]+$/, "") + "_task_data.json";
        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        URL.revokeObjectURL(href);
    }


    return (
        <div className={`flex px-8 h-[8vh] items-center ${isVideoReady ? "justify-between" : "justify-center"} bg-gray-500`}>
            <div className="text-3xl text-white font-semibold font-mono">{title}</div>
            {
                isVideoReady
                &&
                <div className="flex gap-2">
                    {/* <Button className={"font-semibold"} onClick={downloadConfig}><Download/> Config</Button>
                    <Button className={"font-semibold"} onClick ={moveToNextScreen}>Proceed <NavigateNext/></Button> */}
                </div>
            }
        </div>
    );
}

export default HeaderSection;