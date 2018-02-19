namespace pixi_picture {
    const softLightFrag = `
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

    if (source.a == 0.0) {
        gl_FragColor = vec4(0, 0, 0, 0);
        return;
    }
    vec3 Cb = source.rgb/source.a, Cs;
    if (target.a > 0.0) {
        Cs = target.rgb / target.a;
    }
    
    vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);

    vec3 B;
    vec3 D;
    if (Cs.r <= 0.5)
    {
        B.r = first.r;
    }
    else
    {
        if (Cb.r <= 0.25)
        {
            D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    
        }
        else
        {
            D.r = sqrt(Cb.r);
        }
        B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);
    }
    if (Cs.g <= 0.5)
    {
        B.g = first.g;
    }
    else
    {
        if (Cb.g <= 0.25)
        {
            D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    
        }
        else
        {
            D.g = sqrt(Cb.g);
        }
        B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);
    }
    if (Cs.b <= 0.5)
    {
        B.b = first.b;
    }
    else
    {
        if (Cb.b <= 0.25)
        {
            D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    
        }
        else
        {
            D.b = sqrt(Cb.b);
        }
        B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);
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
    export class SoftLightShader extends PictureShader {
        constructor(gl: WebGLRenderingContext, tilingMode: number) {
            super(gl, PictureShader.blendVert, softLightFrag, tilingMode);
        }
    }
}
