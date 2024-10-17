const status = document.getElementById("status")

const pixelWidth = 512;
const pixelHeight = 512;
const config = {    
    latentWidth: pixelWidth / 8,
    latentHeight: pixelHeight / 8,
    latentChannelCount: 4,
}

const getTokenizers = async (text) => {
    const tokenizers = await window.AutoTokenizer.from_pretrained("./tokenizer/resolve/main/");
    const { input_ids } = await tokenizers(text);
    return Array.from(input_ids.data, (number) => Number(number)).flat();
}

const log = (i) => {
    console.log(i);
    status.value += `\n${i}`;
    status.scrollTop = status.scrollHeight;
};

const generateTensorFillValue = (dataType, shape, value) => {
    let size = 1;
    shape.forEach((element) => {
        size *= element;
    });
    switch (dataType) {
        case "uint8":
            return new ort.Tensor(
                dataType,
                Uint8Array.from({ length: size }, () => value),
                shape
            );
        case "int8":
            return new ort.Tensor(
                dataType,
                Int8Array.from({ length: size }, () => value),
                shape
            );
        case "uint16":
            return new ort.Tensor(
                dataType,
                Uint16Array.from({ length: size }, () => value),
                shape
            );
        case "int16":
            return new ort.Tensor(
                dataType,
                Int16Array.from({ length: size }, () => value),
                shape
            );
        case "uint32":
            return new ort.Tensor(
                dataType,
                Uint32Array.from({ length: size }, () => value),
                shape
            );
        case "int32":
            return new ort.Tensor(
                dataType,
                Int32Array.from({ length: size }, () => value),
                shape
            );
        case "float16":
            return new ort.Tensor(
                dataType,
                Uint16Array.from({ length: size }, () => value),
                shape
            );
        case "float32":
            return new ort.Tensor(
                dataType,
                Float32Array.from({ length: size }, () => value),
                shape
            );
        case "uint64":
            return new ort.Tensor(
                dataType,
                BigUint64Array.from({ length: size }, () => value),
                shape
            );
        case "int64":
            return new ort.Tensor(
                dataType,
                BigInt64Array.from({ length: size }, () => value),
                shape
            );
    }
    throw new Error(`Input tensor type ${dataType} is unknown`);
}

const generateTensorFromValues = (dataType, shape, values) => {
    let size = 1;
    shape.forEach((element) => {
        size *= element;
    });
    try {
        switch (dataType) {
            case "uint8":
                return new ort.Tensor(dataType, new Uint8Array(values), shape);
            case "int8":
                return new ort.Tensor(dataType, new Int8Array(values), shape);
            case "uint16":
                return new ort.Tensor(dataType, new Uint16Array(values), shape);
            case "int16":
                return new ort.Tensor(dataType, new Int16Array(values), shape);
            case "uint32":
                return new ort.Tensor(dataType, new Uint32Array(values), shape);
            case "int32":
                return new ort.Tensor(dataType, new Int32Array(values), shape);
            case "float16":
                return new ort.Tensor(dataType, new Uint16Array(values), shape);
            case "float32":
                return new ort.Tensor(dataType, new Float32Array(values), shape);
            case "uint64":
                return new ort.Tensor(dataType, new BigUint64Array(values), shape);
            case "int64":
                return new ort.Tensor(dataType, new BigInt64Array(values), shape);
        }
        throw new Error(`Input tensor type ${dataType} is unknown`);
    } catch (e) {
        console.log(e)
    }
}

const generateTensorFromBytes = (dataType, shape, values) => {
    let size = 1;
    shape.forEach((element) => {
        size *= element;
    });

    // Coerce TypedArray to actual byte buffer, to avoid constructor behavior that casts to the target type.
    if (!(values instanceof ArrayBuffer)) {
        values = values.buffer;
    }
    switch (dataType) {
        case "uint8":
            return new ort.Tensor(dataType, new Uint8Array(values), shape);
        case "int8":
            return new ort.Tensor(dataType, new Int8Array(values), shape);
        case "uint16":
            return new ort.Tensor(dataType, new Uint16Array(values), shape);
        case "int16":
            return new ort.Tensor(dataType, new Int16Array(values), shape);
        case "uint32":
            return new ort.Tensor(dataType, new Uint32Array(values), shape);
        case "int32":
            return new ort.Tensor(dataType, new Int32Array(values), shape);
        case "float16":
            return new ort.Tensor(dataType, new Uint16Array(values), shape);
        case "float32":
            return new ort.Tensor(dataType, new Float32Array(values), shape);
        case "uint64":
            return new ort.Tensor(dataType, new BigUint64Array(values), shape);
        case "int64":
            return new ort.Tensor(dataType, new BigInt64Array(values), shape);
    }
    throw new Error(`Input tensor type ${dataType} is unknown`);
}

const encodeFloat16 = (floatValue) /*: uint16 Number*/ => {
    let floatView = new Float32Array(1);
    let int32View = new Int32Array(floatView.buffer);

    floatView[0] = floatValue;
    let x = int32View[0];

    let bits = (x >> 16) & 0x8000; // Get the sign
    let m = (x >> 12) & 0x07ff; // Keep one extra bit for rounding
    let e = (x >> 23) & 0xff; // Using int is faster here

    // If zero, denormal, or underflowing exponent, then return signed zero.
    if (e < 103) {
        return bits;
    }

    // If NaN, return NaN. If Inf or exponent overflow, return Inf.
    if (e > 142) {
        bits |= 0x7c00;
        // If exponent was 0xff and one mantissa bit was set, it means NaN,
        // not Inf, so make sure we set one mantissa bit too.
        bits |= (e == 255 ? 0 : 1) && x & 0x007fffff;
        return bits;
    }

    // If exponent underflows but not too much, return a denormal
    if (e < 113) {
        m |= 0x0800;
        // Extra rounding may overflow and set mantissa to 0 and exponent to 1, which is okay.
        bits |= (m >> (114 - e)) + ((m >> (113 - e)) & 1);
        return bits;
    }

    bits |= ((e - 112) << 10) | (m >> 1);
    // Extra rounding. An overflow will set mantissa to 0 and increment the exponent, which is okay.
    bits += m & 1;
    return bits;
}

const decodeFloat16 = (binaryValue) /*: float Number*/ => {
    "use strict";
    let fraction = binaryValue & 0x03ff;
    let exponent = (binaryValue & 0x7c00) >> 10;
    return (
        (binaryValue >> 15 ? -1 : 1) *
        (exponent
            ? exponent === 0x1f
                ? fraction
                    ? NaN
                    : Infinity
                : Math.pow(2, exponent - 15) * (1 + fraction / 0x400)
            : 6.103515625e-5 * (fraction / 0x400))
    );
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
    getTokenizers,
    log,
    generateTensorFillValue,
    generateTensorFromValues,
    generateTensorFromBytes,
    encodeFloat16,
    decodeFloat16,
    getModelOPFS,
    config,
}
