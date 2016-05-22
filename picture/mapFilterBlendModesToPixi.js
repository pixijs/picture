var CONST = PIXI;

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
    array[CONST.BLEND_MODES.OVERLAY] = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];

    return array;
}

module.exports = mapFilterBlendModesToPixi;
