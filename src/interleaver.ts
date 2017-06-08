import { Gif, Frame } from "./loadGif";

export interface InterleavedGif {
    width: number
    height: number
    frames: Frame[]
}

export interface InterleaveMode {
    readonly name: string
    readonly description: string

    interleave(left: Gif, right: Gif): Frame[]
}

const evenWeaveMode: InterleaveMode = {
    name: 'Even Weave',
    description: 'Weave gifs together, attempting to evenly distribute frames of each gif over combined length',
    interleave(left: Gif, right: Gif): Frame[] {
        let lastDelay = 0;
        return left.frames.map((x, i) => [x, i / left.frames.length, 0] as [Frame, number, number])
            .concat(right.frames.map((x, i) => [x, i / right.frames.length, 1] as [Frame, number, number]))
            .sort((x, y) => x[1] === y[1] ? x[2] - y[2] : x[1] - y[1])
            .map(x => {
                if (x[2] === 0) {
                    lastDelay = x[0].info.delay
                } else {
                    return x[0].withDelay(lastDelay);
                }

                return x[0]
            })
    }
}

const alternateMode: InterleaveMode = {
    name: 'Alternate',
    description: 'Alternate frames. Drop frames from right if longer. Repeat frames from right if shorter',
    interleave(left: Gif, right: Gif): Frame[] {
        const frames = []
        for (let i = 0; i < left.frames.length; ++i) {
            const leftFrame = left.frames[i]
            frames.push(leftFrame)
            frames.push(right.frames[i % right.frames.length].withDelay(leftFrame.info.delay))
        }
        return frames
    }
}

export const interleaveModes = [evenWeaveMode, alternateMode]


export const interleave = (left: Gif, right: Gif, mode: InterleaveMode): InterleavedGif => {
    return {
        width: left.width,
        height: left.height,
        frames: mode.interleave(left, right)
    }
}