const omggif = require('omggif');

const minDelay = 3

/**
 * Get a file as binary data.
 */
const loadBinaryData = (url: string): Promise<Uint8Array> => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "arraybuffer";

    const p = new Promise((resolve, reject) => {
        xhr.onload = () => {
            if (xhr.status !== 200)
                return reject(`Could not load: ${url}`);
            const arrayBuffer = xhr.response;
            resolve(new Uint8Array(arrayBuffer));
        };
    });
    xhr.send(null);
    return p;
};

export interface FrameInfo {
    delay: number
}

export class Frame {
    constructor(
        public readonly info: FrameInfo,
        public readonly canvas: HTMLCanvasElement,
        public readonly width: number,
        public readonly height: number
    ) { }

    public withDelay(delay: number): Frame {
        return new Frame(
            Object.assign({}, this.info, { delay }),
            this.canvas,
            this.width,
            this.height
        )
    }
}

export interface Gif {
    source: string
    width: number
    height: number
    frames: Frame[]
}

/**
 * Extract metadata and frames from binary gif data.
 */
const decodeGif = (byteArray: Uint8Array, url: string) => {
    const gr = new omggif.GifReader(byteArray);
    return {
        source: url,
        width: gr.width,
        height: gr.height,
        frames: extractGifFrameData(gr)
    }
}

/**
 * Handle IE not supporting new ImageData()
 */
const createImageData = (() => {
    try {
        new ImageData(1, 1);
        return (width: number, height: number) => new ImageData(width, height);
    } catch (e) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext('2d');
        return (width: number, height: number) => ctx.createImageData(width, height);
    }
})();

/**
 * Extract each frame of metadata / frame data (as a canvas) from a gif.
 */
const extractGifFrameData = (reader: any): any[] => {
    const frames = []
    const { width, height } = reader;

    const imageData = createImageData(width, height);
    for (let i = 0, len = reader.numFrames(); i < len; ++i) {
        const info = reader.frameInfo(i);
        info.delay = Math.max(minDelay, info.delay)
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        reader.decodeAndBlitFrameRGBA(i, imageData.data);
        ctx.putImageData(imageData, 0, 0);
        frames.push(new Frame(info, canvas, width, height))
    }
    return frames;
};

/**
 * Load and decode a gif.
 */
export default (url: string): Promise<Gif> =>
    loadBinaryData(url).then(data => decodeGif(data, url));
