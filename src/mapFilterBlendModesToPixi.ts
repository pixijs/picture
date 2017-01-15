module PIXI.extras {
    export function mapFilterBlendModesToPixi(gl: WebGLRenderingContext, array: Array<Array<PictureShader>> = []): Array<Array<PictureShader>>
    {
        //TODO - premultiply alpha would be different.
        //add a boolean for that!
        array[PIXI.BLEND_MODES.OVERLAY] = [new OverlayShader(gl, 0), new OverlayShader(gl, 1), new OverlayShader(gl, 2)];
        array[PIXI.BLEND_MODES.HARD_LIGHT] = [new HardLightShader(gl, 0), new HardLightShader(gl, 1), new HardLightShader(gl, 2)];

        return array;
    }
}
