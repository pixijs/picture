var CONST = PIXI,
    OverlayShader = require('./OverlayShader'),
    HardLightShader = require('./HardLightShader');
    SoftLightShader = require('./SoftLightShader');

/**
 * Maps gl blend combinations to WebGL
 * @class
 * @memberof PIXI
 */
function mapFilterBlendModesToPixi(gl, array)
{
    array = array || [];

    //TODO - premultiply alpha would be different.
    //add a boolean for that!
    array[CONST.BLEND_MODES.OVERLAY] = new OverlayShader(gl);
    array[CONST.BLEND_MODES.HARD_LIGHT] = new HardLightShader(gl);
    array[CONST.BLEND_MODES.SOFT_LIGHT] = new SoftLightShader(gl);

    return array;
}

module.exports = mapFilterBlendModesToPixi;
