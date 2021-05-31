import { BaseTexture } from '@pixi/core';
import { BLEND_MODES } from '@pixi/constants';
import { CLEAR_MODES } from '@pixi/constants';
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

export declare function getBlendFilter(blendMode: BLEND_MODES): BlendFilter;

export declare function getBlendFilterArray(blendMode: BLEND_MODES): BlendFilter[];

export declare const HARDLIGHT_FULL: string;

export declare const HARDLIGHT_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cs2 = Cs * 2.0 - 1.0;\nvec3 screen = Cb + Cs2 - Cb * Cs2;\nvec3 B;\nif (Cb.r <= 0.5) {\nB.r = multiply.r;\n} else {\nB.r = screen.r;\n}\nif (Cb.g <= 0.5) {\nB.g = multiply.g;\n} else {\nB.g = screen.g;\n}\nif (Cb.b <= 0.5) {\nB.b = multiply.b;\n} else {\nB.b = screen.b;\n}\n";

export declare interface IBlendShaderParts {
    uniformCode?: string;
    uniforms?: {
        [key: string]: any;
    };
    blendCode: string;
}

export declare interface IPictureFilterSystem extends FilterSystem {
    prepareBackdrop(sourceFrame: Rectangle): RenderTexture;
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
}

export declare class MaskFilter extends BlendFilter {
    baseFilter: Filter;
    config: MaskConfig;
    constructor(baseFilter: Filter, config?: MaskConfig);
    apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture, clearMode: CLEAR_MODES): void;
}

export declare const MULTIPLY_FULL = "if (dest.a > 0.0) {\nb_res.rgb = (dest.rgb / dest.a) * ((1.0 - src.a) + src.rgb);\nb_res.a = min(src.a + dest.a - src.a * dest.a, 1.0);\nb_res.rgb *= mult.a;\n}\n";

export declare const NPM_BLEND = "if (b_src.a == 0.0) {\ngl_FragColor = vec4(0, 0, 0, 0);\nreturn;\n}\nvec3 Cb = b_src.rgb / b_src.a, Cs;\nif (b_dest.a > 0.0) {\nCs = b_dest.rgb / b_dest.a;\n}\n%NPM_BLEND%\nb_res.a = b_src.a + b_dest.a * (1.0-b_src.a);\nb_res.rgb = (1.0 - b_src.a) * Cs + b_src.a * B;\nb_res.rgb *= b_res.a;\n";

export declare const OVERLAY_FULL: string;

export declare const OVERLAY_PART = "vec3 multiply = Cb * Cs * 2.0;\nvec3 Cb2 = Cb * 2.0 - 1.0;\nvec3 screen = Cb2 + Cs - Cb2 * Cs;\nvec3 B;\nif (Cs.r <= 0.5) {\nB.r = multiply.r;\n} else {\nB.r = screen.r;\n}\nif (Cs.g <= 0.5) {\nB.g = multiply.g;\n} else {\nB.g = screen.g;\n}\nif (Cs.b <= 0.5) {\nB.b = multiply.b;\n} else {\nB.b = screen.b;\n}\n";

export declare const SOFTLIGHT_FULL: string;

export declare const SOFTLIGHT_PART = "vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);\nvec3 B;\nvec3 D;\nif (Cs.r <= 0.5)\n{\nB.r = first.r;\n}\nelse\n{\nif (Cb.r <= 0.25)\n{\nD.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    \n}\nelse\n{\nD.r = sqrt(Cb.r);\n}\nB.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);\n}\nif (Cs.g <= 0.5)\n{\nB.g = first.g;\n}\nelse\n{\nif (Cb.g <= 0.25)\n{\nD.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    \n}\nelse\n{\nD.g = sqrt(Cb.g);\n}\nB.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);\n}\nif (Cs.b <= 0.5)\n{\nB.b = first.b;\n}\nelse\n{\nif (Cb.b <= 0.25)\n{\nD.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    \n}\nelse\n{\nD.b = sqrt(Cb.b);\n}\nB.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);\n}\n";

export declare class Sprite extends Sprite_2 {
    _render(renderer: Renderer): void;
}

export declare class TilingSprite extends TilingSprite_2 {
    _render(renderer: Renderer): void;
}

export { }
