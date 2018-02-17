module pixi_picture {
    export class PictureSprite extends PIXI.Sprite {
        constructor(texture: PIXI.Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
