namespace pixi_picture {
    export class TilingSprite extends PIXI.extras.TilingSprite {
        constructor(texture: PIXI.Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
