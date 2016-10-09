attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;
uniform mat3 mapMatrix;

varying vec2 vTextureCoord;
varying vec2 vMapCoord;
%SPRITE_UNIFORMS%

void main(void)
{
    %SPRITE_CODE%
    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;
}
