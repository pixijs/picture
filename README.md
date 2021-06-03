# @pixi/picture

Compatible with PixiJS `6.0.4` and up. No guarantee for earlier versions!

### Usage
```js
import * as PIXI from 'pixi.js';
import {Sprite, getBlendFilter} from '@pixi/picture';
// hacked sprite or tilingSprite
const sprite = new Sprite();
sprite.blendMode = PIXI.BLEND_MODES.OVERLAY;
// for other kind of elements
const graphics = new PIXI.Graphics();
graphics.filters = [getBlendFilter(PIXI.BLEND_MODES.OVERLAY)];
```

### Known bugs

* `renderer.render(stage, {transform})` produces wrong result if transform has scale

## Blend-modes emulated through filters

Allows to use blendModes that are not available in pure webgl implementation, such as `PIXI.BLEND_MODES.OVERLAY`.

Please, don't add children to sprite if you use those blendModes.

Use `import { Sprite } from '@pixi/picture'` instead of `PIXI.Sprite` (do not use `Sprite.from`). You can re-export it instead of pixi sprite if you use custom pixi build.

[Overlay example](https://pixijs.github.io/examples/#/plugin-picture/overlay.js)

Logic: if sprite has special blendMode, push corresponding filter `getBlendFilter(blendMode)`, if area is too small (<1px), dont draw at all.

If you want to use this with any components - just look in the source of Sprite how its done.

Assigning a filter to component directly `container.filters = [getBlendFilter(blendMode)]` should work too.

*To be fixed*: At the moment this implementation is a bit worse than v4, it uses extra pass for filter.

## Heavenly filter feature

Enables `backdropSampler` uniform in filters, works only if you render stage to renderTexture or you have a filter somewhere in parents.

Sample DisplacementFilter takes everything from container and applies it as a displacement texture on backdrop.

[Displacement example](https://pixijs.github.io/examples/#/plugin-picture/displacement.js)

[Pixelate example](https://pixijs.github.io/examples/#/plugin-picture/pixelate.js)

## Drawing from main framebuffer

Since version `3.0.1`, pixi-picture finally does not need filter above it. However, that comes with a problem: WebGL main framebuffer is flipped by Y.

You have to use `backdropSampler_flipY` uniform in your blend filters to transform Y coord in case renderTexture was flipped.

If specified `useContextAlpha: false` in renderer creation parameters, main framebuffer is RGB and not RGBA, its not possible to `copyTex` it, you will see corresponding warning message in the console.

When using `MaskFilter` with `maskBefore=true`, input is automatically flipped by Y. This operation is not needed if your base filter does not care about flipping Y, for example `BlurFilter` or `ColorMatrixFilter`.
In this case, you can specify `maskFilter.safeFlipY=true`, that will turn off extra flipping. 

## Vanilla JS, UMD build

All pixiJS v6 plugins has special `umd` build suited for vanilla.   
Navigate `pixi-picture` npm package, take `dist/pixi-picture.umd.js` file.

```html
<script src='lib/pixi.js'></script>
<script src='lib/pixi-picture.umd.js'></script>
```

```js
let sprite = new PIXI.picture.Sprite();
```

## Previous versions

For PixiJS `v5` and prior see README `pixi-v5` branch, or just use npm package `pixi-picture`

## How to build

```bash
pnpm install
pnpm run build
```

