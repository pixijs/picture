varying vec2 vTextureCoord;
varying vec2 vMapCoord;
varying vec4 vColor;

uniform sampler2D uSampler[2];
uniform vec4 uTextureClamp;
uniform vec4 uColor;

void main(void)
{
    vec2 textureCoord = clamp(vTextureCoord, uTextureClamp.xy, uTextureClamp.zw);
    vec4 source = texture2D(uSampler[0], textureCoord);
    vec4 target = texture2D(uSampler[1], vMapCoord);

    vec3 multiply = Cb * Cs * 2.0 + Cs * Cs * (1.0 - 2.0 * Cb);
    vec3 screen = sqrt(base) * (2.0 * blend - 1.0) + 2.0 * base * (1.0 - blend);
    vec3 B;

    if (Cb.r <= 0.5) {
        B.r = multiply.r;
    } else {
        B.r = screen.r;
    }
    if (Cb.g <= 0.5) {
        B.g = multiply.g;
    } else {
        B.g = screen.g;
    }
    if (Cb.b <= 0.5) {
        B.b = multiply.b;
    } else {
        B.b = screen.b;
    }

    vec4 res;

    res.xyz = (1.0 - source.a) * Cs + source.a * B;
    res.a = source.a + target.a * (1.0-source.a);
    gl_FragColor = vec4(res.xyz * res.a, res.a);
}
