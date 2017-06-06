import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { InterleavedGif } from "./interleaver";

export interface ScaleMode {
    readonly name: string
    readonly description: string
}

export const scaleToFit: ScaleMode = {
    name: 'Scale to Fit',
    description: 'Scale the right image to fit within the left image'
}

export const scaleAndCrop: ScaleMode = {
    name: 'Scale and Crop',
    description: 'Scale the right image proportionally and then crop'
}


export const scaleModes = [scaleToFit, scaleAndCrop]

export function drawForOptions(
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    gif: InterleavedGif,
    mode: ScaleMode,
    state: any
) {
    canvas.width = gif.width
    canvas.height = gif.height

    const frame = gif.frames[state.currentFrame]

    if (mode === scaleToFit) {
        context.drawImage(frame.canvas, 0, 0, canvas.width, canvas.height)
    } else if (mode === scaleAndCrop) {
        const scaleX = gif.width / frame.width
        const scaleY = gif.height / frame.height
        const scale = Math.max(scaleX, scaleY)
        const newWidth = scale * frame.width
        const newHeight = scale * frame.height

        context.drawImage(frame.canvas, (gif.width - newWidth) / 2, (gif.height - newHeight) / 2, newWidth, newHeight)
    }
}

interface GifRendererProps {
    gif: InterleavedGif
    currentFrame: number
    scaleMode: ScaleMode
}

/**
 * Renders a scanlined gif. 
 */
export default class GifRenderer extends React.Component<GifRendererProps, null> {
    _ctx: any;
    _canvas: any;

    componentDidMount() {
        this._canvas = ReactDOM.findDOMNode(this);
        this._ctx = this._canvas.getContext('2d');
    }

    componentWillReceiveProps(newProps: GifRendererProps) {
        this.drawGifForOptions(newProps.gif, newProps);
    }

    drawGifForOptions(imageData: any, state: GifRendererProps) {
        if (imageData) {
            drawForOptions(this._canvas, this._ctx, imageData, this.props.scaleMode, state);
        }
    }

    render() {
        return (<canvas className="gif-canvas" width="0" height="0" />);
    }
};