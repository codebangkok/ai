import * as Utils from "./utils.js"

const promptInput = document.getElementById("promptInput");
const canvas = document.getElementById("canvas");

// Configuration...
const pixelWidth = 512;
const pixelHeight = 512;
const latentWidth = pixelWidth / 8;
const latentHeight = pixelHeight / 8;
const unetBatch = 2;
const unetChannelCount = 4;
const textEmbeddingSequenceLength = 77;
const textEmbeddingSequenceWidth = 768;
const unetIterationCount = 25; // Hard-coded number of samples, since the denoising weight ramp is constant.
let seed = BigInt(123465);

// Hard-coded values for 25 iterations (the standard).
const defaultSigmas /*[25 + 1]*/ = [
    14.614647, 11.435942, 9.076809, 7.3019943, 5.9489183, 4.903778, 4.0860896,
    3.4381795, 2.9183085, 2.495972, 2.1485956, 1.8593576, 1.6155834, 1.407623,
    1.2280698, 1.0711612, 0.9323583, 0.80802417, 0.695151, 0.5911423, 0.49355352,
    0.3997028, 0.30577788, 0.20348993, 0.02916753, 0.0,
];

const defaultTimeSteps /*[25]*/ = [
    999.0, 957.375, 915.75, 874.125, 832.5, 790.875, 749.25, 707.625, 666.0,
    624.375, 582.75, 541.125, 499.5, 457.875, 416.25, 374.625, 333.0, 291.375,
    249.75, 208.125, 166.5, 124.875, 83.25, 41.625, 0.0,
];

const displayEmptyCanvasPlaceholder = () => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "rgba(255, 255, 255, 0.5)";
    context.strokeStyle = "rgba(255, 255, 255, 0.0)";
    context.lineWidth = 0;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "300px sans-serif";
    context.fillText("🖼️", canvas.width / 2, canvas.height / 2);
    context.strokeRect(0, 0, pixelWidth, pixelHeight);
}

const displayPlanarRGB = (planarPixelData) => {
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);

    // TODO: See if ORT's toImageData() is flexible enough to handle this instead.
    // It doesn't appear work correctly, just returning all white (shrug, maybe I'm passing the wrong values).
    // https://onnxruntime.ai/docs/api/js/interfaces/Tensor-1.html#toImageData
    // https://github.com/microsoft/onnxruntime/blob/5228332/js/common/lib/tensor-conversion.ts#L33
    // https://github.com/microsoft/onnxruntime/blob/main/js/common/lib/tensor-factory.ts#L147
    //
    // let imageData = planarPixelTensor.toImageData({format: 'RGB', tensorLayout: 'NCHW', norm:{bias: 1, mean: 128}});

    let conversionFunction =
        planarPixelData instanceof Float32Array
            ? convertPlanarFloat32RgbToUint8Rgba
            : planarPixelData instanceof Uint16Array
                ? convertPlanarFloat16RgbToUint8Rgba
                : convertPlanarUint8RgbToUint8Rgba;

    let rgbaPixels = conversionFunction(planarPixelData, pixelWidth, pixelHeight);

    let imageData = new ImageData(rgbaPixels, pixelWidth, pixelHeight);
    context.putImageData(imageData, 0, 0);
}

