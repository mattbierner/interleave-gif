import * as React from 'react';
import * as ReactDOM from 'react-dom';

import LoadingSpinner from './loading_spinner';

const giphy = require('giphy-api')({
    https: true,
    apiKey: 'dc6zaTOxFJmzC'
});

interface SearchResultProps {
    data: any
    onGifSelected: (data: any) => void
}


interface SearchResultState {
    active: boolean
    selected: boolean
}

/**
 * Gif search result
 */
class SearchResult extends React.Component<SearchResultProps, SearchResultState> {
    constructor(props: SearchResultProps) {
        super(props);
        this.state = {
            active: false,
            selected: false
        };
    }

    onMouseOver() {
        this.setState({ active: true });
    }

    onMouseOut() {
        this.setState({ active: false });
    }

    onSelect() {
        this.props.onGifSelected(this.props.data);
    }

    onTouchDown() {
        if (this.state.active) {
            this.setState({ selected: true });
        }
    }

    onScrollLeave() {
        this.setState({ active: false });
    }

    render() {
        const still = this.props.data.images.downsized_still;
        const animated = this.props.data.images.downsized;

        return (
            <li className={"search-result " + (this.state.active ? 'active' : '')}
                onClick={this.onSelect.bind(this)}
                onMouseOver={this.onMouseOver.bind(this)}
                onMouseOut={this.onMouseOut.bind(this)}>
                <figure className="preview" >
                    <img className="still" src={still.url} />
                    <img style={{ display: this.state.active ? 'block' : 'none' }} className="animated" src={this.state.active ? animated.url : 'about:blank'} />
                </figure>
            </li>
        );
    }
};

interface GifSearchBarProps {
    searchText: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    onSearch: (text: string) => void
}

/**
 * Search bar for entering text
 */
class GifSearchBar extends React.Component<GifSearchBarProps, null> {
    onKeyPress(e: KeyboardEvent) {
        if (e.key === 'Enter') {
            this.onSearch();
        }
    }

    onSearch() {
        this.props.onSearch(this.props.searchText);
    }

    render() {
        return (
            <div className="gif-search-bar content-wrapper">
                <button onClick={this.onSearch.bind(this)}><span className="material-icons">search</span></button>
                <input type="text"
                    value={this.props.searchText}
                    placeholder="find a gif"
                    onKeyPress={this.onKeyPress.bind(this)}
                    onChange={this.props.onChange} />
            </div>
        );
    }
}


interface GifSearchResultsProps {
    results: any[]
    loading: boolean
    query: string
    onGifSelected: (gif: string) => void
    onMore: () => void

    hasMore: boolean
    offset: number
}

/**
 * Displays list of gif search results
 */
class GifSearchResults extends React.Component<GifSearchResultsProps, null> {
    render() {
        let results;
        if (this.props.results && this.props.results.length === 0) {
            if (!this.props.loading) {
                results = <div>No gifs found</div>;
            }
        } else if (this.props.results) {
            results = this.props.results.map(x =>
                <SearchResult key={x.id} data={x}
                    onGifSelected={this.props.onGifSelected} />);
        }
        let more = undefined;
        if (this.props.hasMore) {
            more = <button className='more-button' onClick={this.props.onMore}>Load More</button>
        }

        return (
            <div>
                <div className="search-label">{this.props.query}</div>
                <LoadingSpinner active={this.props.loading} />
                <ul className="search-results">{results}</ul>
                {more}
            </div>
        )
    }
}

interface SearchProps {
    visible: boolean
    onGifSelected: (gif: string) => void
}

interface SearchState {
    searchText: string
    query: string // search term for current results
    loading: boolean
    results: any

    hasMore: boolean
    offset: number
}

/**
 * Gif search control.
 */
export default class Search extends React.Component<SearchProps, SearchState> {
    constructor(props: SearchProps) {
        super(props);
        this.state = {
            searchText: '',
            query: '', // search term for current results
            loading: false,
            results: null,
            hasMore: false,
            offset: 0
        };
    }

    private onSearchTextChange(e: any) {
        const value = e.target.value;
        this.setState({ searchText: value });
    }

    private search() {
        this.setState({
            loading: true,
            query: this.state.searchText,
            results: [],
            hasMore: false,
            offset: 0
        });

        this.doSearch(this.state.searchText, 0)
    }

    private doSearch(searchText: string, offset: number) {
        giphy.search({ q: searchText, offset: offset })
            .then((res: any) => {
                if (searchText !== this.state.searchText) {
                    return
                }

                this.setState({
                    results: this.state.results.concat(res.data),
                    loading: false,
                    offset: res.pagination.offset + res.data.length,
                    hasMore: res.pagination.count + res.pagination.offset < res.pagination.total_count
                });
            })
            .catch((err: any) => {
                console.error(err);
                this.setState({
                    loading: false,
                    hasMore: false
                })
            });
    }

    private onGifSelected(data: any) {
        const src = data.images.downsized_medium.url;
        this.props.onGifSelected(src);
    }

    private onMore(): void {
        this.doSearch(this.state.searchText, this.state.offset)
    }

    render() {
        return (
            <div className='gif-search-wrapper' style={{ 'display': this.props.visible ? 'flex' : 'none' }}>
                <div className='gif-search'>
                    <GifSearchBar
                        searchText={this.state.searchText}
                        onChange={this.onSearchTextChange.bind(this)}
                        onSearch={this.search.bind(this)} />
                    <GifSearchResults {...this.state}
                        onGifSelected={this.onGifSelected.bind(this)}
                        onMore={this.onMore.bind(this)} />
                </div>
            </div>
        )
    }
};
