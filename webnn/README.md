# WebNN Developer Preview

Run ONNX models in the browser with WebNN. The developer preview unlocks interactive ML on the web that benefits from reduced latency, enhanced privacy and security, and GPU acceleration from DirectML.

[WebNN Developer Preview website](https://microsoft.github.io/webnn-developer-preview/).

## Use Cases

The website provides four scenarios based on different ONNX pre-trained deep learning models.

### 1. Stable Diffusion 1.5

[Stable Diffusion](https://huggingface.co/microsoft/stable-diffusion-v1.5-webnn/tree/main) is a latent text-to-image diffusion model capable of generating photo-realistic images given any text input.

This Stable Diffusion 1.5 model has been optimized to work with WebNN. This model is licensed under the [CreativeML Open RAIL-M license](https://github.com/CompVis/stable-diffusion/blob/main/LICENSE). For terms of use, please visit [here](https://huggingface.co/runwayml/stable-diffusion-v1-5#uses). If you comply with the license and terms of use, you have the rights described therin. By using this Model, you accept the terms.

This model is meant to be used with the corresponding sample on this repo for educational or testing purposes only.


### 2. SD-Turbo

[SD-Turbo](https://huggingface.co/microsoft/sd-turbo-webnn/tree/main) is a fast generative text-to-image model that can synthesize photorealistic images from a text prompt in a single network evaluation. In the demo, you can generate an image in 2s on AI PC devices by leveraging WebNN API, a dedicated low-level API for neural network inference hardware acceleration.

This Stable Diffusion Turbo model has been optimized to work with WebNN. This model is licensed under the [STABILITY AI NON-COMMERCIAL RESEARCH COMMUNITY LICENSE AGREEMENT](https://huggingface.co/stabilityai/sd-turbo/blob/main/LICENSE). For terms of use, please visit the [Acceptable Use Policy](https://stability.ai/use-policy). If you comply with the license and terms of use, you have the rights described therin. By using this Model, you accept the terms.

This model is meant to be used with the corresponding sample on this repo for educational or testing purposes only.


### 3. Segment Anything

[Segment Anything](https://huggingface.co/microsoft/segment-anything-model-webnn/tree/main) is a new AI model from Meta AI that can "cut out" any object. In the demo, you can segment any object from your uploaded images.

This Segment Anything Model has been optimized to work with WebNN. This model is licensed under the [Apache-2.0 License](https://github.com/facebookresearch/segment-anything?tab=Apache-2.0-1-ov-file#readme). For terms of use, please visit the [Code of Conduct](https://github.com/facebookresearch/segment-anything?tab=coc-ov-file#readme). If you comply with the license and terms of use, you have the rights described therin. By using this Model, you accept the terms.

This model is meant to be used with the corresponding sample on this repo for educational or testing purposes only.


### 4. Whisper Base

[Whisper Base](https://huggingface.co/microsoft/whisper-base-webnn/tree/main) is a pre-trained model for automatic speech recognition (ASR) and speech translation. In the demo, you can experience the speech to text feature by using on-device inference powered by WebNN API and DirectML, especially the NPU acceleration.

This Whisper-base model has been optimized to work with WebNN. This model is licensed under the [Apache-2.0 license](https://huggingface.co/datasets/choosealicense/licenses/blob/main/markdown/apache-2.0.md). For terms of use, please visit the [Intended use](https://huggingface.co/openai/whisper-base#evaluated-use). If you comply with the license and terms of use, you have the rights described therin. By using this Model, you accept the terms.

This model is meant to be used with the corresponding sample on this repo for educational or testing purposes only.


### 5. Image Classification

[MobileNet](https://github.com/onnx/models/tree/main/validated/vision/classification/mobilenet) and [ResNet](https://github.com/onnx/models/tree/main/validated/vision/classification/resnet) models perform image classification - they take images as input and classify the major object in the image into a set of pre-defined classes.

