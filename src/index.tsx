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
import ModeSelector from "./mode_selector";

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
class Viewer extends React.Component<null, ViewerState> {
    constructor(props: any) {
        super(props);
        this.state = {
            leftGif: 'https://media3.giphy.com/media/SEO7ub2q1fORa/giphy.gif',
            rightGif: 'https://media2.giphy.com/media/RN6sYUh5VIYlG/giphy.gif',

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
        const loadOrUseCached = (source: string, cached: Gif | null) =>
            cached && source === cached.source ? Promise.resolve(cached) : loadGif(source)

        this.setState({ loadingGif: true })

        Promise.all([
            loadOrUseCached(leftGif, this.state.leftImageData),
            loadOrUseCached(rightGif, this.state.rightImageData)
        ])
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
        })
    }

    private onScaleModeChange(mode: ScaleMode): void {
        this.setState({ scaleMode: mode })
    }

    private onExport() {
        this.setState({ exporting: true })
        exportGif(this.state.interleaved, this.state.scaleMode, this.state).then(blob => {
            this.setState({ exporting: false })
            const url = URL.createObjectURL(blob)
            window.open(url)
        })
    }


    private onGifSelected(src: string, left: boolean) {
        if (left) {
            this.setState({ leftGif: src })
            this.loadGif(src, this.state.rightGif)
        } else {
            this.setState({ rightGif: src })
            this.loadGif(this.state.leftGif, src)
        }
    }

    private onSwap() {
        if (this.state.loadingGif) {
            return
        }

        this.setState({
            leftGif: this.state.rightGif,
            rightGif: this.state.leftGif,

            leftImageData: this.state.rightImageData,
            rightImageData: this.state.leftImageData,

            interleaved: interleave(this.state.rightImageData, this.state.leftImageData, this.state.mode)
        })
    }

    render() {
        return (
            <div className="main container gif-viewer" id="viewer">
                <div className="player-wrapper">
                    <GifPlayer {...this.state} />
                </div>
                <div className="view-controls">
                    <div className='gif-pickers'>
                        <GifPicker
                            searchTitle='Primary Gif'
                            label='primary'
                            source={this.state.leftGif}
                            onGifSelected={(gif) => this.onGifSelected(gif, true)} />

                        <button className='material-icons swap-button' title='Swap' onClick={this.onSwap.bind(this)}>swap_horiz</button>

                        <GifPicker
                            searchTitle='Additional Gif'
                            label='additional'
                            source={this.state.rightGif}
                            onGifSelected={(gif) => this.onGifSelected(gif, false)} />
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
}


ReactDOM.render(
    <Viewer />,
    document.getElementById('content'))
