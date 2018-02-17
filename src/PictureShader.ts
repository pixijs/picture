module pixi_picture {
    interface InnerLib {
        vertUniforms: string,
        vertCode: string,
        fragUniforms: string,
        fragCode: string
    }

    var shaderLib: InnerLib[] = [
        {
            vertUniforms: "",
            vertCode: "vTextureCoord = aTextureCoord;",
            fragUniforms: "uniform vec4 uTextureClamp;",
            fragCode: "vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);"
        },
        {
            //DOES HAVE translationMatrix
            vertUniforms: "uniform mat3 uTransform;",
            vertCode: "vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
            fragUniforms: "",
            fragCode: "vec2 textureCoord = vTextureCoord;"
        },
        {
            //DOES HAVE translationMatrix
            vertUniforms: "uniform mat3 uTransform;",
            vertCode: "vTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
            fragUniforms: "uniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;",
            fragCode: "vec2 textureCoord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;" +
            "\ntextureCoord = (uMapCoord * vec3(textureCoord, 1.0)).xy;" +
            "\ntextureCoord = clamp(textureCoord, uClampFrame.xy, uClampFrame.zw);"
        }
    ];

    export class PictureShader extends PIXI.Shader {

        tempQuad: PIXI.Quad;
        tilingMode: number;

        static blendVert = `
attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;
uniform mat3 mapMatrix;

varying vec2 vTextureCoord;
varying vec2 vMapCoord;
%SPRITE_UNIFORMS%

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    %SPRITE_CODE%
    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;
}
`;

        /**
         * @class
         * @extends PIXI.Shader
         * @memberof PIXI.extras
         * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
         * @param vert {string}
         * @param frag {string}
         * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
         */
        constructor(gl: WebGLRenderingContext, vert: string, frag: string, tilingMode: number) {
            var lib = shaderLib[tilingMode];
            super(gl,
                vert.replace(/%SPRITE_UNIFORMS%/gi, lib.vertUniforms)
                    .replace(/%SPRITE_CODE%/gi, lib.vertCode),
                frag.replace(/%SPRITE_UNIFORMS%/gi, lib.fragUniforms)
                    .replace(/%SPRITE_CODE%/gi, lib.fragCode));

            this.bind()
            this.tilingMode = tilingMode;
            this.tempQuad = new PIXI.Quad(gl);
            this.tempQuad.initVao(this);

            this.uniforms.uColor = new Float32Array([1,1,1,1]);
            this.uniforms.uSampler = [0, 1];
        }
    }
}
