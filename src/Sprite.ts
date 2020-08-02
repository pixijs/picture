namespace pixi_picture {
    export class Sprite extends PIXI.Sprite {
        _render(renderer: PIXI.Renderer): void
        {
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

            this.calculateVertices();
            renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
            renderer.plugins[this.pluginName].render(this);

            if (blendFilterArray) {
                renderer.filter.pop();
            }
        }
    }
}
