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

const evenWeave = (left: Gif, right: Gif,
    map: (frames: Frame[], index: number) => ([Frame, number, number])[]
): Frame[] => {

    let lastDelay = 0;
    return map(left.frames, 0).concat(map(right.frames, 1))
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

const evenWeaveMode: InterleaveMode = {
    name: 'Even Weave',
    description: 'Weave gifs together, attempting to evenly distribute frames',
    interleave(left: Gif, right: Gif): Frame[] {
        return evenWeave(left, right, (frames: Frame[], index: number) =>
            frames.map((x, i) => [x, (i + 1) / frames.length, index] as [Frame, number, number]))
    }
}

const evenWeaveWithinMode: InterleaveMode = {
    name: 'Even Weave Within',
    description: 'Weave gifs together, attempting to evenly distribute the additional gif frames within primary gif',
    interleave(left: Gif, right: Gif): Frame[] {
        return evenWeave(left, right, (frames: Frame[], index: number) =>
            frames.map((x, i) => [x, (i + 1) / (frames.length + 1), index] as [Frame, number, number]))
    }
}

const alternateMode: InterleaveMode = {
    name: 'Alternate',
    description: 'Alternate frames. Drop frames from additional gif if longer. Repeat frames from additional gif if shorter',
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

export const interleaveModes = [evenWeaveMode, evenWeaveWithinMode, alternateMode]


export const interleave = (left: Gif, right: Gif, mode: InterleaveMode): InterleavedGif => {
    return {
        width: left.width,
        height: left.height,
        frames: mode.interleave(left, right)
    }
}