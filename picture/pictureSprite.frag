varying vec2 vTextureCoord;
varying vec4 vColor;

uniform sampler2D uSampler;
uniform vec4 uTextureClamp;
uniform vec4 uColor;

void main(void)
{
    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);
   	vec4 sample = texture2D(uSampler, textureCoord);
   	gl_FragColor = sample * uColor;
}
