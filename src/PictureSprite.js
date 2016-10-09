/**
 * A Sprite with reduced border artifacts
 *
 * @class
 * @extends PIXI.Sprite
 * @memberof PIXI.extras
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
    if (this.updateGeometry) {
        this.updateGeometry();
    } else {
        this.calculateVertices();
    }

    //use different plugin for rendering
    renderer.setObjectRenderer(renderer.plugins.picture);
    renderer.plugins.picture.render(this);
};
