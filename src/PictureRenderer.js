var NormalShader = require('./NormalShader'),
    mapFilterBlendModesToPixi = require('./mapFilterBlendModesToPixi'),
    glCore = PIXI.glCore,
    WRAP_MODES = PIXI.WRAP_MODES;

/**
 * Renderer that clamps the texture so neighbour frames wont bleed on it
 * immitates context2d drawImage behaviour
 *
 * @class
 * @memberof PIXI.extras
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this plugin works for
 */
function PictureRenderer(renderer) {
    PIXI.ObjectRenderer.call(this, renderer);
}

PictureRenderer.prototype = Object.create(PIXI.ObjectRenderer.prototype);
PictureRenderer.prototype.constructor = PictureRenderer;

PictureRenderer.prototype.onContextChange = function () {
    var gl = this.renderer.gl;
    this.quad = new PIXI.Quad(gl);
    this.drawModes = mapFilterBlendModesToPixi(gl);
    this.normalShader = [new NormalShader(gl, 0), new NormalShader(gl, 1), new NormalShader(gl, 2)];
    this.quad.initVao(this.normalShader[0]);
    this._tempClamp = new Float32Array(4);
    this._tempColor = new Float32Array(4);
    this._tempRect = new PIXI.Rectangle();
    this._tempRect2 = new PIXI.Rectangle();
    this._tempRect3 = new PIXI.Rectangle();
    this._tempMatrix = new PIXI.Matrix();
    this._tempMatrix2 = new PIXI.Matrix();
    this._bigBuf = new Uint8Array(1 << 20);
    this._renderTexture = new PIXI.BaseRenderTexture(1024, 1024);
};

PictureRenderer.prototype.start = function () {
    //noop
};

PictureRenderer.prototype.flush = function () {
    //noop
};

function nextPow2(v) {
    v += v === 0;
    --v;
    v |= v >>> 1;
    v |= v >>> 2;
    v |= v >>> 4;
    v |= v >>> 8;
    v |= v >>> 16;
    return v + 1;
}

PictureRenderer.prototype._getRenderTexture = function (minWidth, minHeight) {
    if (this._renderTexture.width < minWidth ||
        this._renderTexture.height < minHeight) {
        minHeight = nextPow2(minWidth);
        minHeight = nextPow2(minHeight);
        this._renderTexture.resize(minWidth, minHeight);
    }
    return this._renderTexture;
};

PictureRenderer.prototype._getBuf = function (size) {
    var buf = this._bigBuf;
    if (buf.length < size) {
        size = nextPow2(size);
        buf = new Uint8Array(size);
        this._bigBuf = buf;
    }
    return buf;
};

/**
 * Renders the picture object.
 *
 * @param sprite {PIXI.tilemap.PictureSprite} the picture to render
 */
PictureRenderer.prototype.render = function (sprite) {
    if (!sprite.texture.valid) {
        return;
    }
    var tilingMode = 0;
    if (sprite.tileTransform) {
        //for TilingSprite
        tilingMode = this._isSimpleSprite(sprite) ? 1 : 2;
    }

    var blendShader = this.drawModes[sprite.blendMode];
    if (blendShader) {
        this._renderBlend(sprite, blendShader[tilingMode]);
    } else {
        this._renderNormal(sprite, this.normalShader[tilingMode]);
    }
};

PictureRenderer.prototype._renderNormal = function (sprite, shader) {
    var renderer = this.renderer;
    renderer.bindShader(shader);
    renderer.state.setBlendMode(sprite.blendMode);
    this._renderInner(sprite, shader);
};

