import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Search from './search';
import Viewer from './viewer';
import GifPicker from "./gif_picker";

interface MainState {
    leftGif: string
    rightGif: string
}

/**
 * Main application.
 */
class Main extends React.Component<null, MainState> {
    constructor(props: any) {
        super(props);
        this.state = {
            leftGif: 'https://media2.giphy.com/media/TXvbvcWwnkUjS/giphy.gif',
            rightGif: 'https://media1.giphy.com/media/3oEduGi1UWg9Q6nF84/giphy.gif'//"https://media4.giphy.com/media/12KiGLydHEdak8/giphy.gif"
        };
    }

    onGifSelected(src: string, left: boolean) {
        if (left) {
            this.setState({ leftGif: src })
        } else {
            this.setState({ rightGif: src })

        }
    }

    render() {
        return (
            <div className='main container'>
                <Viewer
                    leftGif={this.state.leftGif}
                    rightGif={this.state.rightGif} />
                <div>
                    <GifPicker label='left' gif={this.state.leftGif} onGifSelected={(gif) => this.onGifSelected(gif, true)} />
                    <GifPicker label='right' gif={this.state.rightGif} onGifSelected={(gif) => this.onGifSelected(gif, false)} />
                </div>
            </div>
        );
    }
};


ReactDOM.render(
    <Main />,
    document.getElementById('content'));