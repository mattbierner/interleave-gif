import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LabeledSlider from './labeled_slider';
import LoadingSpinner from './loading_spinner';
import GifRenderer, { ScaleMode } from './gif_renderer';
import { Gif } from "./loadGif";
import { InterleavedGif, interleave } from "./interleaver";

const playbackSpeeds: any = {
    '1x speed': 1,
    '2x speed': 2,
    '4x speed': 4,
    '8x speed': 8,
    '1/2 speed': 0.5,
    '1/4 speed': 0.25,
    '1/8 speed': 0.125,
};

/**
 * Select playback speed.
 */
class SpeedSelector extends React.Component<any, null> {
    render() {
        const options = Object.keys(playbackSpeeds).map(x =>
            <option value={playbackSpeeds[x]} key={x}>{x}</option>);

        return (
            <div className='playback-speed-selector'>
                <select value={this.props.value} onChange={this.props.onChange}>
                    {options}
                </select>
            </div>
        );
    }
}

/**
 * Property of a gif.
 */
class GifProperty extends React.Component<{ value: string | number, label: string }, null> {
    render() {
        return (
            <div className="property">
                <span className="key">{this.props.label}</span>: <span className="value">{this.props.value}</span>
            </div>
        );
    }
};

/**
 * Set of metadata displayed about a gif.
 */
class GifProperties extends React.Component<{ gif: InterleavedGif | Gif }, null> {
    render() {
        return (
            <div className="gif-properties">
                <GifProperty label="Frames" value={this.props.gif ? this.props.gif.frames.length : ''} />
                <GifProperty label="Width" value={this.props.gif ? this.props.gif.width : ''} />
                <GifProperty label="Height" value={this.props.gif ? this.props.gif.height : ''} />
            </div>
        );
    }
};

interface GifPlayerProps {
    interleaved: Gif | null
    loadingGif: boolean
    scaleMode: ScaleMode
}

interface GifPlayerState {
    currentFrame: number
    playing: boolean
    loop: boolean
    playbackSpeed: number
}

/**
 * Playback controls for scanlined gif.
 */
export default class GifPlayer extends React.Component<GifPlayerProps, GifPlayerState> {
    constructor(props: GifPlayerProps) {
        super(props)
        this.state = {
            currentFrame: 0,
            playing: false,
            loop: true,
            playbackSpeed: 1
        }
    }

    componentWillReceiveProps(newProps: GifPlayerProps) {
        if (this.props.interleaved !== newProps.interleaved) {
            this.setState({
                currentFrame: 0,
                playing: true // autoplay
            });
            this.scheduleNextFrame(newProps.interleaved, 0, true);
        }
    }

    onToggle() {
        this.setState({ playing: !this.state.playing });

        if (!this.state.playing) {
            this.scheduleNextFrame(this.props.interleaved, 0, true);
        }
    }

    getNumFrames() {
        if (!this.props.interleaved)
            return 0;
        return this.props.interleaved.frames.length;
    }

    scheduleNextFrame(leftImageData: InterleavedGif, delay: number, forcePlay?: boolean) {
        if (!forcePlay && !this.state.playing)
            return;

        const start = Date.now();
        setTimeout(() => {
            if (!this.props.interleaved || this.props.interleaved !== leftImageData)
                return;

            let nextFrame = (this.state.currentFrame + 1);
            if (nextFrame >= this.getNumFrames() && !this.state.loop) {
                this.setState({ playing: false });
                return;
            }

            nextFrame %= this.getNumFrames();

            const interval = ((this.props.interleaved.frames[nextFrame].info.delay || 1) * 10) / this.state.playbackSpeed;
            const elapsed = (Date.now() - start);
            const next = Math.max(0, interval - (elapsed - delay));
            this.setState({
                currentFrame: nextFrame
            });
            this.scheduleNextFrame(leftImageData, next);
        }, delay);
    }

    onSliderChange(e: any) {
        const frame = +e.target.value % this.getNumFrames();
        this.setState({ currentFrame: frame });
    }

    onReplay() {
        this.setState({ currentFrame: 0 });
    }

    onPlaybackSpeedChange(e: any) {
        const value = +e.target.value;
        this.setState({ playbackSpeed: value });
    }

    render() {
        return (
            <div className="gif-figure">
                <GifRenderer
                    gif={this.props.interleaved}
                    currentFrame={this.state.currentFrame}
                    scaleMode={this.props.scaleMode} />
                <div className="content-wrapper">
                    <GifProperties gif={this.props.interleaved} />
                </div>
                <div>
                    <LoadingSpinner active={this.props.loadingGif} />
                </div>
                <div className="playback-controls content-wrapper">
                    <LabeledSlider className="playback-tracker"
                        min={0}
                        max={this.getNumFrames() - 1}
                        value={this.state.currentFrame}
                        onChange={this.onSliderChange.bind(this)} />

                    <div className="buttons">
                        <button
                            title="Restart"
                            className="material-icons"
                            onClick={this.onReplay.bind(this)}>replay</button>
                        <button
                            className="material-icons"
                            onClick={this.onToggle.bind(this)}>{this.state.playing ? 'pause' : 'play_arrow'}</button>
                        <SpeedSelector value={this.state.playbackSpeed} onChange={this.onPlaybackSpeedChange.bind(this)} />
                    </div>
                </div>
            </div>
        );
    }
};
