import { FilterSystem, RenderTexture, Filter } from '@pixi/core';
import { BLEND_MODES, CLEAR_MODES } from '@pixi/constants';
import { BlendFilter } from './BlendFilter';
import { FlipYFilter } from './FlipYFilter';

/**
 * The RGBA channel for {@link MaskFilter} to use to detect the mask region.
 *
 * When applying a {@link MaskFilter} to a mask {@link DisplayObject}, the object should render
 * into that channel. For example, if using the alpha channel - the mask should render with alpha
 * 1.0 where-ever the mask region is.
 *
 * @property {number} RED
 * @property {number} GREEN
 * @property {number} BLUE
 * @property {number} ALPHA
 */
export enum MASK_CHANNEL {
	RED = 0,
	GREEN,
	BLUE,
	ALPHA
}

/** The mask configuration for {@link MaskFilter}. */
export class MaskConfig
{
	/**
	 * @param maskBefore - If true, {@link MaskFilter} will mask the input of the applied filter instead of
	 * 	the output. In the case of a blur filter, this would cause cause the boundaries of the mask to soften
	 * 	as the blur would apply to the masked region instead of being clipped into it.
	 * @param channel - The mask channel indicating which pixels are in the mask region.
	 */
    constructor(public maskBefore = false, channel: MASK_CHANNEL = MASK_CHANNEL.ALPHA)
    {
        this.uniforms.uChannel[channel] = 1.0;
    }

	/** @ignore */
	uniformCode = 'uniform vec4 uChannel;';
	/** @ignore */
	uniforms: any = {
	    uChannel: new Float32Array([0, 0, 0, 0]), // shared uniform for all those shaders? ok, just set it before apply
	};
	/** @ignore */
	blendCode = `b_res = dot(b_src, uChannel) * b_dest;`;

	/**
	 * Flag that indicates the applied filter is Y-symmetric.
	 *
	 * {@link MaskFilter} will optimize rendering by not flipping the screen backdrop before passing it to the
	 * blend filter for Y-symmetric filters.
	 *
	 * A filter is Y-symmetric if giving it an inverted input and then inverting the output is equivalent
	 * to giving it an upright input.
	 */
	safeFlipY = false;
}

const tmpArray = new Float32Array([0, 1]);

/**
 * A higher-order filter that applies the output of a filter to a masked region of the destination framebuffer.
 *
 * The masked region is defined by where-ever the target {@link DisplayObject} renders to in the world. For
 * example, if you draw a rectangle in the world and apply a masked-blur filter, the blur filter will apply
 * to pixels in the backdrop within the rectangle. The {@link DisplayObject} must render by drawing
 * a solid RGBA channel (see {@link MaskConfig}'s constructor).
 */
export class MaskFilter extends BlendFilter
{
	/**
	 * @param baseFilter - The filter being applied.
	 * @param config - The configuration for the mask.
	 */
    constructor(public baseFilter: Filter, public config = new MaskConfig())
    {
        super(config);
        this.padding = baseFilter.padding;
        this.safeFlipY = config.safeFlipY;
    }

	/** @ignore */
	static _flipYFilter: FlipYFilter = null;

	/**
	 * if base filter is not sensitive to flipping Y axis, you can turn this ON and save a temporary texture bind / drawcall
	 */
	safeFlipY: boolean;

	apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture,
	      clearMode: CLEAR_MODES): void
	{
	    const target = filterManager.getFilterTexture(input);

	    if (this.config.maskBefore)
	    {
	        const { blendMode } = this.state;

	        this.state.blendMode = BLEND_MODES.NONE;
	        filterManager.applyFilter(this, input, target, CLEAR_MODES.YES);
	        this.baseFilter.blendMode = blendMode;
	        this.baseFilter.apply(filterManager, target, output, clearMode);
	        this.state.blendMode = blendMode;
	    }
	    else
	    {
	        const { uBackdrop, uBackdrop_flipY } = this.uniforms;

	        if (uBackdrop_flipY[1] > 0 || this.safeFlipY)
	        {
	            this.baseFilter.apply(filterManager, uBackdrop, target, CLEAR_MODES.YES);
	        }
	        else
	        {
	            // in case there was a flip and base filter is not flipY-safe, we have to use extra flip operation
	            const targetFlip = filterManager.getFilterTexture(input);

	            if (!MaskFilter._flipYFilter)
	            {
	                MaskFilter._flipYFilter = new FlipYFilter();
	            }
	            MaskFilter._flipYFilter.uniforms.flipY[0] = uBackdrop_flipY[0];
	            MaskFilter._flipYFilter.uniforms.flipY[1] = uBackdrop_flipY[1];
	            MaskFilter._flipYFilter.apply(filterManager, uBackdrop, targetFlip, CLEAR_MODES.YES);
	            this.baseFilter.apply(filterManager, targetFlip, target, CLEAR_MODES.YES);
	            filterManager.returnFilterTexture(targetFlip);
	            this.uniforms.uBackdrop_flipY = tmpArray;
	        }
	        this.uniforms.uBackdrop = target;
	        filterManager.applyFilter(this, input, output, clearMode);
	        this.uniforms.uBackdrop = uBackdrop;
	        this.uniforms.uBackdrop_flipY = uBackdrop_flipY;
	    }
	    filterManager.returnFilterTexture(target);
	}
}
