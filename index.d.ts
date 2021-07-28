import { BaseTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { CLEAR_MODES } from '@pixi/constants';
import type { Dict } from '@pixi/utils';
import { DisplayObject } from '@pixi/display';
import { Filter } from '@pixi/core';
import { FilterSystem } from '@pixi/core';
import { Rectangle } from '@pixi/math';
import { Renderer } from '@pixi/core';
import { RenderTexture } from '@pixi/core';
import { Sprite as Sprite_2 } from '@pixi/sprite';
import { TextureSystem } from '@pixi/core';
import { TilingSprite as TilingSprite_2 } from '@pixi/sprite-tiling';

export declare function applyMixins(): void;

export declare class BackdropFilter extends Filter {
    backdropUniformName: string;
    _backdropActive: boolean;
    clearColor: Float32Array;
}

export declare class BlendFilter extends BackdropFilter {
    constructor(shaderParts: IBlendShaderParts);
}

export declare const blendFullArray: Array<string>;

export declare class FlipYFilter extends Filter {
    constructor(frag?: string, uniforms?: Dict<any>);
}

export declare function getBlendFilter(blendMode: BLEND_MODES): BlendFilter;

export declare function getBlendFilterArray(blendMode: BLEND_MODES): BlendFilter[];

export declare const HARDLIGHT_FULL: string;

export declare const HARDLIGHT_PART: string;

export declare interface IBlendShaderParts {
    uniformCode?: string;
    uniforms?: {
        [key: string]: any;
    };
    blendCode: string;
}

export declare interface IPictureFilterSystem extends FilterSystem {
    prepareBackdrop(sourceFrame: Rectangle, flipY: Float32Array): RenderTexture;
    pushWithCheck(target: DisplayObject, filters: Array<Filter>, checkEmptyBounds?: boolean): boolean;
}

export declare interface IPictureTextureSystem extends TextureSystem {
    bindForceLocation(texture: BaseTexture, location: number): void;
}

export declare enum MASK_CHANNEL {
    RED = 0,
    GREEN = 1,
    BLUE = 2,
    ALPHA = 3
}

export declare class MaskConfig {
    maskBefore: boolean;
    constructor(maskBefore?: boolean, channel?: MASK_CHANNEL);
    uniformCode: string;
    uniforms: any;
    blendCode: string;
    safeFlipY: boolean;
}

export declare class MaskFilter extends BlendFilter {
    baseFilter: Filter;
    config: MaskConfig;
    constructor(baseFilter: Filter, config?: MaskConfig);
    static _flipYFilter: FlipYFilter;
    safeFlipY: boolean;
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
}

export declare const MULTIPLY_FULL: string;

export declare const MULTIPLY_PART: string;

export declare const NPM_BLEND: string;

export declare const OVERLAY_FULL: string;

export declare const OVERLAY_PART: string;

export declare const SOFTLIGHT_FULL: string;

export declare const SOFTLIGHT_PART: string;

export declare class Sprite extends Sprite_2 {
    _render(renderer: Renderer): void;
}

export declare class TilingSprite extends TilingSprite_2 {
    _render(renderer: Renderer): void;
}

export { }
