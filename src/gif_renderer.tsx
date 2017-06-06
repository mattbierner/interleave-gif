import * as React from 'react';
import * as ReactDOM from 'react-dom';

import * as scanline_renderer from './scanline_renderer';

interface GifRendererProps {
    imageData: any
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
        this.drawGifForOptions(newProps.imageData, newProps);
    }

    drawGifForOptions(imageData: any, state: GifRendererProps) {
        if (imageData) {
            scanline_renderer.drawForOptions(this._canvas, this._ctx, imageData, state);
        }
    }

    render() {
        return (<canvas className="gif-canvas" width="0" height="0" />);
    }
};