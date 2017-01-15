

module PIXI.extras {

    var normalFrag = `
varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler[2];
uniform vec4 uColor;
%SPRITE_UNIFORMS%

void main(void)
{
    %SPRITE_CODE%

    vec4 sample = texture2D(uSampler[0], textureCoord);
    gl_FragColor = sample * uColor;
}
`;

    var normalVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
%SPRITE_UNIFORMS%

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    %SPRITE_CODE%
}
`;

    export class NormalShader extends PictureShader {
        /**
         * @class
         * @extends PIXI.Shader
         * @memberof PIXI.extras
         * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
         * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
         */
        constructor(gl: WebGLRenderingContext, tilingMode: number) {
            super(gl, normalVert, normalFrag, tilingMode);
        }
    }
}
