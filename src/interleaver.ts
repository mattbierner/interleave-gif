import { Gif, Frame } from "./loadGif";

export interface InterleavedGif {
    width: number
    height: number
    frames: Frame[]
}




export interface InterleaveMode {
    readonly name: string
    readonly description: string
}

export const evenWeaveMode: InterleaveMode = {
    name: 'Even Weave',
    description: 'Weave gifs together, attempting to evenly distribute frames of each gif over combined length'
}

export const alternateMode: InterleaveMode = {
    name: 'Alternate',
    description: 'Alternate frames. Drop frames from right if longer. Repeat frames from right if shorter'
}


export const interleaveModes = [evenWeaveMode, alternateMode]


const evenWeave = (left: Gif, right: Gif): any[] => {
    return left.frames.map((x, i) => [x, i / left.frames.length, 0] as [Frame, number, number])
        .concat(right.frames.map((x, i) => [x, i / right.frames.length, 1] as [Frame, number, number]))
        .sort((x, y) => x[1] === y[1] ? x[2] - y[2] : x[1] - y[1])
        .map(x => x[0])
}

const alternate = (left: Gif, right: Gif): any[] => {
    const frames = []
    for (let i = 0; i < left.frames.length; ++i) {
        const leftFrame = left.frames[i]
        frames.push(leftFrame)
        frames.push(right.frames[i % right.frames.length].withDelay(leftFrame.info.delay))
    }
    return frames
}


export const interleave = (leftGif: Gif, rightGif: Gif, mode: InterleaveMode): InterleavedGif => {
    let frames = [];
    switch (mode) {
        case evenWeaveMode:
            frames = evenWeave(leftGif, rightGif)
            break;
        case alternateMode:
            frames = alternate(leftGif, rightGif)
            break;
    }

    return {
        width: leftGif.width,
        height: leftGif.height,
        frames
    }
}