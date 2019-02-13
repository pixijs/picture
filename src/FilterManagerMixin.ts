namespace pixi_picture {
	export function filterManagerMixin(fm: PIXI.FilterManager) {
		if ((fm as any).prepareBackdrop) return;

		fm.pushFilter = pushFilter as any;
		fm.popFilter = popFilter as any;
		fm.syncUniforms = syncUniforms as any;
		(fm as any).prepareBackdrop = prepareBackdrop;
	}

	function pushFilter(target: PIXI.DisplayObject, filters: Array<BackdropFilter<any>>) {
		const renderer = this.renderer;

		let filterData = this.filterData;

		if (!filterData)
		{
			filterData = this.renderer._activeRenderTarget.filterStack;

			// add new stack
			const filterState = new FilterState();

			filterState.sourceFrame = filterState.destinationFrame = this.renderer._activeRenderTarget.size;
			filterState.renderTarget = renderer._activeRenderTarget;

			this.renderer._activeRenderTarget.filterData = filterData = {
				index: 0,
				stack: [filterState],
			};

			this.filterData = filterData;
		}

		// get the current filter state..
		let currentState = filterData.stack[++filterData.index];
		const renderTargetFrame = filterData.stack[0].destinationFrame;

		if (!currentState)
		{
			currentState = filterData.stack[filterData.index] = new FilterState();
		}

		const fullScreen = target.filterArea
			&& target.filterArea.x === 0
			&& target.filterArea.y === 0
			&& target.filterArea.width === renderer.screen.width
			&& target.filterArea.height === renderer.screen.height;

		// for now we go off the filter of the first resolution..
		const resolution = filters[0].resolution;
		const padding = filters[0].padding | 0;
		const targetBounds = fullScreen ? renderer.screen : (target.filterArea || target.getBounds(true));
		const sourceFrame = currentState.sourceFrame;
		const destinationFrame = currentState.destinationFrame;

		sourceFrame.x = ((targetBounds.x * resolution) | 0) / resolution;
		sourceFrame.y = ((targetBounds.y * resolution) | 0) / resolution;
		sourceFrame.width = ((targetBounds.width * resolution) | 0) / resolution;
		sourceFrame.height = ((targetBounds.height * resolution) | 0) / resolution;

		if (!fullScreen)
		{
			if (filterData.stack[0].renderTarget.transform)
			{ //

				// TODO we should fit the rect around the transform..
			}
			else if (filters[0].autoFit)
			{
				sourceFrame.fit(renderTargetFrame);
			}

			// lets apply the padding After we fit the element to the screen.
			// this should stop the strange side effects that can occur when cropping to the edges
			sourceFrame.pad(padding);
		}

		for (let i = 0; i < filters.length; i++)
		{
			let backdrop = null;
			if (filters[i].backdropUniformName)
			{
				if (backdrop === null)
				{
					backdrop = this.prepareBackdrop(sourceFrame);
				}
				filters[i]._backdropRenderTarget = backdrop;
			}
		}

		destinationFrame.width = sourceFrame.width;
		destinationFrame.height = sourceFrame.height;

		// lets play the padding after we fit the element to the screen.
		// this should stop the strange side effects that can occur when cropping to the edges

		const renderTarget = this.getPotRenderTarget(renderer.gl, sourceFrame.width, sourceFrame.height, resolution);

		currentState.target = target;
		currentState.filters = filters;
		currentState.resolution = resolution;
		currentState.renderTarget = renderTarget;

		// bind the render target to draw the shape in the top corner..

		renderTarget.setFrame(destinationFrame, sourceFrame);

		// bind the render target
		renderer.bindRenderTarget(renderTarget);
		renderTarget.clear(filters[filters.length - 1].clearColor);
	}

	function popFilter() {
		const filterData = this.filterData;

		const lastState = filterData.stack[filterData.index - 1];
		const currentState = filterData.stack[filterData.index];

		this.quad.map(currentState.renderTarget.size, currentState.sourceFrame).upload();

		const filters = currentState.filters;

		if (filters.length === 1)
		{
			filters[0].apply(this, currentState.renderTarget, lastState.renderTarget, false, currentState);
			this.freePotRenderTarget(currentState.renderTarget);
		}
		else
		{
			let flip = currentState.renderTarget;
			let flop = this.getPotRenderTarget(
				this.renderer.gl,
				currentState.sourceFrame.width,
				currentState.sourceFrame.height,
				currentState.resolution
			);

			flop.setFrame(currentState.destinationFrame, currentState.sourceFrame);

			// finally lets clear the render target before drawing to it..
			flop.clear();

			let i = 0;

			for (i = 0; i < filters.length - 1; ++i)
			{
				filters[i].apply(this, flip, flop, true, currentState);

				const t = flip;

				flip = flop;
				flop = t;
			}

			filters[i].apply(this, flip, lastState.renderTarget, false, currentState);

			this.freePotRenderTarget(flip);
			this.freePotRenderTarget(flop);
		}

		currentState.clear();

		let backdropFree = false;
		for (let i = 0; i < filters.length; i++)
		{
			if (filters[i]._backdropRenderTarget)
			{
				if (!backdropFree)
				{
					this.freePotRenderTarget(filters[i]._backdropRenderTarget);
					backdropFree = true;
				}
				filters[i]._backdropRenderTarget = null;
			}
		}

		filterData.index--;

		if (filterData.index === 0)
		{
			this.filterData = null;
		}
	}

	function syncUniforms(shader: PIXI.glCore.GLShader, filter: BackdropFilter<any>) {
		const renderer = this.renderer;
		const gl = renderer.gl;
		const uniformData = filter.uniformData;
		const uniforms = filter.uniforms;

		// 0 is reserved for the PixiJS texture so we start at 1!
		let textureCount = 1;
		let currentState;

		// filterArea and filterClamp that are handled by FilterManager directly
		// they must not appear in uniformData

		if (shader.uniforms.filterArea)
		{
			currentState = this.filterData.stack[this.filterData.index];

			const filterArea = shader.uniforms.filterArea;

			filterArea[0] = currentState.renderTarget.size.width;
			filterArea[1] = currentState.renderTarget.size.height;
			filterArea[2] = currentState.sourceFrame.x;
			filterArea[3] = currentState.sourceFrame.y;

			shader.uniforms.filterArea = filterArea;
		}

		// use this to clamp displaced texture coords so they belong to filterArea
		// see displacementFilter fragment shader for an example
		if (shader.uniforms.filterClamp)
		{
			currentState = currentState || this.filterData.stack[this.filterData.index];

			const filterClamp = shader.uniforms.filterClamp;

			filterClamp[0] = 0;
			filterClamp[1] = 0;
			filterClamp[2] = (currentState.sourceFrame.width - 1) / currentState.renderTarget.size.width;
			filterClamp[3] = (currentState.sourceFrame.height - 1) / currentState.renderTarget.size.height;

			shader.uniforms.filterClamp = filterClamp;
		}

		// TODO Caching layer..
		for (const i in uniformData)
		{
			if (!shader.uniforms.data[i])
			{
				continue;
			}

			if (i === filter.backdropUniformName)
			{
				const rt = filter._backdropRenderTarget;
				shader.uniforms[i] = textureCount;
				renderer.boundTextures[textureCount] = renderer.emptyTextures[textureCount];
				gl.activeTexture(gl.TEXTURE0 + textureCount);
				gl.bindTexture(gl.TEXTURE_2D, (rt.texture as any).texture);
				textureCount++;
				continue;
			}

			const type = uniformData[i].type;

			if (type === 'sampler2d' && uniforms[i] !== 0)
			{
				if (uniforms[i].baseTexture)
				{
					shader.uniforms[i] = this.renderer.bindTexture(uniforms[i].baseTexture, textureCount);
				}
				else
				{
					shader.uniforms[i] = textureCount;

					const gl = this.renderer.gl;

					renderer.boundTextures[textureCount] = renderer.emptyTextures[textureCount];
					gl.activeTexture(gl.TEXTURE0 + textureCount);

					uniforms[i].texture.bind();
				}

				textureCount++;
			}
			else if (type === 'mat3')
			{
				// check if its PixiJS matrix..
				if (uniforms[i].a !== undefined)
				{
					shader.uniforms[i] = uniforms[i].toArray(true);
				}
				else
				{
					shader.uniforms[i] = uniforms[i];
				}
			}
			else if (type === 'vec2')
			{
				// check if its a point..
				if (uniforms[i].x !== undefined)
				{
					const val = shader.uniforms[i] || new Float32Array(2);

					val[0] = uniforms[i].x;
					val[1] = uniforms[i].y;
					shader.uniforms[i] = val;
				}
				else
				{
					shader.uniforms[i] = uniforms[i];
				}
			}
			else if (type === 'float')
			{
				if (shader.uniforms.data[i].value !== uniformData[i])
				{
					shader.uniforms[i] = uniforms[i];
				}
			}
			else
			{
				shader.uniforms[i] = uniforms[i];
			}
		}
	}

	/**
	 * Takes a part of current render target corresponding to bounds
	 * fits sourceFrame to current render target frame to evade problems
	 *
	 * @param {PIXI.Rectangle} bounds backdrop region, can be modified inside
	 * @returns {PIXI.RenderTarget} pooled renderTexture with backdrop
	 */
	function prepareBackdrop(bounds: PIXI.Rectangle): PIXI.RenderTarget
	{
		const renderer = this.renderer;
		const renderTarget = renderer._activeRenderTarget;
		if (renderTarget.root)
		{
			return null;
		}
		const resolution = renderTarget.resolution;
		const fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
		bounds.fit(fr);
		const x = (bounds.x - fr.x) * resolution;
		const y = (bounds.y - fr.y) * resolution;
		const w = (bounds.width) * resolution;
		const h = (bounds.height) * resolution;
		const gl = renderer.gl;
		const rt = this.getPotRenderTarget(gl, w, h, 1);
		renderer.boundTextures[1] = renderer.emptyTextures[1];
		gl.activeTexture(gl.TEXTURE0 + 1);
		gl.bindTexture(gl.TEXTURE_2D, rt.texture.texture);

		// v4 drops current renderTarget on new renderTexture, need to restore it!
		if (!rt.rebound) {
			renderer._activeRenderTarget = null;
			renderer.bindRenderTarget(renderTarget);
			rt.rebound = true;
		}

		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x, y, w, h);
		return rt;
	}

	class FilterState
	{
		renderTarget : PIXI.RenderTarget = null;
		target: PIXI.DisplayObject = null;
		resolution: number = 1;
		sourceFrame = new PIXI.Rectangle();
		destinationFrame = new PIXI.Rectangle();
		filters: Array<BackdropFilter<any>> = [];

		/**
		 * clears the state
		 */
		clear()
		{
			this.filters = null;
			this.target = null;
			this.renderTarget = null;
		}
	}

	export class BackdropFilter<T> extends PIXI.Filter<T> {
		backdropUniformName: string = null;
		_backdropRenderTarget: PIXI.RenderTarget = null;
		clearColor: Float32Array = null;
		uniformData: PIXI.UniformDataMap<T>;
	}
}
