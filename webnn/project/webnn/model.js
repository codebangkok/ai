import * as Utils from "./utils.js"

// Configuration...
const executionProvider = "webnn"
const deviceType = "gpu"

const pixelWidth = 512;
const pixelHeight = 512;
const latentWidth = pixelWidth / 8;
const latentHeight = pixelHeight / 8;
const latentChannelCount = 4;
const unetBatch = 2;
const unetChannelCount = 4;
const textEmbeddingSequenceLength = 77;

const loadModel = async (modelName, modelPath) => {    
    let freeDimensionOverrides;

    if (modelName == "text-encoder") {
        freeDimensionOverrides = {
            batch: unetBatch,
            sequence: textEmbeddingSequenceLength,
        };
    }
    else if (modelName == "unet") {
        freeDimensionOverrides = {
            batch: unetBatch,
            channels: unetChannelCount,
            height: latentHeight,
            width: latentWidth,
            sequence: textEmbeddingSequenceLength,
            unet_sample_batch: unetBatch,
            unet_sample_channels: unetChannelCount,
            unet_sample_height: latentHeight,
            unet_sample_width: latentWidth,
            unet_time_batch: unetBatch,
            unet_hidden_batch: unetBatch,
            unet_hidden_sequence: textEmbeddingSequenceLength,
        };
    } else if (modelName == "vae-decoder") {
        freeDimensionOverrides = {
            batch: 1,
            channels: latentChannelCount,
            height: latentHeight,
            width: latentWidth,
        };
    }

    const options = {
        executionProviders: [
            {
                name: executionProvider,
                deviceType: deviceType
            },
        ]
        ,freeDimensionOverrides: freeDimensionOverrides
    };

    Utils.log(`[Loading] ${modelPath}`);
    let buffer = await getModelOPFS(modelName, modelPath);    
    let session = await ort.InferenceSession.create(buffer, options);
    Utils.log(`[Loaded] ${modelName}, size: ${buffer.byteLength.toLocaleString()}`)
    return session
}

const releaseModels = async (textEncoderSession, unetSession, vaeDecoderSession) => {
    if (textEncoderSession) {
        Utils.log("Release Models started")        

        await textEncoderSession.release()
        Utils.log(`[Release Model] text-encoder`)

        await unetSession.release()
        Utils.log(`[Release Model] unet`)

        await vaeDecoderSession.release()
        Utils.log(`[Release Model] vae-decoder`)

        Utils.log("Release Models completed")
    }
}

const getModelOPFS = async (name, url) => {
    const root = await navigator.storage.getDirectory();
    let fileHandle;

    async function updateFile() {
        const response = await fetch(url);
        const buffer = await readResponse(response);
        fileHandle = await root.getFileHandle(name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(buffer);
        await writable.close();
        return buffer;
    }

    try {
        fileHandle = await root.getFileHandle(name);
        const blob = await fileHandle.getFile();
        let buffer = await blob.arrayBuffer();
        if (buffer) {
            return buffer;
        }
    } catch (e) {
        return await updateFile();
    }
}

const readResponse = async (response) => {
    const contentLength = response.headers.get("Content-Length");
    let total = parseInt(contentLength ?? "0");
    let buffer = new Uint8Array(total);
    let loaded = 0;

    const reader = response.body.getReader();
    async function read() {
        const { done, value } = await reader.read();
        if (done) return;

        let newLoaded = loaded + value.length;

        if (newLoaded > total) {
            total = newLoaded;
            let newBuffer = new Uint8Array(total);
            newBuffer.set(buffer);
            buffer = newBuffer;
        }
        buffer.set(value, loaded);
        loaded = newLoaded;
        return read();
    }

    await read();
    return buffer;
}

export { 
    loadModel, 
    releaseModels,
}