const executeStableDiffusion = async (textEncoderSession, unetSession, vaeDecoderSession) => {
    //======== Text Encode ========
    Utils.log("[Session Run] Beginning text encode");
    let token_ids = await getTextTokens();

    const textEncoderInputs = {
        input_ids: Utils.generateTensorFromValues("int32", [unetBatch, textEmbeddingSequenceLength], token_ids),
    };
    const textEncoderOutputs = await textEncoderSession.run(textEncoderInputs);
    Utils.log(`[Session Run] Text encode completed`);

    //======== UNet ========
    Utils.log("[Session Run] Beginning UNet loop execution for 25 iterations");
    let latentSpace = new Uint16Array(latentWidth * latentHeight * unetChannelCount);
    generateNoise(/*inout*/ latentSpace, seed);
    latentSpace = new Uint16Array([...latentSpace, ...latentSpace]);
    const latentsTensor = Utils.generateTensorFromBytes("float16", [unetBatch, unetChannelCount, latentHeight, latentWidth], latentSpace);
    const halfLatentElementCount = latentsTensor.size / 2; // Given [2, 4, 64, 64], we want only the first batch.
    let latents = await latentsTensor.getData();
    let halfLatents = latents.subarray(0, halfLatentElementCount); // First batch only.
    prescaleLatentSpace(/*inout*/ halfLatents, defaultSigmas[0]);

    const unetInputs = {
        encoder_hidden_states: Utils.generateTensorFromBytes("float16", [unetBatch, textEmbeddingSequenceLength, textEmbeddingSequenceWidth], textEncoderOutputs["last_hidden_state"].data),
    };

    // Repeat unet detection and denosing until convergence (typically 25 iterations).
    for (var i = 0; i < unetIterationCount; ++i) {
        const timeStepValue = BigInt(Math.round(defaultTimeSteps[i])); // Round, because this ridiculous language throws an exception otherwise.
        unetInputs["timestep"] = Utils.generateTensorFillValue("int64", [unetBatch], timeStepValue);

        // Prescale the latent values.
        // Copy first batch to second batch, duplicating latents for positive and negative prompts.
        let nextLatents = latents.slice(0);
        let halfNextLatents = nextLatents.subarray(0, halfLatentElementCount);
        scaleLatentSpaceForPrediction(/*inout*/ halfNextLatents, i);
        nextLatents.copyWithin(halfLatentElementCount, 0, halfLatentElementCount); // Copy lower half to upper half.

        unetInputs["sample"] = Utils.generateTensorFromBytes("float16", [unetBatch, unetChannelCount, latentHeight, latentWidth], nextLatents);
        const unetOutputs = await unetSession.run(unetInputs);

        let predictedNoise = new Uint16Array(unetOutputs["out_sample"].cpuData.buffer);
        denoiseLatentSpace(/*inout*/ latents, i, predictedNoise);
    }
    Utils.log(`[Session Run] UNet loop completed`);

    //======== VAE Decode ========
    Utils.log("[Session Run] Beginning VAE decode");
    // Decode from latent space.
    applyVaeScalingFactor(/*inout*/ halfLatents);
    let dimensions = latentsTensor.dims.slice(0);
    dimensions[0] = 1; // Set batch size to 1, ignore the 2nd batch for the negative prediction.

    const vaeDecoderInputs = {
        latent_sample: Utils.generateTensorFromBytes("float16", dimensions, halfLatents.slice(0)),
    };
    const decodedOutputs = await vaeDecoderSession.run(vaeDecoderInputs);
    Utils.log(`[Session Run] VAE decode completed`);

    return decodedOutputs["sample"];
}

const getTextTokens = async () => {
    // A string like 'a cute magical flying ghost dog, fantasy art, golden color, high quality, highly detailed, elegant, sharp focus, concept art, character concepts, digital painting, mystery, adventure'
    // becomes a 1D tensor of {49406, 320, 2242, 7823, 4610, 7108, 1929, 267, 5267, 794, 267, 3878, 3140, 267, 1400, 3027, ...}
    // padded with blanks (id 49407) up to the maximum sequence length of the text encoder (typically 77).
    // So the text encoder can't really handle more than 75 words (+1 start, +1 stop token),
    // not without some extra tricks anyway like calling it multiple times and combining the embeddings.
    let prompt_token_ids = [49406]; // Inits with start token
    const prompt_text_ids = await Utils.getTokenizers(promptInput.value);
    prompt_token_ids = prompt_token_ids.concat(prompt_text_ids);
    if (prompt_text_ids.length > textEmbeddingSequenceLength - 2) {
        // Max inputs ids should be 75
        prompt_token_ids = prompt_token_ids.slice(0, textEmbeddingSequenceLength * 2 - 1);
        prompt_token_ids.push(49407);
    } else {
        const fillerArray = new Array(textEmbeddingSequenceLength * 2 - prompt_token_ids.length).fill(49407);
        prompt_token_ids = prompt_token_ids.concat(fillerArray);
    }

    return prompt_token_ids;
}

