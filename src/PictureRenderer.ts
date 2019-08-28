namespace pixi_picture {
    import Matrix = PIXI.Matrix;
    import Sprite = PIXI.Sprite;
	import Texture = PIXI.Texture;
    import TextureUvs = PIXI.TextureUvs;
    import TilingSprite = PIXI.extras.TilingSprite;
    import WRAP_MODES = PIXI.WRAP_MODES;

    function nextPow2(v: number): number {
        v += (v === 0)?1:0;
        --v;
        v |= v >>> 1;
        v |= v >>> 2;
        v |= v >>> 4;
        v |= v >>> 8;
        v |= v >>> 16;
        return v + 1;
    }

    export class PictureRenderer extends PIXI.ObjectRenderer {
        constructor(renderer: PIXI.WebGLRenderer) {
            super(renderer);
        }

        drawModes: Array<Array<PictureShader>>;
        normalShader: Array<PictureShader>;
        _tempClamp: Float32Array;
        _tempColor: Float32Array;
        _tempRect: PIXI.Rectangle;
        _tempRect2: PIXI.Rectangle;
        _tempRect3: PIXI.Rectangle;
        _tempMatrix: PIXI.Matrix;
        _tempMatrix2: PIXI.Matrix;
        _bigBuf: Uint8Array;
        _renderTexture: PIXI.BaseRenderTexture;

        onContextChange() {
	        filterManagerMixin(this.renderer.filterManager);

            const gl = this.renderer.gl;

            this.drawModes = mapFilterBlendModesToPixi(gl);
            this.normalShader = [new NormalShader(gl, 0), new NormalShader(gl, 1), new NormalShader(gl, 2)];
            this._tempClamp = new Float32Array(4);
            this._tempColor = new Float32Array(4);
            this._tempRect = new PIXI.Rectangle();
            this._tempRect2 = new PIXI.Rectangle();
            this._tempRect3 = new PIXI.Rectangle();
            this._tempMatrix = new PIXI.Matrix();
            this._tempMatrix2 = new PIXI.Matrix();
            this._bigBuf = new Uint8Array(1 << 20);
            this._renderTexture = new PIXI.BaseRenderTexture(1024, 1024);
        }

        start() {

        }

        flush() {

        }

        _getRenderTexture(minWidth: number, minHeight: number) {
            if (this._renderTexture.width < minWidth ||
                this._renderTexture.height < minHeight) {
                minWidth = nextPow2(minWidth);
                minHeight = nextPow2(minHeight);
                this._renderTexture.resize(minWidth, minHeight);
            }
            return this._renderTexture;
        }

        _getBuf(size: number): Float32Array {
            let buf = this._bigBuf;
            if (buf.length < size) {
                size = nextPow2(size);
                buf = new Uint8Array(size);
                this._bigBuf = buf;
            }
            return buf;
        }

        render(sprite: Sprite) {
            if (!sprite.texture.valid) {
                return;
            }
            let tilingMode = 0;
            if ((sprite as any).tileTransform) {
                //for Sprite
                tilingMode = this._isSimpleSprite(sprite) ? 1 : 2;
            }

            const blendShader = this.drawModes[sprite.blendMode];
            if (blendShader) {
                this._renderBlend(sprite, blendShader[tilingMode]);
            } else {
                this._renderNormal(sprite, this.normalShader[tilingMode]);
            }
        }

        _renderNormal(sprite: Sprite, shader: PictureShader) {
            const renderer = this.renderer;
            renderer.bindShader(shader);
            renderer.state.setBlendMode(sprite.blendMode);
            this._renderInner(sprite, shader);
        }

        _renderBlend(sprite: Sprite, shader: PictureShader) {
            //nothing there yet
            const renderer = this.renderer;
            const spriteBounds = sprite.getBounds();
            const renderTarget = renderer._activeRenderTarget;
            const matrix = renderTarget.projectionMatrix;
            const flipX = matrix.a < 0;
            const flipY = matrix.d < 0;
            const resolution = renderTarget.resolution;
            const screen = this._tempRect;
            const fr = renderTarget.sourceFrame || renderTarget.destinationFrame;
            screen.x = 0;
            screen.y = 0;
            screen.width = fr.width;
            screen.height = fr.height;

            const bounds = this._tempRect2;
            const fbw = fr.width * resolution, fbh = fr.height * resolution;
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

            const screenBounds = this._tempRect3;
            const x_1 = Math.floor(Math.max(screen.x, bounds.x));
            const x_2 = Math.ceil(Math.min(screen.x + screen.width, bounds.x + bounds.width));
            const y_1 = Math.floor(Math.max(screen.y, bounds.y));
            const y_2 = Math.ceil(Math.min(screen.y + screen.height, bounds.y + bounds.height));
            const pixelsWidth = x_2 - x_1;
            const pixelsHeight = y_2 - y_1;
            if (pixelsWidth <= 0 || pixelsHeight <= 0) {
                //culling
                return;
            }
            //TODO: padding
            const rt = this._getRenderTexture(pixelsWidth, pixelsHeight);
            renderer.bindTexture(rt, 1, true);
            const gl = renderer.gl;
            if (renderer.renderingToScreen && renderTarget.root) {
                const buf = this._getBuf(pixelsWidth * pixelsHeight * 4);
                gl.readPixels(x_1, y_1, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
                //REVERT Y?
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, pixelsWidth, pixelsHeight, gl.RGBA, gl.UNSIGNED_BYTE, this._bigBuf);
            } else {
                gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, x_1, y_1, pixelsWidth, pixelsHeight);
            }

            renderer.bindShader(shader);
            renderer.state.setBlendMode(PIXI.BLEND_MODES.NORMAL);
            if (shader.uniforms.mapMatrix) {
                const mapMatrix = this._tempMatrix;
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
        }

        _renderInner(sprite: Sprite, shader: PictureShader) {
            const renderer = this.renderer;
            if (shader.tilingMode > 0) {
                this._renderWithShader(sprite as TilingSprite, shader.tilingMode === 1, shader);
            } else {
                this._renderSprite(sprite, shader);
            }
        }

        _renderWithShader(ts: TilingSprite, isSimple: boolean, shader: PictureShader) {
            const quad = shader.tempQuad;
            const renderer = this.renderer;
            renderer.bindVao(quad.vao);
            let vertices = quad.vertices;

            const _width: number = (ts as any)._width;
            const _height: number = (ts as any)._height;
            const _anchorX: number = (ts as any)._anchor._x;
            const _anchorY: number = (ts as any)._anchor._y;

            const w0 = _width * (1 - _anchorX);
            const w1 = _width * -_anchorX;

            const h0 = _height * (1 - _anchorY);
            const h1 = _height * -_anchorY;

            const wt = ts.transform.worldTransform;

            const a = wt.a;
            const b = wt.b;
            const c = wt.c;
            const d = wt.d;
            const tx = wt.tx;
            const ty = wt.ty;

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

            const tex = (ts as any)._texture;
            const lt = ts.tileTransform.localTransform;
            const uv = ts.uvTransform;
            const mapCoord : Matrix = (uv as any).mapCoord;
            const uClampFrame : Float32Array = (uv as any).uClampFrame;
            const uClampOffset : Float32Array = (uv as any).uClampOffset;

            const w = tex.width;
            const h = tex.height;
            const W = _width;
            const H = _height;

            const tempMat = this._tempMatrix2;

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
            if (isSimple) {
                tempMat.append(mapCoord);
            }
            else {
                shader.uniforms.uMapCoord = mapCoord.toArray(true);
                shader.uniforms.uClampFrame = uClampFrame;
                shader.uniforms.uClampOffset = uClampOffset;
            }
            shader.uniforms.uTransform = tempMat.toArray(true);

            const color = this._tempColor;
            const alpha = ts.worldAlpha;

            PIXI.utils.hex2rgb(ts.tint, color as any);
            color[0] *= alpha;
            color[1] *= alpha;
            color[2] *= alpha;
            color[3] = alpha;
            shader.uniforms.uColor = color;

            renderer.bindTexture(tex, 0, true);
            quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
        }

        _renderSprite(sprite: Sprite, shader: PictureShader) {
            const renderer = this.renderer;
            const quad = shader.tempQuad;
            renderer.bindVao(quad.vao);
            const uvs : TextureUvs = (sprite.texture as any)._uvs;

            //sprite already has calculated the vertices. lets transfer them to quad

            const vertices = quad.vertices;
            const vd : Float32Array = sprite.vertexData;
            for (let i = 0; i < 8; i++) {
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

            const frame = sprite.texture.frame;
            const base = sprite.texture.baseTexture;
            const clamp = this._tempClamp;
            //clamping 0.5 pixel from each side to reduce border artifact
            //this is our plugin main purpose
            const eps = 0.5 / base.resolution;
            clamp[0] = (frame.x + eps) / base.width;
            clamp[1] = (frame.y + eps) / base.height;
            clamp[2] = (frame.x + frame.width - eps) / base.width;
            clamp[3] = (frame.y + frame.height - eps) / base.height;
            //take a notice that size in pixels is realWidth,realHeight
            //width and height are divided by resolution
            shader.uniforms.uTextureClamp = clamp;

            const color = this._tempColor;
            PIXI.utils.hex2rgb(sprite.tint, color as any);
            const alpha = sprite.worldAlpha;
            //premultiplied alpha tint
            //of course we could do that in shader too
            color[0] *= alpha;
            color[1] *= alpha;
            color[2] *= alpha;
            color[3] = alpha;
            shader.uniforms.uColor = color;

            //bind texture to unit 0, our default sampler unit
            renderer.bindTexture(base, 0, true);
            quad.vao.draw(this.renderer.gl.TRIANGLES, 6, 0);
        }

        _isSimpleSprite(ts: Sprite): boolean {
            const renderer = this.renderer;
            const tex : Texture = (ts as any)._texture;
            const baseTex = tex.baseTexture;
            let isSimple = (baseTex as any).isPowerOfTwo && tex.frame.width === baseTex.width && tex.frame.height === baseTex.height;

            // auto, force repeat wrapMode for big tiling textures
            if (isSimple) {
                if (!(baseTex as any)._glTextures[renderer.CONTEXT_UID]) {
                    if (baseTex.wrapMode === WRAP_MODES.CLAMP) {
                        baseTex.wrapMode = WRAP_MODES.REPEAT;
                    }
                }
                else {
                    isSimple = baseTex.wrapMode !== WRAP_MODES.CLAMP;
                }
            }

            return isSimple;
        }
    }

    PIXI.WebGLRenderer.registerPlugin('picture', PictureRenderer);
    PIXI.CanvasRenderer.registerPlugin('picture', PIXI.CanvasSpriteRenderer as any);
}
