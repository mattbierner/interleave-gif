import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { InterleavedGif } from "./interleaver";

export function drawForOptions(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, gif: InterleavedGif, state: any) {
    canvas.width = gif.width
    canvas.height = gif.height
    context.drawImage(gif.frames[state.currentFrame].canvas, 0, 0, canvas.width, canvas.height)
}

interface GifRendererProps {
    gif: InterleavedGif
    currentFrame: number

    [key: string]: any
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
            drawForOptions(this._canvas, this._ctx, imageData, state);
        }
    }

    render() {
        return (<canvas className="gif-canvas" width="0" height="0" />);
    }
};