const generateNoise = (
    /*out*/ latentSpace /*: Uint16Array*/,
    seed /*: BigInt*/
) => {
    let randomGenerator = practRandSimpleFastCounter32(
        Number(seed >> 0n) & 0xffffffff,
        Number(seed >> 32n) & 0xffffffff,
        Number(seed >> 64n) & 0xffffffff,
        Number(seed >> 96n) & 0xffffffff
    );

    const elementCount = latentSpace.length;
    for (let i = 0; i < elementCount; ++i) {
        const u1 = randomGenerator();
        const u2 = randomGenerator();
        const radius = Math.sqrt(-2.0 * Math.log(u1));
        const theta = 2.0 * Math.PI * u2;
        const standardNormalRand = radius * Math.cos(theta);
        const newValue = standardNormalRand;
        latentSpace[i] = Utils.encodeFloat16(newValue);
    }
}

const practRandSimpleFastCounter32 = (a, b, c, d) => {
    // https://pracrand.sourceforge.net/
    // Using this as a substitute for std::minstd_rand instead.
    // (std::linear_congruential_engine<std::uint_fast32_t, 48271, 0, 2147483647>).
    return function () {
        a >>>= 0;
        b >>>= 0;
        c >>>= 0;
        d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ (b >>> 9);
        b = (c + (c << 3)) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    };
}

const prescaleLatentSpace = (
    /*inout*/ latentSpace /*: Uint16Array*/,
    initialSigma /*: float*/
) => {
    const elementCount = latentSpace.length;
    for (let i = 0; i < elementCount; ++i) {
        latentSpace[i] = Utils.encodeFloat16(
            Utils.decodeFloat16(latentSpace[i]) * initialSigma
        );
    }
}

const scaleLatentSpaceForPrediction = (
    /*inout*/ latentSpace /*: Uint16Array*/,
    iterationIndex /*: int*/
) => {
    console.assert(iterationIndex < defaultSigmas.length);

    // sample = sample / ((sigma**2 + 1) ** 0.5)
    let sigma = defaultSigmas[iterationIndex];
    let inverseScale = 1 / Math.sqrt(sigma * sigma + 1);

    const elementCount = latentSpace.length;
    for (let i = 0; i < elementCount; ++i) {
        latentSpace[i] = Utils.encodeFloat16(
            Utils.decodeFloat16(latentSpace[i]) * inverseScale
        );
    }
}

const denoiseLatentSpace = (
    /*inout*/ latentSpace /*: Uint16Array*/,
    iterationIndex /*: Number*/,
    predictedNoise /*: Uint16Array*/
) => {
    console.assert(latentSpace.length === predictedNoise.length);

    const elementCount = latentSpace.length; // Given [2, 4, 64, 64], count of all elements.
    const singleBatchElementCount = elementCount / 2; // Given [2, 4, 64, 64], we want only the first batch.

    // Prompt strength scale.
    const defaultPromptStrengthScale = 7.5;
    const positiveWeight = defaultPromptStrengthScale;
    const negativeWeight = 1 - positiveWeight;

    // Add predicted noise (scaled by current iteration weight) to latents.
    const sigma = defaultSigmas[iterationIndex];
    const sigmaNext = defaultSigmas[iterationIndex + 1];
    const dt = sigmaNext - sigma;

    for (let i = 0; i < singleBatchElementCount; ++i) {
        // Fold 2 batches into one, weighted by positive and negative weights.
        const weightedPredictedNoise =
            Utils.decodeFloat16(predictedNoise[i]) * positiveWeight +
            Utils.decodeFloat16(predictedNoise[i + singleBatchElementCount]) *
            negativeWeight;

        // The full formula:
        //
        //  // 1. Compute predicted original sample from sigma-scaled predicted noise.
        //  float sample = latentSpace[i];
        //  float predictedOriginalSample = sample - sigma * predictedNoiseData[i];
        //
        //  // 2. Convert to an ODE derivative
        //  float derivative = (sample - predictedOriginalSample) / sigma;
        //  float previousSample = sample + derivative * dt;
        //  latentSpace[i] = previousSample;
        //
        // Simplifies to:
        //
        //  updatedSample = sample + ((sample - (sample - sigma * predictedNoiseData[i])) / sigma  * dt);
        //  updatedSample = sample + ((sample - sample + sigma * predictedNoiseData[i]) / sigma  * dt);
        //  updatedSample = sample + ((sigma * predictedNoiseData[i]) / sigma  * dt);
        //  updatedSample = sample + (predictedNoiseData[i] * dt);

        latentSpace[i] = Utils.encodeFloat16(
            Utils.decodeFloat16(latentSpace[i]) + weightedPredictedNoise * dt
        );
    }
}