PictureRenderer.prototype._renderBlend = function (sprite, shader) {
    //nothing there yet
    var renderer = this.renderer;
    var spriteBounds = sprite.getBounds();
    var renderTarget = renderer._activeRenderTarget;
    var matrix = renderTarget.projectionMatrix;
    var flipX = matrix.a < 0;
    var flipY = matrix.d < 0;
    var resolution = renderTarget.resolution;
    var screen = this._tempRect;
    var fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
    screen.x = 0;
    screen.y = 0;
    screen.width = fr.width;
    screen.height = fr.height;

    var bounds = this._tempRect2;
    var fbw = fr.width * resolution, fbh = fr.height * resolution;
    bounds.x = (spriteBounds.x + matrix.tx / matrix.a) * resolution + fbw / 2;
    bounds.y = (spriteBounds.y + matrix.ty / matrix.d) * resolution + fbh / 2;
    bounds.width = spriteBounds.width * resolution;
    bounds.height = spriteBounds.height * resolution;
    if (flipX) {
        bounds.y = fbw - bounds.width - bounds.x;
    }
    if (flipY) {
        bounds.y = fbh - bounds.height - bounds.y;
    }

    var screenBounds = this._tempRect3;
    var x_1 = Math.floor(Math.max(screen.x, bounds.x));
    var x_2 = Math.ceil(Math.min(screen.x + screen.width, bounds.x + bounds.width));
    var y_1 = Math.floor(Math.max(screen.y, bounds.y));
    var y_2 = Math.ceil(Math.min(screen.y + screen.height, bounds.y + bounds.height));
    var pixelsWidth = x_2 - x_1;
    var pixelsHeight = y_2 - y_1;
    if (pixelsWidth <= 0 || pixelsHeight <= 0) {
        //culling
        return;
    }
    //TODO: padding
    var rt = this._getRenderTexture(pixelsWidth, pixelsHeight);
    renderer.bindTexture(rt, 1);
    var gl = renderer.gl;
    if (renderer.renderingToScreen && renderTarget.root) {
        var buf = this._getBuf(pixelsWidth * pixelsHeight * 4);
        gl.readPixels(x_1, y_1, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
        //REVERT Y?
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
    } else {
        gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x_1, y_1, pixelsWidth, pixelsHeight);
    }

    renderer.bindShader(shader);
    renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
    if (shader.uniforms.mapMatrix) {
        var mapMatrix = this._tempMatrix;
        mapMatrix.a = bounds.width / rt.width / spriteBounds.width;
        if (flipX) {
            mapMatrix.a = -mapMatrix.a;
            mapMatrix.tx = (bounds.x - x_1) / rt.width - (spriteBounds.x + spriteBounds.width) * mapMatrix.a;
        } else {
            mapMatrix.tx = (bounds.x - x_1) / rt.width - spriteBounds.x * mapMatrix.a;
        }
        mapMatrix.d = bounds.height / rt.height / spriteBounds.height;
        if (flipY) {
            mapMatrix.d = -mapMatrix.d;
            mapMatrix.ty = (bounds.y - y_1) / rt.height - (spriteBounds.y + spriteBounds.height) * mapMatrix.d;
        } else {
            mapMatrix.ty = (bounds.y - y_1) / rt.height - spriteBounds.y * mapMatrix.d;
        }

        shader.uniforms.mapMatrix = mapMatrix.toArray(true);
    }

    this._renderInner(sprite, shader);
};

PictureRenderer.prototype._renderInner = function (sprite, shader) {
    var renderer = this.renderer;
    if (shader.tilingMode > 0) {
        this._renderWithShader(sprite, shader.tilingMode === 1, shader);
    } else {
        this._renderSprite(sprite, shader);
    }
};

PictureRenderer.prototype._renderSprite = function(sprite, shader) {
    var renderer = this.renderer;
    var quad = this.quad;
    var uvs = sprite.texture._uvs;

    //sprite already has calculated the vertices. lets transfer them to quad

    var vertices = quad.vertices;
    var vd = sprite.computedGeometry ? sprite.computedGeometry.vertices : sprite.vertexData;
    for (var i = 0; i < 8; i++) {
        quad.vertices[i] = vd[i];
    }

    //SpriteRenderer works differently, with uint32 UVS
    //but for our demo float uvs are just fine
    quad.uvs[0] = uvs.x0;
    quad.uvs[1] = uvs.y0;
    quad.uvs[2] = uvs.x1;
    quad.uvs[3] = uvs.y1;
    quad.uvs[4] = uvs.x2;
    quad.uvs[5] = uvs.y2;
    quad.uvs[6] = uvs.x3;
    quad.uvs[7] = uvs.y3;

    //TODO: add baricentric coords here
    quad.upload();

    var frame = sprite.texture.frame;
    var base = sprite.texture.baseTexture;
    var clamp = this._tempClamp;
    //clamping 0.5 pixel from each side to reduce border artifact
    //this is our plugin main purpose
    var eps = 0.5 / base.resolution;
    clamp[0] = (frame.x + eps) / base.width;
    clamp[1] = (frame.y + eps) / base.height;
    clamp[2] = (frame.x + frame.width - eps) / base.width;
    clamp[3] = (frame.y + frame.height - eps) / base.height;
    //take a notice that size in pixels is realWidth,realHeight
    //width and height are divided by resolution
    shader.uniforms.uTextureClamp = clamp;

    var color = this._tempColor;
    PIXI.utils.hex2rgb(sprite.tint, color);
    var alpha = sprite.worldAlpha;
    //premultiplied alpha tint
    //of course we could do that in shader too
    color[0] *= alpha;
    color[1] *= alpha;
    color[2] *= alpha;
    color[3] = alpha;
    shader.uniforms.uColor = color;

    //bind texture to unit 0, our default sampler unit
    renderer.bindTexture(base, 0);
    quad.draw();
};

