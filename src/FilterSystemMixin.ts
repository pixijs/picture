declare namespace PIXI {
    declare namespace systems {
        interface FilterSystem {
            prepareBackdrop(sourceFrame: PIXI.Rectangle): PIXI.RenderTexture;
        }
    }
}

namespace pixi_picture {
    function containsRect(rectOut: PIXI.Rectangle, rectIn: PIXI.Rectangle): boolean {
        let r1 = rectIn.x + rectIn.width;
        let b1 = rectIn.y + rectIn.height;
        let r2 = rectOut.x + rectOut.width;
        let b2 = rectOut.y + rectOut.height;
        return (rectIn.x >= rectOut.x) &&
            (rectIn.x <= r2) &&
            (rectIn.y >= rectOut.y) &&
            (rectIn.y <= b2) &&
            (r1 >= rectOut.x) &&
            (r1 <= r2) &&
            (b1 >= rectOut.y) &&
            (b1 <= b2);
    }

    function push(this: PIXI.systems.FilterSystem,
                  target: PIXI.DisplayObject, filters: Array<BackdropFilter>) {
        const renderer = this.renderer;
        const filterStack = this.defaultFilterStack;
        const state = this.statePool.pop() || new FilterState();

        let resolution = filters[0].resolution;
        let padding = filters[0].padding;
        let autoFit = filters[0].autoFit;
        let legacy = filters[0].legacy;

        for (let i = 1; i < filters.length; i++) {
            const filter = filters[i];

            // lets use the lowest resolution..
            resolution = Math.min(resolution, filter.resolution);
            // figure out the padding required for filters
            padding = this.useMaxPadding
                // old behavior: use largest amount of padding!
                ? Math.max(padding, filter.padding)
                // new behavior: sum the padding
                : padding + filter.padding;
            // only auto fit if all filters are autofit
            autoFit = autoFit || filter.autoFit;

            legacy = legacy || filter.legacy;
        }

        if (filterStack.length === 1) {
            this.defaultFilterStack[0].renderTexture = renderer.renderTexture.current;
        }

        filterStack.push(state);

        state.resolution = resolution;

        state.legacy = legacy;

        state.target = target;

        state.sourceFrame.copyFrom(target.filterArea || target.getBounds(true));

        state.sourceFrame.pad(padding);
        if (autoFit) {
            state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
        }

        // Backdrop hack start
        let canUseBackdrop = true;
        state.sourceFrame.pad(padding);
        if (autoFit) {
            state.sourceFrame.fit(this.renderer.renderTexture.sourceFrame);
        } else {
            canUseBackdrop = containsRect(this.renderer.renderTexture.sourceFrame, state.sourceFrame);
        }

        // round to whole number based on resolution
        state.sourceFrame.ceil(resolution);

        // detect backdrop uniform
        if (canUseBackdrop) {
            let backdrop = null;
            for (let i = 0; i < filters.length; i++) {
                const bName = filters[i].backdropUniformName;
                if (bName) {
                    if (backdrop === null) {
                        backdrop = this.prepareBackdrop(state.sourceFrame);
                    }

                    filters[i].uniforms[bName] = backdrop;
                    if (backdrop) {
                        filters[i]._backdropActive = true;
                    }
                }
            }
        }

        state.renderTexture = this.getOptimalFilterTexture(state.sourceFrame.width, state.sourceFrame.height, resolution);
        state.filters = filters;

        state.destinationFrame.width = state.renderTexture.width;
        state.destinationFrame.height = state.renderTexture.height;

        state.renderTexture.filterFrame = state.sourceFrame;

        renderer.renderTexture.bind(state.renderTexture, state.sourceFrame);// /, state.destinationFrame);
        renderer.renderTexture.clear();
    }

