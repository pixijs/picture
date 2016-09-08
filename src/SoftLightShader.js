var glslify  = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.tilemap
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function SoftLightShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        glslify('./blend.vert'),
        glslify('./soft_light.frag')
    );
    this.bind();
    this.uniforms.uSampler = [0, 1];
}

SoftLightShader.prototype = Object.create(PIXI.Shader.prototype);
SoftLightShader.prototype.constructor = SoftLightShader;
module.exports = SoftLightShader;
