attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;
%SPRITE_UNIFORMS%

void main(void)
{
    %SPRITE_CODE%
}
