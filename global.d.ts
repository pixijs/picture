//TODO: need pixi 6.0.5 to actually use this file, lets wait for it
declare namespace GlobalMixins {
    interface FilterSystem {
        prepareBackdrop(sourceFrame: PIXI.Rectangle): PIXI.RenderTexture;

        pushWithCheck(target: PIXI.DisplayObject, filters: Array<Filter>, checkEmptyBounds?: boolean): boolean;
    }

    interface TextureSystem {
        bindForceLocation(texture: BaseTexture, location: number): void;
    }
}
