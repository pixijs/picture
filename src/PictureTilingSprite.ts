module PIXI.extras {
    export class PictureTilingSprite extends TilingSprite {
        constructor(texture: Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
