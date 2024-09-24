const status = document.getElementById("status")

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
    getModelOPFS,
}
