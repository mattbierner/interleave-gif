import * as React from 'react'
import Search from "./search";
import GifProperties from "./gif_properties";
import { Gif } from "./loadGif";

interface GifPickerProps {
    label: string
    source: string
    onGifSelected: (gif: string) => void
}

interface GifPickerState {
    showing: boolean
}

export default class GifPicker extends React.Component<GifPickerProps, GifPickerState> {
    constructor(props: GifPickerProps) {
        super(props)

        this.state = {
            showing: false
        }
    }

    private onGifSelected(gif: string) {
        this.setState({ showing: false })
        this.props.onGifSelected(gif)
    }

    private onClick() {
        this.setState({ showing: true })
    }

    private onDismiss() {
        this.setState({ showing: false })
    }

    render() {
        return (
            <div>
                <button className='gif-picker' onClick={this.onClick.bind(this)}>
                    <span className='label'>{this.props.label}</span>
                    <img src={this.props.source} />
                </button>
                <Search
                    onGifSelected={this.onGifSelected.bind(this)}
                    visible={this.state.showing}
                    onDismiss={this.onDismiss.bind(this)} />
            </div>
        )
    }
}