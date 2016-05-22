var glslify  = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.tilemap
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function OverlayShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        glslify('./blend.vert'),
        glslify('./overlay.frag')
    );
    this.bind();
    this.uniforms.uSampler = [0, 1];
}

OverlayShader.prototype = Object.create(PIXI.Shader.prototype);
OverlayShader.prototype.constructor = OverlayShader;
module.exports = OverlayShader;
