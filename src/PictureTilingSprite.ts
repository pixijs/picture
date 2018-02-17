module pixi_picture {
    export class PictureTilingSprite extends PIXI.extras.TilingSprite {
        constructor(texture: PIXI.Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
