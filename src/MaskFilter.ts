import {FilterSystem, RenderTexture, Filter} from '@pixi/core';
import {BLEND_MODES, CLEAR_MODES} from '@pixi/constants';
import {BlendFilter} from "./BlendFilter";

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
}

export class MaskFilter extends BlendFilter {
    constructor(public baseFilter: Filter, public config = new MaskConfig()) {
        super(config);
        this.padding = baseFilter.padding;
    }

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
            const {uBackdrop} = this.uniforms;
            this.baseFilter.apply(filterManager, uBackdrop, target, CLEAR_MODES.YES);
            this.uniforms.uBackdrop = target;
            filterManager.applyFilter(this, input, output, clearMode);
            this.uniforms.uBackdrop = uBackdrop;
        }
        filterManager.returnFilterTexture(target);
    }
}
