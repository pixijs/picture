# pixi-picture

## Blend-modes emulated through filters

Allows to use blendModes that are not available in pure webgl implementation, such as `PIXI.BLEND_MODES.OVERLAY`.

Please, don't add children to sprite if you use those blendModes.

Use `PIXI.picture.Sprite` instead of `PIXI.Sprite`.

[Overlay example](https://pixijs.github.io/examples/#/plugin-picture/overlay.js)

Logic: if sprite has special blendMode, push corresponding filter `PIXI.picture.getBlendFilter(blendMode)`, if area is too small (<1px), dont draw at all.

If you want to use this with any components - just look in the source of Sprite how its done.

Assigning a filter to component directly `container.filters = [PIXI.picture.getBlendFilter(blendMode)]` should work too.

*To be fixed*: At the moment this implementation is a bit worse than v4, it uses extra pass for filter.

## Heavenly filter feature

Enables `backdropSampler` uniform in filters, works only if you render stage to renderTexture or you have a filter somewhere in parents. 

Sample DisplacementFilter takes everything from container and applies it as a displacement texture on backdrop.

[Displacement example](https://pixijs.github.io/examples/#/plugin-picture/displacement.js)

[Pixelate example](https://pixijs.github.io/examples/#/plugin-picture/pixelate.js)

## Compatibility

Compatible with PixiJS 5.3.2 and up. No guarantee for earlier versions!

For PixiJS `v4.1` and prior see `pixi-v4.1` branch

For PixiJS `v4.7` and prior see `pixi-v4.2` branch

For PixiJS `v4.9` and prior see `v4.x` branch , npm 1.3.2

## How to build

```bash
npm install
npm run build
```

