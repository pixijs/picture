var glslify  = require('glslify');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.extras
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 */
function PictureShader(gl)
{
    PIXI.Shader.call(this,
        gl,
        glslify('./picture.vert'),
        glslify('./picture.frag')
    );
    //do some stuff, like default values for shader
    //dont forget to bind it if you really are changing the uniforms
    this.bind();
    //default tint
    //Its an example, actually PictureRenderer takes care of this stuff
    this.uniforms.uColor = new Float32Array(1,1,1,1);
}

PictureShader.prototype = Object.create(PIXI.Shader.prototype);
PictureShader.prototype.constructor = PictureShader;
module.exports = PictureShader;