const applyVaeScalingFactor = (
    latentSpace /*: Uint16Array as float16*/
) => {
    const /*float*/ defaultVaeScalingFactor = 0.18215; // Magic constants for default VAE :D (used in Huggingface pipeline).
    const /*float*/ inverseScalingFactor = 1.0 / defaultVaeScalingFactor;
    latentSpace.forEach(
        (e, i, a) =>
        (a[i] = Utils.encodeFloat16(
            Utils.decodeFloat16(e) * inverseScalingFactor
        ))
    );
}

const convertPlanarFloat16RgbToUint8Rgba = (
    input /*Uint16Array*/,
    width,
    height
) => {
    let totalPixelCount = width * height;
    let totalOutputBytes = totalPixelCount * 4;

    let redInputOffset = 0;
    let greenInputOffset = redInputOffset + totalPixelCount;
    let blueInputOffset = greenInputOffset + totalPixelCount;

    const rgba = new Uint8ClampedArray(totalOutputBytes);
    for (let i = 0, j = 0; i < totalPixelCount; i++, j += 4) {
        rgba[j + 0] =
            (Utils.decodeFloat16(input[redInputOffset + i]) + 1.0) * (255.0 / 2.0);
        rgba[j + 1] =
            (Utils.decodeFloat16(input[greenInputOffset + i]) + 1.0) * (255.0 / 2.0);
        rgba[j + 2] =
            (Utils.decodeFloat16(input[blueInputOffset + i]) + 1.0) * (255.0 / 2.0);
        rgba[j + 3] = 255;
    }
    return rgba;
}

const convertPlanarUint8RgbToUint8Rgba = (
    input /*Uint16Array*/,
    width,
    height
) => {
    let totalPixelCount = width * height;
    let totalOutputBytes = totalPixelCount * 4;

    let redInputOffset = 0;
    let greenInputOffset = redInputOffset + totalPixelCount;
    let blueInputOffset = greenInputOffset + totalPixelCount;

    const rgba = new Uint8ClampedArray(totalOutputBytes);
    for (let i = 0, j = 0; i < totalPixelCount; i++, j += 4) {
        let inputValue = input[redInputOffset + i];
        rgba[j + 0] = inputValue;
        rgba[j + 1] = inputValue;
        rgba[j + 2] = inputValue;
        rgba[j + 3] = 255;
    }
    return rgba;
}

const convertPlanarFloat32RgbToUint8Rgba = (
    input /*Uint16Array*/,
    width,
    height
) => {
    let totalPixelCount = width * height;
    let totalOutputBytes = totalPixelCount * 4;

    let redInputOffset = 0;
    let greenInputOffset = redInputOffset + totalPixelCount;
    let blueInputOffset = greenInputOffset + totalPixelCount;

    const rgba = new Uint8ClampedArray(totalOutputBytes);
    for (let i = 0, j = 0; i < totalPixelCount; i++, j += 4) {
        rgba[j + 0] = (input[redInputOffset + i] + 1.0) * (255.0 / 2.0);
        rgba[j + 1] = (input[greenInputOffset + i] + 1.0) * (255.0 / 2.0);
        rgba[j + 2] = (input[blueInputOffset + i] + 1.0) * (255.0 / 2.0);
        rgba[j + 3] = 255;
    }
    return rgba;
}

export {
    displayEmptyCanvasPlaceholder,
    displayPlanarRGB,
    executeStableDiffusion,
}