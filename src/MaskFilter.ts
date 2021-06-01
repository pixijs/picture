import {FilterSystem, RenderTexture, Filter} from '@pixi/core';
import {BLEND_MODES, CLEAR_MODES} from '@pixi/constants';
import {BlendFilter} from "./BlendFilter";
import {FlipYFilter} from "./FlipYFilter";

export enum MASK_CHANNEL {
	RED = 0,
	GREEN,
	BLUE,
	ALPHA
}

export class MaskConfig {
	constructor(public maskBefore = false, channel: MASK_CHANNEL = MASK_CHANNEL.ALPHA) {
		this.uniforms.uChannel[channel] = 1.0;
	}

	uniformCode = 'uniform vec4 uChannel;';
	uniforms: any = {
		uChannel: new Float32Array([0, 0, 0, 0]), // shared uniform for all those shaders? ok, just set it before apply
	};
	blendCode = `b_res = dot(b_src, uChannel) * b_dest;`;
	safeFlipY = false;
}

const tmpArray = new Float32Array([0, 1]);

export class MaskFilter extends BlendFilter {
	constructor(public baseFilter: Filter, public config = new MaskConfig()) {
		super(config);
		this.padding = baseFilter.padding;
		this.safeFlipY = config.safeFlipY;
	}

	static _flipYFilter: FlipYFilter = null;
	/**
	 * if base filter is not sensitive to flipping Y axis, you can turn this ON and save a temporary texture bind / drawcall
	 */
	safeFlipY: boolean;

	apply(filterManager: FilterSystem, input: RenderTexture, output: RenderTexture,
	      clearMode: CLEAR_MODES) {
		const target = filterManager.getFilterTexture(input);
		if (this.config.maskBefore) {
			const {blendMode} = this.state;
			this.state.blendMode = BLEND_MODES.NONE;
			filterManager.applyFilter(this, input, target, CLEAR_MODES.YES);
			this.baseFilter.blendMode = blendMode;
			this.baseFilter.apply(filterManager, target, output, clearMode);
			this.state.blendMode = blendMode;
		} else {
			const {uBackdrop, uBackdrop_flipY} = this.uniforms;

			if (uBackdrop_flipY[1] > 0 || this.safeFlipY) {
				this.baseFilter.apply(filterManager, uBackdrop, target, CLEAR_MODES.YES);
			} else {
				// in case there was a flip and base filter is not flipY-safe, we have to use extra flip operation
				const targetFlip = filterManager.getFilterTexture(input);
				if (!MaskFilter._flipYFilter) {
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
