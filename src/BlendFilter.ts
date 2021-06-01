import {Filter} from '@pixi/core';

export class BackdropFilter extends Filter {
    backdropUniformName: string = null;
    _backdropActive: boolean = false;
    clearColor: Float32Array = null;
}

export interface IBlendShaderParts {
    uniformCode?: string;
    uniforms?: { [key: string]: any };
    blendCode: string;
}

const filterFrag = `
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uBackdrop;
uniform vec2 uBackdrop_flipY;

%UNIFORM_CODE%

void main(void)
{
   vec2 backdropCoord = vec2(vTextureCoord.x, uBackdrop_flipY.x + uBackdrop_flipY.y * vTextureCoord.y);
   vec4 b_src = texture2D(uSampler, vTextureCoord);
   vec4 b_dest = texture2D(uBackdrop, backdropCoord);
   vec4 b_res = b_dest;
   
   %BLEND_CODE%

   gl_FragColor = b_res;
}`;

export class BlendFilter extends BackdropFilter {
    constructor(shaderParts: IBlendShaderParts) {
        let fragCode = filterFrag;
        fragCode = fragCode.replace('%UNIFORM_CODE%', shaderParts.uniformCode || "");
        fragCode = fragCode.replace('%BLEND_CODE%', shaderParts.blendCode || "");

        super(undefined, fragCode, shaderParts.uniforms);

        this.backdropUniformName = 'uBackdrop';
    }
}
