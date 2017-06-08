<div align="center">
    <div><img src="documentation/images/logo.png" /></div>
</div>

*interleave.gif* is an experiment interleaving the frames of two gifs together.

* [Site][site]
* [Documentation][documentation]


## Building and Running
The website uses [Jekyll](http://jekyllrb.com/) and [Webpack](http://webpack.github.io/) for building:

```bash
$ git checkout gh-pages
$ npm install
```

Start Jekyll with:

```bash
$ jekyll serve -w
```

Start webpack with:

```bash
$ webpack --watch
```

Main TypeScript code is in `src` and output to `dist` folder.


[site]: https://mattbierner.github.io/interleave-gif/
[documentation]: documentation/about.md