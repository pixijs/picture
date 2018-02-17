/// <reference types="pixi.js" />
declare module pixi_picture {
    class PictureShader extends PIXI.Shader {
        tempQuad: PIXI.Quad;
        tilingMode: number;
        static blendVert: string;
        constructor(gl: WebGLRenderingContext, vert: string, frag: string, tilingMode: number);
    }
}
declare module pixi_picture {
    class HardLightShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module pixi_picture {
    function mapFilterBlendModesToPixi(gl: WebGLRenderingContext, array?: Array<Array<PictureShader>>): Array<Array<PictureShader>>;
}
declare module pixi_picture {
    class NormalShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module pixi_picture {
    class OverlayShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number);
    }
}
declare module pixi_picture {
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
        render(sprite: PIXI.Sprite): void;
        _renderNormal(sprite: PIXI.Sprite, shader: PictureShader): void;
        _renderBlend(sprite: PIXI.Sprite, shader: PictureShader): void;
        _renderInner(sprite: PIXI.Sprite, shader: PictureShader): void;
        _renderWithShader(ts: PIXI.extras.TilingSprite, isSimple: boolean, shader: PictureShader): void;
        _renderSprite(sprite: PIXI.Sprite, shader: PictureShader): void;
        _isSimpleSprite(ts: PIXI.Sprite): boolean;
    }
}
declare module pixi_picture {
    class PictureSprite extends PIXI.Sprite {
        constructor(texture: PIXI.Texture);
    }
}
declare module pixi_picture {
    class PictureTilingSprite extends PIXI.extras.TilingSprite {
        constructor(texture: PIXI.Texture);
    }
}
