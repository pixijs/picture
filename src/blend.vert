attribute vec2 aVertexPosition;
attribute vec2 aTextureCoord;
attribute vec4 aColor;

uniform mat3 projectionMatrix;
uniform mat3 mapMatrix;

varying vec2 vTextureCoord;
varying vec2 vMapCoord;

void main(void)
{
    gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
    vMapCoord = (mapMatrix * vec3(aVertexPosition, 1.0)).xy;
    vTextureCoord = aTextureCoord;
}
