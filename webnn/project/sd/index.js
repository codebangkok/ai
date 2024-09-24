import * as Utils from "./utils.js"
import * as Model from "./model.js"

const loadModelButton = document.getElementById("loadModelButton");
const generateImageButton = document.getElementById("generateImageButton");
const info = document.getElementById("info");

const pixelWidth = 512;
const pixelHeight = 512;
const latentWidth = pixelWidth / 8;
const latentHeight = pixelHeight / 8;
const latentChannelCount = 4;

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
    
    Model.displayEmptyCanvasPlaceholder()
});

loadModelButton.onclick = async () => {
    const options = {
        executionProviders: [
            {
                name: "webnn",
                deviceType: "gpu"
            },
        ]
    };

    Utils.log("Load Models started")

    textEncoderSession = await loadModel("sd_text-encoder", "models/text-encoder.onnx", options)
    unetSession = await loadModel("sd_unet", "models/sd-unet-v1.5-model-b2c4h64w64s77-float16-compute-and-inputs-layernorm.onnx", options)

    options.freeDimensionOverrides = {
        batch: 1,
        channels: latentChannelCount,
        height: latentHeight,
        width: latentWidth,
    }
    vaeDecoderSession = await loadModel("sd_vae-decoder", "models/Stable-Diffusion-v1.5-vae-decoder-float16-fp32-instancenorm.onnx", options)

    Utils.log("Load Models completed")
};

const loadModel = async (modelName, modelPath, options) => {       
    Utils.log(`[Loading] ${modelPath}`);
    let modelBuffer = await Utils.getModelOPFS(modelName, modelPath);    
    let modelSession = await ort.InferenceSession.create(modelBuffer, options);
    Utils.log(`[Loaded] ${modelName}, size: ${modelBuffer.byteLength.toLocaleString()}`)
    return modelSession
}

generateImageButton.onclick = async () => {
    Model.displayEmptyCanvasPlaceholder();

    let rgbPlanarPixels = await Model.executeStableDiffusion(textEncoderSession, unetSession, vaeDecoderSession);
    Model.displayPlanarRGB(await rgbPlanarPixels.getData());
}

