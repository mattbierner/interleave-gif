/**
 * 
 */
export const readAll = (): any => {
    let search = window.location.search;
    if (search[0] === '?')
        search = search.slice(1);

    const pairs = search.split('&');
    return pairs.reduce((p: any, pair) => {
        const [key, value] = pair.split('=');
        if (key.length && value.length)
            p[key] = decodeURIComponent(value);
        return p;
    }, {});
};

/**
 * 
 */
export const read = (keys: any) => {
    const all = readAll();
    return Object.keys(all).reduce((p: any, key) => {
        if (keys.indexOf(key) >= 0) {
            p[key] = all[key]
        }
        return p;
    }, {});
}

/**
 * 
 */
export const write = (keys: any, state: any) => {
    const pairs = readAll();
    keys.forEach((key: any) => pairs[key] = state[key]);

    const search = Object.keys(pairs).map(key => {
        return key + '=' + encodeURIComponent(pairs[key]);
    }).join('&');
    const url = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${search}${window.location.hash}`;
    window.history.replaceState({}, '', url);
};