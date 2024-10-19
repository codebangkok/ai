import { getModelOPFS, log, config } from "./utils.js";
import { displayEmptyCanvasPlaceholder, executeStableDiffusion, displayPlanarRGB } from "./model.js";

document.addEventListener("DOMContentLoaded", async () => {
    if (!navigator.ml) return

    const context = await navigator.ml.createContext()
    if (!context) return

    const builder = new MLGraphBuilder(context)
    if (!builder) return

    const info = document.getElementById('info')
    info.innerHTML = ' - Supported'
    info.style.color = "green"

    displayEmptyCanvasPlaceholder()
})

let textEncoderSession
let unetSession
let vaeDecoderSession

const loadModelButton = document.getElementById('loadModelButton')
loadModelButton.onclick = async () => {

    const options = {
        executionProviders: [
            {
                name: 'webnn',
                deviceType: 'gpu',
                powerPreference: "default",
            },
        ],
    }

    log(`Load Models started`)
    textEncoderSession = await loadModel('sd_text-encoder', `models/text-encoder.onnx`, options)
    unetSession = await loadModel(`sd_unet`, `models/sd-unet-v1.5-model-b2c4h64w64s77-float16-compute-and-inputs-layernorm.onnx`, options)

    options.freeDimensionOverrides = {
        batch: 1,
        height: config.latentHeight,
        width: config.latentWidth,
        channels: config.latentChannelCount,
    }

    vaeDecoderSession = await loadModel(`sd_vae-decoder`, `models/Stable-Diffusion-v1.5-vae-decoder-float16-fp32-instancenorm.onnx`, options)
    log(`Load Models completed`)
}

const loadModel = async (modelName, modelPath, options) => {
    log(`[Loading] ${modelPath}`)
    const modelBuffer = await getModelOPFS(modelName, modelPath)
    const modelSession = await ort.InferenceSession.create(modelBuffer, options)
    log(`[Loaded] ${modelName}, size: ${modelBuffer.byteLength.toLocaleString()}`)
    return modelSession
}

const generateImageButton = document.getElementById(`generateImageButton`)
generateImageButton.onclick = async () => {
    displayEmptyCanvasPlaceholder()
    const rgbPlanarPixels = await executeStableDiffusion(textEncoderSession, unetSession, vaeDecoderSession)
    const data = await rgbPlanarPixels.getData()
    displayPlanarRGB(data)
}