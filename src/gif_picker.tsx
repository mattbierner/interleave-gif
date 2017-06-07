import * as React from 'react'
import Search from "./search";

interface GifPickerProps {
    label: string
    gif: string
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

    render() {
        return (
            <div>
                <button onClick={this.onClick.bind(this)}>
                    <span>{this.props.label}</span>
                    <img src={this.props.gif} />
                </button>
                <Search onGifSelected={this.onGifSelected.bind(this)} visible={this.state.showing} />
            </div>
        )
    }
}