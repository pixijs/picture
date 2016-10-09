/**
 * A TilingSprite with support of additional blendModes
 *
 * @class
 * @extends PIXI.extras.TilingSprite
 * @memberof PIXI.extras
 * @param texture {PIXI.Texture} the texture for this sprite
 * @param {number} width width
 * @param {number} height height
 */
function PictureTilingSprite(texture, width, height)
{
    PIXI.extras.TilingSprite.call(this, texture, width, height);
}

PictureTilingSprite.prototype = Object.create(PIXI.extras.TilingSprite.prototype);
PictureTilingSprite.prototype.constructor = PictureTilingSprite;
module.exports = PictureTilingSprite;

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
PictureTilingSprite.prototype._renderWebGL = function (renderer)
{
    if (this.updateGeometry) {
        this.updateGeometry();
    }

    const texture = this._texture;

    if (!texture || !texture.valid)
    {
        return;
    }

    this.tileTransform.updateLocalTransform();
    this.uvTransform.update();

    renderer.setObjectRenderer(renderer.plugins.picture);
    renderer.plugins.picture.render(this);
};
