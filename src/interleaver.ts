import { Gif } from "./loadGif";

export interface InterleavedGif {
    width: number
    height: number
    frames: any[]
}

export enum InterleaveMode {
    even,
}

const evenWeave = (left: Gif, right: Gif): any[] => {
    return left.frames.map((x, i) => [x, i / left.frames.length, 0])
        .concat(right.frames.map((x, i) => [x, i / right.frames.length, 1]))
        .sort((x, y) => {
            if (x[1] === y[1]) {
                return x[2] - y[2]
            }
            return x[1] - y[1]
        })
        .map(x => x[0]);
}


export const interleave = (leftGif: Gif, rightGif: Gif): InterleavedGif => {
    const frames = evenWeave(leftGif, rightGif)
    return {
        width: leftGif.width,
        height: leftGif.height,
        frames
    }
}