module PIXI.extras {
    export class PictureSprite extends Sprite {
        constructor(texture: Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
