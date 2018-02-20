# pixi-picture

[![Build Status](https://travis-ci.org/pixijs/pixi-picture.svg?branch=master)](https://travis-ci.org/pixijs/pixi-picture)

A plugin that includes a sprite renderer that reduces border artifacts and 3 blend mode implementations for WebGL

Allows to use blendModes that are not available in pure webgl implementation, such as `PIXI.BLEND_MODES.OVERLAY`.

Please, don't add children to sprite if you use those blendModes.

Use `PIXI.picture.Sprite` instead of `PIXI.Sprite`, or change sprite `pluginName` to `picture`, or call `renderer.plugins.picture` from your own Sprite implementation.

For `pixi-v4.1` and prior see `pixi-v4.1` branch

[Usage example](http://pixijs.github.io/examples/#/picture/overlay.js)

## How to build

```bash
npm install
npm run build
```
