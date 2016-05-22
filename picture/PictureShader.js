var glslify  = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.tilemap
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function PictureShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        glslify('./pictureSprite.vert'),
        glslify('./pictureSprite.frag')
    );
}

PictureShader.prototype = Object.create(PIXI.Shader.prototype);
PictureShader.prototype.constructor = PictureShader;
module.exports = PictureShader;
