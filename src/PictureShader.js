/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.extras
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 * @param vert {string}
 * @param frag {string}
 * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
 */
function PictureShader(gl, vert, frag, tilingMode) {
    var lib = shaderLib[tilingMode];
    PIXI.Shader.call(this,
        gl,
        vert.replace(/%SPRITE_UNIFORMS%/gi, lib.vertUniforms)
            .replace(/%SPRITE_CODE%/gi, lib.vertCode),
        frag.replace(/%SPRITE_UNIFORMS%/gi, lib.fragUniforms)
            .replace(/%SPRITE_CODE%/gi, lib.fragCode)
    );

    this.tilingMode = tilingMode;
}


var shaderLib = [
    {
        //DOES NOT HAVE translationMatrix
        vertUniforms: "",
        vertCode: "gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);" + "\nvTextureCoord = aTextureCoord;",
        fragUniforms: "uniform vec4 uTextureClamp;",
        fragCode: "vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);"
    },
    {
        //DOES HAVE translationMatrix
        vertUniforms: "uniform mat3 translationMatrix;" + "\nuniform mat3 uTransform;",
        vertCode: "gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);" +
        "\nvTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
        fragUniforms: "",
        fragCode: "vec2 textureCoord = vTextureCoord;"
    },
    {
        //DOES HAVE translationMatrix
        vertUniforms: "uniform mat3 translationMatrix;" + "\nuniform mat3 uTransform;",
        vertCode: "gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);" +
        "\nvTextureCoord = (uTransform * vec3(aTextureCoord, 1.0)).xy;",
        fragUniforms: "uniform mat3 uMapCoord;\nuniform vec4 uClampFrame;\nuniform vec2 uClampOffset;",
        fragCode: "vec2 textureCoord = mod(vTextureCoord - uClampOffset, vec2(1.0, 1.0)) + uClampOffset;" +
        "\ntextureCoord = (uMapCoord * vec3(textureCoord, 1.0)).xy;" +
        "\ntextureCoord = clamp(textureCoord, uClampFrame.xy, uClampFrame.zw);"
    }
];

PictureShader.prototype = Object.create(PIXI.Shader.prototype);
PictureShader.prototype.constructor = PictureShader;
module.exports = PictureShader;
