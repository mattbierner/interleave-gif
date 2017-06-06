import * as React from 'react';
import * as ReactDOM from 'react-dom';

export default class LoadingSpinner extends React.Component<{ active: boolean }, null> {
    render() {
        return (
            <span className={"material-icons loading-spinner " + (this.props.active ? '' : 'hidden')}>autorenew</span>
        );
    }
}