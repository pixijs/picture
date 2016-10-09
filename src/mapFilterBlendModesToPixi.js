var CONST = PIXI,
    OverlayShader = require('./OverlayShader'),
    HardLightShader = require('./HardLightShader');

/**
 * Maps gl blend combinations to WebGL
 * @class
 * @memberof PIXI.extras
 */
function mapFilterBlendModesToPixi(gl, array)
{
    array = array || [];

    //TODO - premultiply alpha would be different.
    //add a boolean for that!
    array[CONST.BLEND_MODES.OVERLAY] = [new OverlayShader(gl, 0), new OverlayShader(gl, 1), new OverlayShader(gl, 2)];
    array[CONST.BLEND_MODES.HARD_LIGHT] = [new HardLightShader(gl, 0), new HardLightShader(gl, 1), new HardLightShader(gl, 2)];

    return array;
}

module.exports = mapFilterBlendModesToPixi;
