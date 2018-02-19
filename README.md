# pixi-picture

[![Build Status](https://travis-ci.org/pixijs/pixi-picture.svg?branch=master)](https://travis-ci.org/pixijs/pixi-picture)

Quality renderer for sprites in pixi.js v4.2 and up.

Reduces border artifacts.

Allows to use blendModes that are not available in pure webgl implementation, such as PIXI.BLEND_MODES.OVERLAY.

Please, don't add children to sprite if you use those blendModes.

Use PIXI.picture.Sprite instead of PIXI.Sprite, or call renderer.plugins.picture from your own Sprite implementation.

For pixi-v4.1 and prior see "pixi-v4.1" branch

[Usage example](http://pixijs.github.io/examples/#/picture/overlay.js)

## How to build

```bash
npm install
npm run build
```
