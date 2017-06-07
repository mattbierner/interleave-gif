import * as React from 'react';
import * as ReactDOM from 'react-dom';

import loadGif, { Gif } from './loadGif';
import LabeledSlider from './labeled_slider';
import LoadingSpinner from './loading_spinner';
import GifPlayer from './gif_player';
import exportGif from './gif_export';
import { interleaveModes, InterleaveMode, InterleavedGif, interleave } from "./interleaver";
import { ScaleMode, scaleModes } from "./gif_renderer";
import GifPicker from "./gif_picker";

interface ModeSelectorProps<T> {
    title: string
    options: T[]
    value: T
    onChange: (mode: T) => void
}

/**
 * Control for selecting rendering mode.
 */
class ModeSelector<T> extends React.Component<ModeSelectorProps<{ name: string, description: string }>, null> {
    private onChange(e: React.ChangeEvent<HTMLSelectElement>) {
        const mode = this.props.options.find(x => x.name === e.target.value)
        this.props.onChange(mode);
    }

    render() {
        const modeOptions = this.props.options.map(x =>
            <option value={x.name} key={x.name}>{x.name}</option>);
        return (
            <div className='mode-selector control-group'>
                <span className='control-title'>{this.props.title} </span>
                <select value={this.props.value.name} onChange={this.onChange.bind(this)}>
                    {modeOptions}
                </select>
                <div className='control-description'>{this.props.value.description}</div>
            </div>
        );
    }
}


interface ViewerState {
    leftGif: string
    rightGif: string

    leftImageData: Gif | null
    rightImageData: Gif | null
    interleaved: InterleavedGif | null
    loadingGif: boolean
    mode: InterleaveMode
    scaleMode: ScaleMode
    exporting: boolean
    error?: string
}

/**
 * Displays an interative scanlined gif with controls. 
 */
export default class Viewer extends React.Component<null, ViewerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            leftGif: 'https://media2.giphy.com/media/TXvbvcWwnkUjS/giphy.gif',
            rightGif: 'https://media1.giphy.com/media/3oEduGi1UWg9Q6nF84/giphy.gif',//"https://media4.giphy.com/media/12KiGLydHEdak8/giphy.gif"

            leftImageData: null,
            rightImageData: null,
            interleaved: null,

            mode: interleaveModes[0],
            scaleMode: scaleModes[0],

            loadingGif: false,
            exporting: false
        }
    }

    componentDidMount() {
        this.loadGif(this.state.leftGif, this.state.rightGif)
    }

    private loadGif(leftGif: string, rightGif: string) {
        this.setState({ loadingGif: true })
        Promise.all([loadGif(leftGif), loadGif(rightGif)])
            .then(([leftData, rightData]) => {
                if (leftGif !== this.state.leftGif || rightGif !== this.state.rightGif)
                    return

                this.setState({
                    leftImageData: leftData,
                    rightImageData: rightData,
                    interleaved: interleave(leftData, rightData, this.state.mode),

                    loadingGif: false,
                    error: null
                })
            })
            .catch(e => {
                if (leftGif !== this.state.leftGif || rightGif !== this.state.rightGif)
                    return

                console.error(e)
                this.setState({
                    leftImageData: null,
                    rightImageData: null,
                    interleaved: null,

                    loadingGif: false,
                    error: 'Could not load gif'
                })
            });
    }

    private onInterleaveModeChange(mode: InterleaveMode): void {
        this.setState({
            mode,
            interleaved: interleave(this.state.leftImageData, this.state.rightImageData, mode)
        });
    }

    private onScaleModeChange(mode: ScaleMode): void {
        this.setState({ scaleMode: mode, })
    }

    private onExport() {
        this.setState({ exporting: true });
        exportGif(this.state.interleaved, this.state.scaleMode, this.state).then(blob => {
            this.setState({ exporting: false });
            const url = URL.createObjectURL(blob);
            window.open(url);
        });
    }


    private onGifSelected(src: string, left: boolean) {
        if (left) {
            this.setState({ leftGif: src })
        } else {
            this.setState({ rightGif: src })
        }
    }

    render() {
        return (
            <div className="main container gif-viewer" id="viewer">
                <div className="player-wrapper">
                    <GifPlayer {...this.state} />
                </div>
                <div className="view-controls">
                    <div className='gif-pickers'>
                        <GifPicker label='left' gif={this.state.leftGif} onGifSelected={(gif) => this.onGifSelected(gif, true)} />
                        <GifPicker label='right' gif={this.state.rightGif} onGifSelected={(gif) => this.onGifSelected(gif, false)} />
                    </div>

                    <ModeSelector
                        title='Interleave Mode'
                        options={interleaveModes}
                        value={this.state.mode}
                        onChange={this.onInterleaveModeChange.bind(this)} />

                    <ModeSelector
                        title='Scale Mode'
                        options={scaleModes}
                        value={this.state.scaleMode}
                        onChange={this.onScaleModeChange.bind(this)} />

                    <div className='export-controls'>
                        <button onClick={this.onExport.bind(this)}>Export to gif</button>
                        <div>
                            <LoadingSpinner active={this.state.exporting} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
};


ReactDOM.render(
    <Viewer />,
    document.getElementById('content'));