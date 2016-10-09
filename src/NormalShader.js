var glslify  = require('glslify');
var PictureShader = require('./PictureShader');

/**
 * @class
 * @extends PIXI.Shader
 * @memberof PIXI.extras
 * @param gl {PIXI.Shader} The WebGL shader manager this shader works for.
 * @param tilingMode {number} 0 for default, 1 for simple tiling, 2 for tiling
 */
function NormalShader(gl, tilingMode)
{
    PictureShader.call(this,
        gl,
        glslify('./normal.vert'),
        glslify('./normal.frag'),
        tilingMode
    );
    //do some stuff, like default values for shader
    //dont forget to bind it if you really are changing the uniforms
    this.bind();
    //default tint
    //Its an example, actually PictureRenderer takes care of this stuff
    this.uniforms.uColor = new Float32Array(1,1,1,1);
}

NormalShader.prototype = Object.create(PictureShader.prototype);
NormalShader.prototype.constructor = NormalShader;
module.exports = NormalShader;
