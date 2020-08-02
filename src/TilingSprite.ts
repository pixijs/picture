namespace pixi_picture {
    export class TilingSprite extends PIXI.TilingSprite {
        _render(renderer: PIXI.Renderer): void
        {
            // tweak our texture temporarily..
            const texture = (this as any)._texture;

            if (!texture || !texture.valid)
            {
                return;
            }

            const blendFilterArray = getBlendFilterArray(this.blendMode);

            if (blendFilterArray) {
                renderer.batch.flush();
                if (!renderer.filter.pushWithCheck(this, blendFilterArray)) {
                    return;
                }
            }

            this.tileTransform.updateLocalTransform();
            this.uvMatrix.update();

            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);

            if (blendFilterArray) {
                renderer.filter.pop();
            }
        }
    }
}
