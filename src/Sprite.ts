namespace pixi_picture {
    export class Sprite extends PIXI.Sprite {
        constructor(texture: PIXI.Texture) {
            super(texture);
            this.pluginName = 'picture'
        }
    }
}
