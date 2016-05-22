/**
 * A tiling sprite is a fast way of rendering a tiling image
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.tilemap
 * @param texture {PIXI.Texture} the texture for this sprite
 */
function PictureSprite(texture)
{
    PIXI.Sprite.call(this, texture);
}

PictureSprite.prototype = Object.create(PIXI.Sprite.prototype);
PictureSprite.prototype.constructor = PictureSprite;
module.exports = PictureSprite;

/**
 * Renders the object using the WebGL renderer
 *
 * @param renderer {PIXI.WebGLRenderer}
 * @private
 */
PictureSprite.prototype._renderWebGL = function (renderer)
{
    if(this.transform.updated || this.textureDirty)
    {
        this.textureDirty = false;
        // set the vertex data
        this.calculateVertices();
    }

    renderer.setObjectRenderer(renderer.plugins.picture);
    renderer.plugins.picture.render(this);
};
