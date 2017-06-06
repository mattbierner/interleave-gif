import * as React from 'react';
import * as ReactDOM from 'react-dom';

import loadGif, { Gif } from './loadGif';
import LabeledSlider from './labeled_slider';
import LoadingSpinner from './loading_spinner';
import GifPlayer from './gif_player';
import exportGif from './gif_export';

/**
 * Display modes
 */
const modes: any = {
    'columns': {
        title: 'Columns',
        description: 'Equal width columns, one for each frame'
    },
    'rows': {
        title: 'Rows',
        description: 'Equal height rows, one for each frame'
    },
    'grid': {
        title: 'Grid',
        description: 'Configurable grid'
    },
    'diagonal': {
        title: 'Diagonal',
        description: 'Configurable diagonal bars'
    },
    'circle': {
        title: 'Rings',
        description: 'Configurable rings'
    }
};

/**
 * Control for selecting rendering mode.
 */
class ModeSelector extends React.Component<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }, null> {
    render() {
        const modeOptions = Object.keys(modes).map(x =>
            <option value={x} key={x}>{modes[x].title}</option>);
        return (
            <div className="mode-selector control-group">
                <span className="control-title">Mode </span>
                <select value={this.props.value} onChange={this.props.onChange}>
                    {modeOptions}
                </select>
                <div className="control-description">{modes[this.props.value].description}</div>
            </div>);
    }
}

interface ViewerProps {
    leftGif: string
    rightGif: string
}

interface ViewerState {
    leftImageData: Gif | null
    rightImageData: Gif | null
    loadingGif: boolean
    mode: string
    exporting: boolean
    error?: string
}

/**
 * Displays an interative scanlined gif with controls. 
 */
export default class Viewer extends React.Component<ViewerProps, ViewerState> {
    constructor(props: ViewerProps) {
        super(props);
        this.state = {
            leftImageData: null,
            rightImageData: null,

            loadingGif: false,
            mode: Object.keys(modes)[0],
            exporting: false
        }
    }

    componentDidMount() {
        this.loadGif(this.props.leftGif, this.props.rightGif)
    }

    componentWillReceiveProps(newProps: ViewerProps) {
        if (newProps.leftGif && this.props.rightGif &&
            (newProps.leftGif !== this.props.leftGif || newProps.rightGif! + this.props.rightGif)) {
            this.loadGif(newProps.leftGif, newProps.rightGif)
        }
    }

    private loadGif(leftGif: string, rightGif: string) {
        this.setState({ loadingGif: true })
        Promise.all([loadGif(leftGif), loadGif(rightGif)])
            .then(([leftData, rightData]) => {
                if (leftGif !== this.props.leftGif || rightGif !== this.props.rightGif)
                    return

                this.setState({
                    leftImageData: leftData,
                    rightImageData: rightData,
                    loadingGif: false,
                    error: null
                })
            })
            .catch(e => {
                if (leftGif !== this.props.leftGif || rightGif !== this.props.rightGif)
                    return

                console.error(e)
                this.setState({
                    leftImageData: null,
                    rightImageData: null,
                    loadingGif: false,
                    error: 'Could not load gif'
                })
            });
    }

    onModeChange(e: any) {
        const value = e.target.value;
        this.setState({ mode: value });
    }

    onExport() {
        this.setState({ exporting: true });
        exportGif(this.state.leftImageData, this.state).then(blob => {
            this.setState({ exporting: false });
            const url = URL.createObjectURL(blob);
            window.open(url);
        });
    }

    render() {
        return (
            <div className="gif-viewer" id="viewer">
                <div className="player-wrapper">
                    <GifPlayer {...this.state} />
                </div>
                <div className="view-controls">
                    <ModeSelector value={this.state.mode} onChange={this.onModeChange.bind(this)} />

                    <div className="export-controls">
                        <button onClick={this.onExport.bind(this)}>Export to gif</button>
                        <div>
                            <LoadingSpinner active={this.state.exporting} />
                        </div>
                    </div>
                </div>
            </div>);
    }
};
