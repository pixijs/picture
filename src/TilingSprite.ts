namespace pixi_picture {
    export class TilingSprite extends PIXI.TilingSprite {
        constructor(texture: PIXI.Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
