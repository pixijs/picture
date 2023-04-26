import { Filter } from 'pixi.js';

type Dict<T> = {[key:string]: T};

const vert = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 flipY;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vTextureCoord.y = flipY.x + flipY.y * vTextureCoord.y;
}

`;

export class FlipYFilter extends Filter
{
    constructor(frag?: string, uniforms?: Dict<any>)
    {
        const uni = uniforms || {};

        if (!uni.flipY)
        {
            uni.flipY = new Float32Array([0.0, 1.0]);
        }
        super(vert, frag, uni);
    }
}
