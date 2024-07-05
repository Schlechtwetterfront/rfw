# `rfw` [![npm](https://img.shields.io/npm/v/rfw2d)](https://www.npmjs.com/package/rfw2d)

<p align="center">
    <a href="https://schlechtwetterfront.github.io/rfw">Documentation</a>
    ·
    <a href="https://schlechtwetterfront.github.io/rfw/samples/">Samples</a>
    ·
    <a href="https://schlechtwetterfront.github.io/rfw/reference/">Reference</a>
</p>

2D rendering library for WebGL.

-   Get started easily with apps, providing a default "bundle" of systems to create your application from
-   Tickers: run logic in a manner similar to ECS systems
-   Scene (graphs)
-   Low abstraction render tooling
-   Math utility modules
-   Change tracking
-   Performance in mind
-   Minimal dependencies

## Getting Started

Install the package from `npm`:

```sh
npm install rfw2d
```

And import from `rfw2d`:

```ts
import { Vec2 } from 'rfw2d';
```

For more instructions and samples, check out the [Guide](https://schlechtwetterfront.github.io/rfw/guide/).

## Contribute

### Development

Use `npm run dev <app path>` to run any of the apps in a Vite dev web server. E.g.:

```sh
npm run dev samples/bunnymark
```

to run a sample, or:

```sh
npm run dev benchmarks
```

to run the benchmark app.

### Tests

Use `npm run test` to watch tests and `npm run types:watch` to continuously check types.

### Docs

Use `npm run docs:dev` to start the doc dev web server.

The reference is built separately, with `npm run reference:build` and does not have a dev version.

## License

[MIT](https://opensource.org/licenses/MIT)