/**
 * this is a part of PIXI.extras.TilingSprite. It will be refactored later
 * @param ts
 * @returns {boolean}
 * @private
 */
PictureRenderer.prototype._isSimpleSprite = function(ts) {
    var renderer = this.renderer;
    var tex = ts._texture;
    var baseTex = tex.baseTexture;
    var isSimple = baseTex.isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

    // auto, force repeat wrapMode for big tiling textures
    if (isSimple)
    {
        if (!baseTex._glTextures[renderer.CONTEXT_UID])
        {
            if (baseTex.wrapMode === WRAP_MODES.CLAMP)
            {
                baseTex.wrapMode = WRAP_MODES.REPEAT;
            }
        }
        else
        {
            isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
        }
    }

    return isSimple;
};

/**
 * this is a part of PIXI.extras.TilingSprite. It will be refactored later
 * @param ts
 * @returns {boolean}
 * @private
 */
PictureRenderer.prototype._renderWithShader = function(ts, isSimple, shader)
{
    var quad = this.quad;
    var vertices = quad.vertices;

    var w0 = ts._width * (1 - ts._anchor._x);
    var w1 = ts._width * -ts._anchor._x;

    var h0 = ts._height * (1 - ts._anchor._y);
    var h1 = ts._height * -ts._anchor._y;

    var wt = ts.transform.worldTransform;

    var a = wt.a;
    var b = wt.b;
    var c = wt.c;
    var d = wt.d;
    var tx = wt.tx;
    var ty = wt.ty;

    vertices[0] = (a * w1) + (c * h1) + tx;
    vertices[1] = (d * h1) + (b * w1) + ty;

    vertices[2] = (a * w0) + (c * h1) + tx;
    vertices[3] = (d * h1) + (b * w0) + ty;

    vertices[4] = (a * w0) + (c * h0) + tx;
    vertices[5] = (d * h0) + (b * w0) + ty;

    vertices[6] = (a * w1) + (c * h0) + tx;
    vertices[7] = (d * h0) + (b * w1) + ty;

    vertices = quad.uvs;

    vertices[0] = vertices[6] = -ts.anchor.x;
    vertices[1] = vertices[3] = -ts.anchor.y;

    vertices[2] = vertices[4] = 1.0 - ts.anchor.x;
    vertices[5] = vertices[7] = 1.0 - ts.anchor.y;

    quad.upload();

    var renderer = this.renderer;
    var tex = ts._texture;
    var lt = ts.tileTransform.localTransform;
    var uv = ts.uvTransform;

    var w = tex.width;
    var h = tex.height;
    var W = ts._width;
    var H = ts._height;

    var tempMat = this._tempMatrix2;

    tempMat.set(lt.a * w / W,
        lt.b * w / H,
        lt.c * h / W,
        lt.d * h / H,
        lt.tx / W,
        lt.ty / H);

    // that part is the same as above:
    // tempMat.identity();
    // tempMat.scale(tex.width, tex.height);
    // tempMat.prepend(lt);
    // tempMat.scale(1.0 / ts._width, 1.0 / ts._height);

    tempMat.invert();
    if (isSimple)
    {
        tempMat.append(uv.mapCoord);
    }
    else
    {
        shader.uniforms.uMapCoord = uv.mapCoord.toArray(true);
        shader.uniforms.uClampFrame = uv.uClampFrame;
        shader.uniforms.uClampOffset = uv.uClampOffset;
    }
    shader.uniforms.uTransform = tempMat.toArray(true);

    var color = this._tempColor;
    var alpha = ts.worldAlpha;

    PIXI.utils.hex2rgb(ts.tint, color);
    color[0] *= alpha;
    color[1] *= alpha;
    color[2] *= alpha;
    color[3] = alpha;
    shader.uniforms.uColor = color;

    renderer.bindTexture(tex);

    quad.draw();
};

PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);

module.exports = PictureRenderer;
