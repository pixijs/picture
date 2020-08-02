namespace pixi_picture {
    export namespace blends {
        export const NPM_BLEND =
            `if (b_src.a == 0.0) {
    gl_FragColor = vec4(0, 0, 0, 0);
    return;
}
vec3 Cb = b_src.rgb / b_src.a, Cs;
if (b_dest.a > 0.0) {
    Cs = b_dest.rgb / b_dest.a;
}
%NPM_BLEND%
b_res.a = b_src.a + b_dest.a * (1.0-b_src.a);
b_res.rgb = (1.0 - b_src.a) * Cs + b_src.a * B;
b_res.rgb *= b_res.a;
`;

        //reverse hardlight
        export const OVERLAY_PART =
            `vec3 multiply = Cb * Cs * 2.0;
vec3 Cb2 = Cb * 2.0 - 1.0;
vec3 screen = Cb2 + Cs - Cb2 * Cs;
vec3 B;
if (Cs.r <= 0.5) {
    B.r = multiply.r;
} else {
    B.r = screen.r;
}
if (Cs.g <= 0.5) {
    B.g = multiply.g;
} else {
    B.g = screen.g;
}
if (Cs.b <= 0.5) {
    B.b = multiply.b;
} else {
    B.b = screen.b;
}
`;

        export const HARDLIGHT_PART =
            `vec3 multiply = Cb * Cs * 2.0;
vec3 Cs2 = Cs * 2.0 - 1.0;
vec3 screen = Cb + Cs2 - Cb * Cs2;
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
`;

        export const SOFTLIGHT_PART =
            `vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);
vec3 B;
vec3 D;
if (Cs.r <= 0.5)
{
    B.r = first.r;
}
else
{
    if (Cb.r <= 0.25)
    {
        D.r = ((16.0 * Cb.r - 12.0) * Cb.r + 4.0) * Cb.r;    
    }
    else
    {
        D.r = sqrt(Cb.r);
    }
    B.r = Cb.r + (2.0 * Cs.r - 1.0) * (D.r - Cb.r);
}
if (Cs.g <= 0.5)
{
    B.g = first.g;
}
else
{
    if (Cb.g <= 0.25)
    {
        D.g = ((16.0 * Cb.g - 12.0) * Cb.g + 4.0) * Cb.g;    
    }
    else
    {
        D.g = sqrt(Cb.g);
    }
    B.g = Cb.g + (2.0 * Cs.g - 1.0) * (D.g - Cb.g);
}
if (Cs.b <= 0.5)
{
    B.b = first.b;
}
else
{
    if (Cb.b <= 0.25)
    {
        D.b = ((16.0 * Cb.b - 12.0) * Cb.b + 4.0) * Cb.b;    
    }
    else
    {
        D.b = sqrt(Cb.b);
    }
    B.b = Cb.b + (2.0 * Cs.b - 1.0) * (D.b - Cb.b);
}
`;

        export const MULTIPLY_FULL =
            `if (dest.a > 0.0) {
   b_res.rgb = (dest.rgb / dest.a) * ((1.0 - src.a) + src.rgb);
   b_res.a = min(src.a + dest.a - src.a * dest.a, 1.0);
   b_res.rgb *= mult.a;
}
`;
        export const OVERLAY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, OVERLAY_PART);
        export const HARDLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, HARDLIGHT_PART);
        export const SOFTLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, SOFTLIGHT_PART);

        export const blendFullArray: Array<string> = [];

        blendFullArray[PIXI.BLEND_MODES.MULTIPLY] = MULTIPLY_FULL;
        blendFullArray[PIXI.BLEND_MODES.OVERLAY] = OVERLAY_FULL;
        blendFullArray[PIXI.BLEND_MODES.HARD_LIGHT] = HARDLIGHT_FULL;
        blendFullArray[PIXI.BLEND_MODES.SOFT_LIGHT] = SOFTLIGHT_FULL;
    }

    let filterCache: Array<BlendFilter> = [];
    let filterCacheArray: Array<Array<BlendFilter>> = [];

    export function getBlendFilter(blendMode: PIXI.BLEND_MODES) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCache[blendMode]) {
            filterCache[blendMode] = new BlendFilter({blendCode: blends.blendFullArray[blendMode]});
        }
        return filterCache[blendMode];
    }

    export function getBlendFilterArray(blendMode: PIXI.BLEND_MODES) {
        if (!blends.blendFullArray[blendMode]) {
            return null;
        }
        if (!filterCacheArray[blendMode]) {
            filterCacheArray[blendMode] = [this.getBlendFilter(blendMode)];
        }
        return filterCacheArray[blendMode];
    }
}