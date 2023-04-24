import { Sprite as SpriteBase } from '@pixi/sprite';
import { Renderer, BLEND_MODES } from '@pixi/core';
import { getBlendFilterArray } from './ShaderParts';
import { IPictureFilterSystem } from './FilterSystemMixin';

export class Sprite extends SpriteBase
{
    _render(renderer: Renderer): void
    {
        const texture = (this as any)._texture;

        if (!texture || !texture.valid)
        {
            return;
        }

        const blendFilterArray = getBlendFilterArray(this.blendMode);
        const cacheBlend = this.blendMode;

        if (blendFilterArray)
        {
            renderer.batch.flush();
            if (!(renderer.filter as IPictureFilterSystem).pushWithCheck(this, blendFilterArray))
            {
                return;
            }
            this.blendMode = BLEND_MODES.NORMAL;
        }

        this.calculateVertices();
        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);

        if (blendFilterArray)
        {
            renderer.batch.flush();
            renderer.filter.pop();
            this.blendMode = cacheBlend;
        }
    }
}
