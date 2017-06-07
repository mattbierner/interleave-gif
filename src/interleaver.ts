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

export const evenWeaveMode: InterleaveMode = {
    name: 'Even Weave',
    description: 'Weave gifs together, attempting to evenly distribute frames of each gif over combined length',
    interleave(left: Gif, right: Gif): Frame[] {
        return left.frames.map((x, i) => [x, i / left.frames.length, 0] as [Frame, number, number])
            .concat(right.frames.map((x, i) => [x, i / right.frames.length, 1] as [Frame, number, number]))
            .sort((x, y) => x[1] === y[1] ? x[2] - y[2] : x[1] - y[1])
            .map(x => x[0])
    }
}

export const alternateMode: InterleaveMode = {
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

export const time: InterleaveMode = {
    name: 'Times',
    description: '',
    interleave(left: Gif, right: Gif): Frame[] {
        const getTimes = (frames: Frame[], index: number) => {
            let start = 0
            return frames.map((frame) => {
                const delay = start
                start += frame.info.delay
                return { frame, delay, index };
            });
        }

        const leftTimes = getTimes(left.frames, 0)
        const rigthTimes = getTimes(right.frames, 1)

        return leftTimes.concat(rigthTimes)
            .sort((x, y) => x.delay === y.delay ? x.index - y.index : x.delay - y.delay)
            .map((x, i, arr) => i === arr.length - 1 ? x.frame : x.frame.withDelay(arr[i + 1].delay - x.delay));
    }
}

export const interleaveModes = [evenWeaveMode, alternateMode, time]


export const interleave = (left: Gif, right: Gif, mode: InterleaveMode): InterleavedGif => {
    return {
        width: left.width,
        height: right.height,
        frames: mode.interleave(left, right)
    }
}