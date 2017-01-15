module PIXI.extras {
    var overlayFrag = `
varying vec2 vTextureCoord;
varying vec2 vMapCoord;
varying vec4 vColor;

uniform sampler2D uSampler[2];
uniform vec4 uColor;
%SPRITE_UNIFORMS%

void main(void)
{
    %SPRITE_CODE%
    vec4 source = texture2D(uSampler[0], textureCoord) * uColor;
    vec4 target = texture2D(uSampler[1], vMapCoord);

    //reverse hardlight
    if (source.a == 0.0) {
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }
    //yeah, premultiplied
    vec3 Cb = source.rgb/source.a, Cs;
    if (target.a > 0.0) {
        Cs = target.rgb / target.a;
    }
    vec3 multiply = Cb * Cs * 2.0;
    vec3 Cb2 = Cb * 2.0 - 1.0;
    vec3 screen = Cb2 + Cs - Cb2 * Cs;
    vec3 B;
    if (Cs.r <= 0.5) {
        B.r = multiply.r;
    } else {
        B.r = screen.r;
    }
    if (Cs.g <= 0.5) {
        B.g = multiply.g;
    } else {
        B.g = screen.g;
    }
    if (Cs.b <= 0.5) {
        B.b = multiply.b;
    } else {
        B.b = screen.b;
    }
    vec4 res;
    res.xyz = (1.0 - source.a) * Cs + source.a * B;
    res.a = source.a + target.a * (1.0-source.a);
    gl_FragColor = vec4(res.xyz * res.a, res.a);
}
`;

    /**
     * @class
     * @extends PIXI.Shader
     * @memberof PIXI.extras
     * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
     * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
     */
    export class OverlayShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number) {
            super(gl, PictureShader.blendVert, overlayFrag, tilingMode);
        }
    }
}
