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
            leftGif: 'https://media2.giphy.com/media/jb5WFJTgSSonu/giphy.gif',
            rightGif: 'https://media2.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif'
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