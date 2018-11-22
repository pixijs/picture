/// <reference types="pixi.js" />
declare module PIXI.picture {
    function filterManagerMixin(fm: PIXI.FilterManager): void;
    class BackdropFilter<T> extends PIXI.Filter<T> {
        backdropUniformName: string;
        _backdropRenderTarget: PIXI.RenderTarget;
        clearColor: Float32Array;
        uniformData: PIXI.UniformDataMap<T>;
    }
}
declare module PIXI.picture {
    class HardLightShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module PIXI.picture {
    function mapFilterBlendModesToPixi(gl: WebGLRenderingContext, array?: Array<Array<PictureShader>>): Array<Array<PictureShader>>;
}
declare module PIXI.picture {
    class NormalShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module PIXI.picture {
    class OverlayShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module PIXI.picture {
    import Sprite = PIXI.Sprite;
    import TilingSprite = PIXI.extras.TilingSprite;
    class PictureRenderer extends PIXI.ObjectRenderer {
        constructor(renderer: PIXI.WebGLRenderer);
        drawModes: Array<Array<PictureShader>>;
        normalShader: Array<PictureShader>;
        _tempClamp: Float32Array;
        _tempColor: Float32Array;
        _tempRect: PIXI.Rectangle;
        _tempRect2: PIXI.Rectangle;
        _tempRect3: PIXI.Rectangle;
        _tempMatrix: PIXI.Matrix;
        _tempMatrix2: PIXI.Matrix;
        _bigBuf: Uint8Array;
        _renderTexture: PIXI.BaseRenderTexture;
        onContextChange(): void;
        start(): void;
        flush(): void;
        _getRenderTexture(minWidth: number, minHeight: number): PIXI.BaseRenderTexture;
        _getBuf(size: number): Float32Array;
        render(sprite: Sprite): void;
        _renderNormal(sprite: Sprite, shader: PictureShader): void;
        _renderBlend(sprite: Sprite, shader: PictureShader): void;
        _renderInner(sprite: Sprite, shader: PictureShader): void;
        _renderWithShader(ts: TilingSprite, isSimple: boolean, shader: PictureShader): void;
        _renderSprite(sprite: Sprite, shader: PictureShader): void;
        _isSimpleSprite(ts: Sprite): boolean;
    }
}
declare module PIXI.picture {
    class PictureShader extends PIXI.Shader {
        tempQuad: PIXI.Quad;
        tilingMode: number;
        static blendVert: string;
        constructor(gl: WebGLRenderingContext, vert: string, frag: string, tilingMode: number);
    }
}
declare module PIXI.picture {
    class SoftLightShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module PIXI.picture {
    class Sprite extends PIXI.Sprite {
        constructor(texture: PIXI.Texture);
    }
}
declare module PIXI.picture {
    class TilingSprite extends PIXI.extras.TilingSprite {
        constructor(texture: PIXI.Texture);
    }
}
declare module PIXI.picture {
}
