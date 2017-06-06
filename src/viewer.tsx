import * as React from 'react';
import * as ReactDOM from 'react-dom';

import loadGif from './loadGif';
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
    file: string
}

interface ViewerState {
    imageData: any
    loadingGif: boolean
    mode: string
    exporting: boolean
    error?: any
}

/**
 * Displays an interative scanlined gif with controls. 
 */
export default class Viewer extends React.Component<ViewerProps, ViewerState> {
    constructor(props: ViewerProps) {
        super(props);
        this.state = {
            imageData: null,
            loadingGif: false,
            mode: Object.keys(modes)[0],
            exporting: false
        };
    }

    componentDidMount() {
        this.loadGif(this.props.file);
    }

    componentWillReceiveProps(newProps: ViewerProps) {
        if (newProps.file && newProps.file.length && newProps.file !== this.props.file) {
            this.loadGif(newProps.file);
        }
    }

    private loadGif(file: string) {
        this.setState({ loadingGif: true });
        loadGif(file)
            .then(data => {
                if (file !== this.props.file)
                    return;

                this.setState({
                    imageData: data,
                    loadingGif: false,
                    error: null
                });
            })
            .catch(e => {
                if (file !== this.props.file)
                    return;

                console.error(e);
                this.setState({
                    imageData: [],
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
        exportGif(this.state.imageData, this.state).then(blob => {
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
