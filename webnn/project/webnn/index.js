import * as Utils from "./utils.js"
import * as Model from "./model.js"
import * as SD from "./stable_diffusion.js"

const loadModelButton = document.getElementById("loadModelButton");
const releaseModelButton = document.getElementById("releaseModelButton");
const generateImageButton = document.getElementById("generateImageButton");
const info = document.getElementById("info");

let textEncoderSession;
let unetSession;
let vaeDecoderSession;

document.addEventListener("DOMContentLoaded", async () => {
    if (!navigator.ml) return

    const context = await navigator.ml.createContext();
    if (!context) return

    const builder = new MLGraphBuilder(context);
    if (!builder) return
    
    info.innerHTML = " - Supported";
    info.style.color = "green"
    
    SD.displayEmptyCanvasPlaceholder()
});

loadModelButton.onclick = async () => {
    
    Model.releaseModels(textEncoderSession, unetSession, vaeDecoderSession)

    Utils.log("Load Models started")

    textEncoderSession = await Model.loadModel("text-encoder", "models/text-encoder.onnx");
    unetSession = await Model.loadModel("unet", "models/sd-unet-v1.5-model-b2c4h64w64s77-float16-compute-and-inputs-layernorm.onnx");
    vaeDecoderSession = await Model.loadModel("vae-decoder", "models/Stable-Diffusion-v1.5-vae-decoder-float16-fp32-instancenorm.onnx");

    Utils.log("Load Models completed")
};

releaseModelButton.onclick = async () => {
    Model.releaseModels(textEncoderSession, unetSession, vaeDecoderSession)
    textEncoderSession = null
    unetSession = null
    vaeDecoderSession = null
}

generateImageButton.onclick = async () => {
    SD.displayEmptyCanvasPlaceholder();

    let rgbPlanarPixels = await SD.executeStableDiffusion(textEncoderSession, unetSession, vaeDecoderSession);
    SD.displayPlanarRGB(await rgbPlanarPixels.getData());
}

