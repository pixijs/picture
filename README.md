# pixi-picture

[![Build Status](https://travis-ci.org/pixijs/pixi-picture.svg?branch=master)](https://travis-ci.org/pixijs/pixi-picture)

## Precise Sprite Renderer

A plugin that includes a sprite renderer that reduces border artifacts and 3 blend mode implementations for WebGL

Allows to use blendModes that are not available in pure webgl implementation, such as `PIXI.BLEND_MODES.OVERLAY`.

Please, don't add children to sprite if you use those blendModes.

Use `PIXI.picture.Sprite` instead of `PIXI.Sprite`, or change sprite `pluginName` to `picture`, or call `renderer.plugins.picture` from your own Sprite implementation.

[Overlay example](https://gameofbombs.github.io/examples-heaven/#/picture/overlay.js)

## Heavenly filter feature

Enables `backdropSampler` uniform in filters, works only if you render stage to renderTexture or you have a filter somewhere in parents. 

Sample DisplacementFilter takes everything from container and applies it as a displacement texture on backdrop.

[Filter example](https://gameofbombs.github.io/examples-heaven/#/picture/overlay.js)

## Compatibility

Compatible with PixiJS 4.8.0 and up.

For PixiJS `v4.1` and prior see `pixi-v4.1` branch
For PixiJS `v4.7` and prior see `pixi-v4.2` branch

## How to build

```bash
npm install
npm run build
```

