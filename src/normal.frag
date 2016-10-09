varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec4 uColor;
%SPRITE_UNIFORMS%

void main(void)
{
    %SPRITE_CODE%

    vec4 sample = texture2D(uSampler, textureCoord);
    gl_FragColor = sample * uColor;
}