    function pop(this: PIXI.systems.FilterSystem) {
        const filterStack = this.defaultFilterStack;
        const state = filterStack.pop();
        const filters = state.filters;

        this.activeState = state;

        const globalUniforms = this.globalUniforms.uniforms;

        globalUniforms.outputFrame = state.sourceFrame;
        globalUniforms.resolution = state.resolution;

        const inputSize = globalUniforms.inputSize;
        const inputPixel = globalUniforms.inputPixel;
        const inputClamp = globalUniforms.inputClamp;

        inputSize[0] = state.destinationFrame.width;
        inputSize[1] = state.destinationFrame.height;
        inputSize[2] = 1.0 / inputSize[0];
        inputSize[3] = 1.0 / inputSize[1];

        inputPixel[0] = inputSize[0] * state.resolution;
        inputPixel[1] = inputSize[1] * state.resolution;
        inputPixel[2] = 1.0 / inputPixel[0];
        inputPixel[3] = 1.0 / inputPixel[1];

        inputClamp[0] = 0.5 * inputPixel[2];
        inputClamp[1] = 0.5 * inputPixel[3];
        inputClamp[2] = (state.sourceFrame.width * inputSize[2]) - (0.5 * inputPixel[2]);
        inputClamp[3] = (state.sourceFrame.height * inputSize[3]) - (0.5 * inputPixel[3]);

        // only update the rect if its legacy..
        if (state.legacy) {
            const filterArea = globalUniforms.filterArea;

            filterArea[0] = state.destinationFrame.width;
            filterArea[1] = state.destinationFrame.height;
            filterArea[2] = state.sourceFrame.x;
            filterArea[3] = state.sourceFrame.y;

            globalUniforms.filterClamp = globalUniforms.inputClamp;
        }

        (this.globalUniforms as any).update();

        const lastState = filterStack[filterStack.length - 1];

        if ((state.renderTexture.framebuffer as any).multisample > 1) {
            (this.renderer.framebuffer as any).blit();
        }

        if (filters.length === 1) {
            filters[0].apply(this, state.renderTexture, lastState.renderTexture, 0, state);

            this.returnFilterTexture(state.renderTexture);
        } else {
            let flip = state.renderTexture;
            let flop = this.getOptimalFilterTexture(
                flip.width,
                flip.height,
                state.resolution
            );

            (flop as any).filterFrame = flip.filterFrame;

            let i = 0;

            for (i = 0; i < filters.length - 1; ++i) {
                filters[i].apply(this, flip, flop, 1, state);

                const t = flip;

                flip = flop;
                flop = t;
            }

            filters[i].apply(this, flip, lastState.renderTexture, 0, state);

            this.returnFilterTexture(flip);
            this.returnFilterTexture(flop);
        }

        let backdropFree = false;

        for (let i = 0; i < filters.length; i++) {
            if (filters[i]._backdropActive) {
                const bName = filters[i].backdropUniformName;
                if (!backdropFree) {
                    this.returnFilterTexture(filters[i].uniforms[bName]);
                    backdropFree = true;
                }
                filters[i].uniforms[bName] = null;
                filters[i]._backdropActive = false;
            }
        }

        state.clear();
        this.statePool.push(state);
    }

    /**
     * Takes a part of current render target corresponding to bounds
     * fits sourceFrame to current render target frame to evade problems
     */
    function prepareBackdrop(bounds: PIXI.Rectangle): PIXI.RenderTexture {
        const renderer = this.renderer;
        const renderTarget = renderer.renderTexture.current;
        const fr = this.renderer.renderTexture.sourceFrame;

        if (!renderTarget) {
            return null;
        }

        const resolution = renderTarget.baseTexture.resolution;

        //bounds.fit(fr);

        const x = (bounds.x - fr.x) * resolution;
        const y = (bounds.y - fr.y) * resolution;
        const w = (bounds.width) * resolution;
        const h = (bounds.height) * resolution;

        const gl = renderer.gl;
        const rt = this.getOptimalFilterTexture(w, h, 1);

        renderer.texture.bindForceLocation(rt.baseTexture, 0);
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);

        return rt;
    }

    interface IFilterTarget {
        filterArea: PIXI.Rectangle;

        getBounds(skipUpdate?: boolean): PIXI.Rectangle;
    }

    class FilterState {
        renderTexture: PIXI.RenderTexture;
        target: IFilterTarget;
        legacy: boolean;
        resolution: number;
        sourceFrame: PIXI.Rectangle;
        destinationFrame: PIXI.Rectangle;
        filters: Array<PIXI.Filter>;

        constructor() {
            this.renderTexture = null;
            this.target = null;
            this.legacy = false;
            this.resolution = 1;
            this.sourceFrame = new PIXI.Rectangle();
            this.destinationFrame = new PIXI.Rectangle();
            this.filters = [];
        }

        clear(): void {
            this.target = null;
            this.filters = null;
            this.renderTexture = null;
        }
    }

    PIXI.systems.FilterSystem.prototype.push = push as any;
    PIXI.systems.FilterSystem.prototype.pop = pop;
    PIXI.systems.FilterSystem.prototype.prepareBackdrop = prepareBackdrop;
}
