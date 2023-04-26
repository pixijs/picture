import { BlendFilter } from './BlendFilter';
import { BLEND_MODES } from 'pixi.js';

export const NPM_BLEND
    = `if (b_src.a == 0.0) {
  gl_FragColor = vec4(0, 0, 0, 0);
  return;
}
if (b_dest.a == 0.0) {
  gl_FragColor = b_src;
  return;
}
vec3 Cb = b_dest.rgb / b_dest.a;
vec3 Cs = b_src.rgb / b_src.a;
%NPM_BLEND%
// SWAP SRC WITH NPM BLEND
vec3 new_src = (1.0 - b_dest.a) * Cs + b_dest.a * B;
// PORTER DUFF PMA COMPOSITION MODE
b_res.a = b_src.a + b_dest.a * (1.0-b_src.a);
b_res.rgb = b_src.a * new_src + (1.0 - b_src.a) * b_dest.rgb;
`;

// reverse hardlight
export const OVERLAY_PART
    = `vec3 multiply = Cb * Cs * 2.0;
vec3 Cb2 = Cb * 2.0 - 1.0;
vec3 screen = Cb2 + Cs - Cb2 * Cs;
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

export const HARDLIGHT_PART
    = `vec3 multiply = Cb * Cs * 2.0;
vec3 Cs2 = Cs * 2.0 - 1.0;
vec3 screen = Cb + Cs2 - Cb * Cs2;
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

export const SOFTLIGHT_PART
    = `vec3 first = Cb - (1.0 - 2.0 * Cs) * Cb * (1.0 - Cb);
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

export const MULTIPLY_PART
    = `vec3 B = Cs * Cb;
`;
export const OVERLAY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, OVERLAY_PART);
export const HARDLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, HARDLIGHT_PART);
export const SOFTLIGHT_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, SOFTLIGHT_PART);
export const MULTIPLY_FULL = NPM_BLEND.replace(`%NPM_BLEND%`, MULTIPLY_PART);

/**
 * Maps {@link PIXI.BLEND_MODES blend modes} to {@link IBlendShaderParts.blendCode blend code}.
 *
 * This library provides blending code for {@link BLEND_MODES.MULTIPLY}, {@link BLEND_MODES.OVERLAY},
 * {@link BLEND_MODES.HARD_LIGHT}, {@link BLEND_MODES.SOFT_LIGHT}. If you add blend modes to the
 * {@link PIXI.BLEND_MODES} enumeration, you can implement them by augmenting this map with your shader
 * code.
 *
 * @type {object<string, string>}
 */
export const blendFullArray: Array<string> = [];

blendFullArray[BLEND_MODES.MULTIPLY] = MULTIPLY_FULL;
blendFullArray[BLEND_MODES.OVERLAY] = OVERLAY_FULL;
blendFullArray[BLEND_MODES.HARD_LIGHT] = HARDLIGHT_FULL;
blendFullArray[BLEND_MODES.SOFT_LIGHT] = SOFTLIGHT_FULL;

const filterCache: Array<BlendFilter> = [];
const filterCacheArray: Array<Array<BlendFilter>> = [];

/**
 * Get a memoized {@link BlendFilter} for the passed blend mode. This expects {@link blendFullArray}
 * to have the blending code beforehand.
 *
 * If you changed the blending code in {@link blendFullArray}, this won't create a new blend filter
 * due to memoization!
 *
 * @param blendMode - The blend mode desired.
 */
export function getBlendFilter(blendMode: BLEND_MODES)
{
    if (!blendFullArray[blendMode])
    {
        return null;
    }
    if (!filterCache[blendMode])
    {
        filterCache[blendMode] = new BlendFilter({ blendCode: blendFullArray[blendMode] });
    }

    return filterCache[blendMode];
}

/**
 * Similar to {@link getBlendFilter}, but wraps the filter in a memoized array.
 *
 * This is useful when assigning {@link PIXI.Container.filters} as a new array will not be created
 * per re-assigment.
 *
 * ```
 * import { getBlendFilter, getBlendFilterArray } from '@pixi/picture';
 *
 * // Don't do
 * displayObject.filters = [getBlendFilter(BLEND_MODES.OVERLAY)];
 *
 * // Do
 * displayObject.filters = getBlendFilterArray(BLEND_MODES.OVERLAY);
 * ```
 *
 * @param blendMode - The blend mode desired.
 */
export function getBlendFilterArray(blendMode: BLEND_MODES)
{
    if (!blendFullArray[blendMode])
    {
        return null;
    }
    if (!filterCacheArray[blendMode])
    {
        filterCacheArray[blendMode] = [getBlendFilter(blendMode)];
    }

    return filterCacheArray[blendMode];
}
