import {TilingSprite as TilingSpriteBase} from '@pixi/sprite-tiling';
import {Renderer} from "@pixi/core";
import {getBlendFilterArray} from "./ShaderParts";
import {IPictureFilterSystem} from "./FilterSystemMixin";


export class TilingSprite extends TilingSpriteBase {
    _render(renderer: Renderer): void
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
            if (!(renderer.filter  as any as IPictureFilterSystem).pushWithCheck(this, blendFilterArray)) {
                return;
            }
        }

        this.tileTransform.updateLocalTransform();
        this.uvMatrix.update();

        renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
        renderer.plugins[this.pluginName].render(this);

        if (blendFilterArray) {
            renderer.batch.flush();
            renderer.filter.pop();
        }
    }
}
