var glslify  = require('glslify');
var PictureShader = require('./PictureShader');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.extras
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
 */
function OverlayShader(gl, tilingMode)
{
    PictureShader.call(this,
        gl,
        glslify('./blend.vert'),
        glslify('./overlay.frag'),
        tilingMode
    );
    this.bind();
    this.uniforms.uSampler = [0, 1];
}

OverlayShader.prototype = Object.create(PictureShader.prototype);
OverlayShader.prototype.constructor = OverlayShader;
module.exports = OverlayShader;
