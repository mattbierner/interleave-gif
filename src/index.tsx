import * as React from 'react';
import * as ReactDOM from 'react-dom';

import Search from './search';
import Viewer from './viewer';

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
            leftGif: 'https://media1.giphy.com/media/3oEduGi1UWg9Q6nF84/giphy.gif',
            rightGif: "https://media3.giphy.com/media/l3vR1tookIhM8nZJu/giphy.gif"//"https://media4.giphy.com/media/12KiGLydHEdak8/giphy.gif"
        };
    }

    onGifSelected(src: string) {
        this.setState({
            leftGif: src
        });
    }

    render() {
        return (
            <div className='main container'>
                <Viewer
                    leftGif={this.state.leftGif}
                    rightGif={this.state.rightGif} />
                <Search onGifSelected={this.onGifSelected.bind(this)} />
            </div>
        );
    }
};


ReactDOM.render(
    <Main />,
    document.getElementById('content'));