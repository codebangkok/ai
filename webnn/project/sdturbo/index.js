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

    unetSession = await loadModel("sdturbo_unet", "models/unet/model_layernorm.onnx", options)
    textEncoderSession = await loadModel("sdturbo_text-encoder", "models/text_encoder/model_layernorm.onnx", options)

    options.freeDimensionOverrides = {
        batch: 1,
        channels: latentChannelCount,
        height: latentHeight,
        width: latentWidth,
    }
    vaeDecoderSession = await loadModel("sdturbo_vae-decoder", "models/vae_decoder/model.onnx", options)

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
    async function generate_image() {
        try {
            
            Utils.log(`[Session Run] Beginning`);

            await loading;

            const prompt = document.querySelector("#promptInput");
            const { input_ids } = await Utils.getTokenizers(prompt.value);

            // text_encoder
            const { last_hidden_state } = await textEncoderSession.run({
                input_ids: new ort.Tensor("int32", input_ids, [1, input_ids.length]),
            });
           
            Utils.log(`[Session Run] Text encode completed`);

            for (let j = 0; j < config.images; j++) {
                document
                    .getElementById(`img_div_${j}`)
                    .setAttribute("class", "frame inferncing");
                let startTotal = performance.now();
                const latent_shape = [1, 4, 64, 64];
                let latent = new ort.Tensor(
                    randn_latents(latent_shape, sigma),
                    latent_shape
                );
                const latent_model_input = scale_model_inputs(latent);

                // unet
                start = performance.now();
                let feed = {
                    sample: new ort.Tensor(
                        "float16",
                        convertToUint16Array(latent_model_input.data),
                        latent_model_input.dims
                    ),
                    timestep: new ort.Tensor("float16", new Uint16Array([toHalf(999)]), [
                        1,
                    ]),
                    encoder_hidden_states: last_hidden_state,
                };
                let { out_sample } = await models.unet.sess.run(feed);
                let unetRunTime = (performance.now() - start).toFixed(2);
                document.getElementById(`unetRun${j + 1}`).innerHTML = unetRunTime;

                if (getMode()) {
                    log(
                        `[Session Run][Image ${j + 1}] UNet execution time: ${unetRunTime}ms`
                    );
                } else {
                    log(`[Session Run][Image ${j + 1}] UNet completed`);
                }

                // scheduler
                const new_latents = step(
                    new ort.Tensor(
                        "float32",
                        convertToFloat32Array(out_sample.data),
                        out_sample.dims
                    ),
                    latent
                );

                // vae_decoder
                start = performance.now();
                const { sample } = await models.vae_decoder.sess.run({
                    latent_sample: new_latents,
                });
                let vaeRunTime = (performance.now() - start).toFixed(2);
                document.getElementById(`vaeRun${j + 1}`).innerHTML = vaeRunTime;

                if (getMode()) {
                    log(
                        `[Session Run][Image ${j + 1
                        }] VAE decode execution time: ${vaeRunTime}ms`
                    );
                } else {
                    log(`[Session Run][Image ${j + 1}] VAE decode completed`);
                }

                draw_image(sample, j);

                let totalRunTime = (
                    performance.now() +
                    Number(sessionRunTimeTextEncode) -
                    startTotal
                ).toFixed(2);
                if (getMode()) {
                    log(`[Total] Image ${j + 1} execution time: ${totalRunTime}ms`);
                }
                document.getElementById(`runTotal${j + 1}`).innerHTML = totalRunTime;
                document.querySelector(`#data${j + 1}`).setAttribute("class", "show");

                if (getMode()) {
                    document.querySelector(`#data${j + 1}`).innerHTML = totalRunTime + "ms";
                } else {
                    document.querySelector(`#data${j + 1}`).innerHTML = `${j + 1}`;
                }

                if (getSafetyChecker()) {
                    // safety_checker
                    let resized_image_data = resize_image(j, 224, 224);
                    let normalized_image_data = normalizeImageData(resized_image_data);
                    let safety_checker_feed = {
                        clip_input: get_tensor_from_image(normalized_image_data, "NCHW"),
                        images: get_tensor_from_image(resized_image_data, "NHWC"),
                    };
                    start = performance.now();
                    const { has_nsfw_concepts } = await models.safety_checker.sess.run(
                        safety_checker_feed
                    );
                    // const { out_images, has_nsfw_concepts } = await models.safety_checker.sess.run(safety_checker_feed);
                    let scRunTime = (performance.now() - start).toFixed(2);
                    document.getElementById(`scRun${j + 1}`).innerHTML = scRunTime;

                    if (getMode()) {
                        log(
                            `[Session Run][Image ${j + 1
                            }] Safety Checker execution time: ${scRunTime}ms`
                        );
                    } else {
                        log(`[Session Run][Image ${j + 1}] Safety Checker completed`);
                    }

                    document
                        .getElementById(`img_div_${j}`)
                        .setAttribute("class", "frame done");

                    let nsfw = false;
                    has_nsfw_concepts.data[0] ? (nsfw = true) : (nsfw = false);
                    log(
                        `[Session Run][Image ${j + 1
                        }] Safety Checker - not safe for work (NSFW) concepts: ${nsfw}`
                    );

                    if (has_nsfw_concepts.data[0]) {
                        document
                            .querySelector(`#img_div_${j}`)
                            .setAttribute("class", "frame done nsfw");
                        if (getMode()) {
                            document.querySelector(`#data${j + 1}`).innerHTML =
                                totalRunTime + "ms · NSFW";
                        } else {
                            document.querySelector(`#data${j + 1}`).innerHTML = `${j + 1} · NSFW`;
                        }
                        document
                            .querySelector(`#data${j + 1}`)
                            .setAttribute("class", "nsfw show");
                        document
                            .querySelector(`#data${j + 1}`)
                            .setAttribute("title", "Not safe for work (NSFW) content");
                    } else {
                        document
                            .querySelector(`#img_div_${j}`)
                            .setAttribute("class", "frame done");
                    }
                } else {
                    document
                        .getElementById(`img_div_${j}`)
                        .setAttribute("class", "frame done");
                }

                // let out_image = new ort.Tensor("float32", convertToFloat32Array(out_images.data), out_images.dims);
                // draw_out_image(out_image);
            }
            // this is a gpu-buffer we own, so we need to dispose it
            last_hidden_state.dispose();
            log("[Info] Images generation completed");
        } catch (e) {
            log("[Error] " + e);
        }
    }
}

