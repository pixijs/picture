/*!
 * @pixi/picture - v4.0.1
 * Compiled Wed, 24 May 2023 22:39:31 UTC
 *
 * @pixi/picture is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2023, Ivan Popelyshev, All Rights Reserved
 */this.PIXI=this.PIXI||{},this.PIXI.picture=function(d,i,W,K,R){"use strict";class N extends i.Filter{constructor(){super(...arguments),this.backdropUniformName=null,this.trivial=!1,this._backdropActive=!1,this.clearColor=null}}const $=`
varying vec2 vTextureCoord;

uniform sampler2D uSampler;
uniform sampler2D uBackdrop;
uniform vec2 uBackdrop_flipY;

%UNIFORM_CODE%

void main(void)
{
   vec2 backdropCoord = vec2(vTextureCoord.x, uBackdrop_flipY.x + uBackdrop_flipY.y * vTextureCoord.y);
   vec4 b_src = texture2D(uSampler, vTextureCoord);
   vec4 b_dest = texture2D(uBackdrop, backdropCoord);
   vec4 b_res = b_dest;
   
   %BLEND_CODE%

   gl_FragColor = b_res;
}`;class O extends N{constructor(e){let n=$;n=n.replace("%UNIFORM_CODE%",e.uniformCode||""),n=n.replace("%BLEND_CODE%",e.blendCode||""),super(void 0,n,e.uniforms),this.backdropUniformName="uBackdrop"}}const q=`
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;

varying vec2 vTextureCoord;

uniform vec4 inputSize;
uniform vec4 outputFrame;
uniform vec2 flipY;

vec4 filterVertexPosition( void )
{
    vec2 position = aVertexPosition * max(outputFrame.zw, vec2(0.)) + outputFrame.xy;

    return vec4((projectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aVertexPosition * (outputFrame.zw * inputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vTextureCoord.y = flipY.x + flipY.y * vTextureCoord.y;
}

`;class x extends i.Filter{constructor(e,n){const l=n||{};l.flipY||(l.flipY=new Float32Array([0,1])),super(q,e,l)}}var y=(t=>(t[t.RED=0]="RED",t[t.GREEN=1]="GREEN",t[t.BLUE=2]="BLUE",t[t.ALPHA=3]="ALPHA",t))(y||{});class A{constructor(e=!1,n=3){this.maskBefore=e,this.uniformCode="uniform vec4 uChannel;",this.uniforms={uChannel:new Float32Array([0,0,0,0])},this.blendCode="b_res = dot(b_src, uChannel) * b_dest;",this.safeFlipY=!1,this.uniforms.uChannel[n]=1}}const J=new Float32Array([0,1]),D=class extends O{constructor(t,e=new A){super(e),this.baseFilter=t,this.config=e,this.padding=t.padding,this.safeFlipY=e.safeFlipY}apply(t,e,n,l){const a=t.getFilterTexture(e);if(this.config.maskBefore){const{blendMode:r}=this.state;this.state.blendMode=i.BLEND_MODES.NONE,t.applyFilter(this,e,a,i.CLEAR_MODES.YES),this.baseFilter.blendMode=r,this.baseFilter.apply(t,a,n,l),this.state.blendMode=r}else{const{uBackdrop:r,uBackdrop_flipY:o}=this.uniforms;if(o[1]>0||this.safeFlipY)this.baseFilter.apply(t,r,a,i.CLEAR_MODES.YES);else{const p=t.getFilterTexture(e);D._flipYFilter||(D._flipYFilter=new x),D._flipYFilter.uniforms.flipY[0]=o[0],D._flipYFilter.uniforms.flipY[1]=o[1],D._flipYFilter.apply(t,r,p,i.CLEAR_MODES.YES),this.baseFilter.apply(t,p,a,i.CLEAR_MODES.YES),t.returnFilterTexture(p),this.uniforms.uBackdrop_flipY=J}this.uniforms.uBackdrop=a,t.applyFilter(this,e,n,l),this.uniforms.uBackdrop=r,this.uniforms.uBackdrop_flipY=o}t.returnFilterTexture(a)}};let P=D;P._flipYFilter=null;const _=`if (b_src.a == 0.0) {
  gl_FragColor = vec4(0, 0, 0, 0);
  return;
}
if (b_dest.a == 0.0) {
  gl_FragColor = b_src;
  return;
}
vec3 base = b_dest.rgb / b_dest.a;
vec3 blend = b_src.rgb / b_src.a;
%NPM_BLEND%
// SWAP SRC WITH NPM BLEND
vec3 new_src = (1.0 - b_dest.a) * blend + b_dest.a * B;
// PORTER DUFF PMA COMPOSITION MODE
b_res.a = b_src.a + b_dest.a * (1.0-b_src.a);
b_res.rgb = b_src.a * new_src + (1.0 - b_src.a) * b_dest.rgb;
`,k={blendCode:_,npmBlendCode:"vec3 B = blend * base;"},Y={blendCode:_,npmBlendCode:"vec3 B = blendOverlay(base, blend);",uniformCode:`
float finalBlendOverlay(float base, float blend) 
{
    return mix((1.0-2.0*(1.0-base)*(1.0-blend)), (2.0*base*blend), step(base, 0.5));
}

vec3 blendOverlay(vec3 base, vec3 blend) 
{
    return vec3(
        finalBlendOverlay(base.r,blend.r),
        finalBlendOverlay(base.g,blend.g),
        finalBlendOverlay(base.b,blend.b)
    );
}
`},I={blendCode:_,npmBlendCode:"vec3 B = blendHardLightVec3(base, blend);",uniformCode:`
float blendHardLight(float base, float blend)
{
    return mix((1.0-2.0*(1.0-base)*(1.0-blend)), 2.0*base*blend, 1.0 - step(blend, 0.5));
}

vec3 blendHardLightVec3(vec3 base, vec3 blend) 
{
    return vec3(blendHardLight(base.r,blend.r),blendHardLight(base.g,blend.g),blendHardLight(base.b,blend.b));
}`},w={blendCode:_,npmBlendCode:"vec3 B = blendSoftLightVec3(blend, base);",uniformCode:`
float blendSoftLight(float base, float blend)
{
    if(blend < 0.5)
    {
        return 2.0*base*blend+base*base*(1.0-2.0*blend);
    }
    else
    {
        return sqrt(base)*(2.0*blend-1.0)+2.0*base*(1.0-blend);
    }
}

vec3 blendSoftLightVec3(vec3 base, vec3 blend)
{
    return vec3(blendSoftLight(base.r,blend.r),blendSoftLight(base.g,blend.g),blendSoftLight(base.b,blend.b));
}
`},H={blendCode:_,npmBlendCode:"vec3 B = blendDarkenVec3(blend, base);",uniformCode:`
float blendDarken(float base, float blend)
{
    return min(blend,base);
}

vec3 blendDarkenVec3(vec3 base, vec3 blend)
{
    return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}
`},U={blendCode:_,npmBlendCode:"vec3 B = blendLightenVec3(blend, base);",uniformCode:`
float blendLighten(float base, float blend)
{
    return max(blend,base);
}

vec3 blendLightenVec3(vec3 base, vec3 blend)
{
    return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}
`},V={blendCode:_,npmBlendCode:"vec3 B = blendColorDodge(blend, base);",uniformCode:`
float blendColorDodge(float base, float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}
`},G={blendCode:_,npmBlendCode:"vec3 B = blendColorBurn(blend, base);",uniformCode:`
float colorBurn(float base, float blend)
{
    return max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend)
{
    return vec3(colorBurn(base.r,blend.r),colorBurn(base.g,blend.g),colorBurn(base.b,blend.b));
}
`},m=[];m[i.BLEND_MODES.MULTIPLY]=k,m[i.BLEND_MODES.OVERLAY]=Y,m[i.BLEND_MODES.HARD_LIGHT]=I,m[i.BLEND_MODES.SOFT_LIGHT]=w,m[i.BLEND_MODES.DARKEN]=H,m[i.BLEND_MODES.LIGHTEN]=U,m[i.BLEND_MODES.COLOR_DODGE]=V,m[i.BLEND_MODES.COLOR_BURN]=G;for(const t in m){const e=m[t];e.npmBlendCode&&(e.blendCode=e.blendCode.replace("%NPM_BLEND%",e.npmBlendCode))}const C=[],S=[],u=new Array(32);u[i.BLEND_MODES.NORMAL]=!0,u[i.BLEND_MODES.ADD]=!0,u[i.BLEND_MODES.SCREEN]=!0,u[i.BLEND_MODES.DST_OUT]=!0,u[i.BLEND_MODES.DST_IN]=!0,u[i.BLEND_MODES.DST_OVER]=!0,u[i.BLEND_MODES.DST_ATOP]=!0,u[i.BLEND_MODES.SRC_OUT]=!0,u[i.BLEND_MODES.SRC_IN]=!0,u[i.BLEND_MODES.SRC_OVER]=!0,u[i.BLEND_MODES.SRC_ATOP]=!0,u[i.BLEND_MODES.SRC_OUT]=!0,u[i.BLEND_MODES.SRC_IN]=!0,u[i.BLEND_MODES.SRC_OVER]=!0,u[i.BLEND_MODES.XOR]=!0,u[i.BLEND_MODES.SUBTRACT]=!0;function j(t){const e=u[t];return!e&&!m[t]?null:(C[t]||(e?(C[t]=new i.Filter,C[t].blendMode=t,C[t].trivial=!0):C[t]=new O(m[t])),C[t])}function M(t){return m[t]?(S[t]||(S[t]=[j(t)]),S[t]):null}class Q extends W.Sprite{_render(e){const n=this._texture;if(!n||!n.valid)return;const l=M(this.blendMode),a=this.blendMode;if(l){if(e.batch.flush(),!e.filter.pushWithCheck(this,l))return;this.blendMode=i.BLEND_MODES.NORMAL}this.calculateVertices(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),l&&(e.batch.flush(),e.filter.pop(),this.blendMode=a)}}class Z extends K.TilingSprite{_render(e){const n=this._texture;if(!n||!n.valid)return;const l=M(this.blendMode);l&&(e.batch.flush(),!e.filter.pushWithCheck(this,l))||(this.tileTransform.updateLocalTransform(),this.uvMatrix.update(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),l&&(e.batch.flush(),e.filter.pop()))}}function ee(t,e){const n=e.x+e.width,l=e.y+e.height,a=t.x+t.width,r=t.y+t.height;return e.x>=t.x&&e.x<=a&&e.y>=t.y&&e.y<=r&&n>=t.x&&n<=a&&l>=t.y&&l<=r}function te(t,e=0){const{gl:n}=this;this.currentLocation!==e&&(this.currentLocation=e,n.activeTexture(n.TEXTURE0+e)),this.bind(t,e)}const re=new R.Matrix;function ne(t,e,n=!0){const l=this.renderer,a=this.defaultFilterStack,r=this.statePool.pop()||new i.FilterState,o=this.renderer.renderTexture;let p=e[0].resolution,b=e[0].padding,F=e[0].autoFit,g=e[0].legacy;for(let f=1;f<e.length;f++){const E=e[f];p=Math.min(p,E.resolution),b=this.useMaxPadding?Math.max(b,E.padding):b+E.padding,F=F&&E.autoFit,g=g||E.legacy}a.length===1&&(this.defaultFilterStack[0].renderTexture=o.current),a.push(r),r.resolution=p,r.legacy=g,r.target=t,r.sourceFrame.copyFrom(t.filterArea||t.getBounds(!0)),r.sourceFrame.pad(b);let s=!0;if(F){const f=this.tempRect.copyFrom(o.sourceFrame);l.projection.transform&&this.transformAABB(re.copyFrom(l.projection.transform).invert(),f),r.sourceFrame.fit(f)}else s=ee(this.renderer.renderTexture.sourceFrame,r.sourceFrame);if(n&&r.sourceFrame.width<=1&&r.sourceFrame.height<=1)return a.pop(),r.clear(),this.statePool.push(r),!1;if(this.roundFrame(r.sourceFrame,o.current?o.current.resolution:l.resolution,o.sourceFrame,o.destinationFrame,l.projection.transform),r.sourceFrame.ceil(p),s){let f=null,E=null;for(let T=0;T<e.length;T++){const B=e[T].backdropUniformName;if(B){const{uniforms:L}=e[T];L[`${B}_flipY`]||(L[`${B}_flipY`]=new Float32Array([0,1]));const v=L[`${B}_flipY`];f===null?(f=this.prepareBackdrop(r.sourceFrame,v),E=v):(v[0]=E[0],v[1]=E[1]),L[B]=f,f&&(e[T]._backdropActive=!0)}}f&&(p=r.resolution=f.resolution)}r.renderTexture=this.getOptimalFilterTexture(r.sourceFrame.width,r.sourceFrame.height,p),r.filters=e,r.destinationFrame.width=r.renderTexture.width,r.destinationFrame.height=r.renderTexture.height;const c=this.tempRect;c.x=0,c.y=0,c.width=r.sourceFrame.width,c.height=r.sourceFrame.height,r.renderTexture.filterFrame=r.sourceFrame,r.bindingSourceFrame.copyFrom(o.sourceFrame),r.bindingDestinationFrame.copyFrom(o.destinationFrame),r.transform=l.projection.transform,l.projection.transform=null,o.bind(r.renderTexture,r.sourceFrame,c);const h=e[e.length-1].clearColor;return h?l.framebuffer.clear(h[0],h[1],h[2],h[3]):l.framebuffer.clear(0,0,0,0),!0}function ie(t,e){return this.pushWithCheck(t,e,!1)}function le(){const t=this.defaultFilterStack,e=t.pop(),n=e.filters;this.activeState=e;const l=this.globalUniforms.uniforms;l.outputFrame=e.sourceFrame,l.resolution=e.resolution;const a=l.inputSize,r=l.inputPixel,o=l.inputClamp;if(a[0]=e.destinationFrame.width,a[1]=e.destinationFrame.height,a[2]=1/a[0],a[3]=1/a[1],r[0]=a[0]*e.resolution,r[1]=a[1]*e.resolution,r[2]=1/r[0],r[3]=1/r[1],o[0]=.5*r[2],o[1]=.5*r[3],o[2]=e.sourceFrame.width*a[2]-.5*r[2],o[3]=e.sourceFrame.height*a[3]-.5*r[3],e.legacy){const s=l.filterArea;s[0]=e.destinationFrame.width,s[1]=e.destinationFrame.height,s[2]=e.sourceFrame.x,s[3]=e.sourceFrame.y,l.filterClamp=l.inputClamp}this.globalUniforms.update();const p=t[t.length-1];e.renderTexture.framebuffer.multisample>1&&this.renderer.framebuffer.blit();let b=n.length,F=null;if(b>=2&&n[b-1].trivial&&(F=n[b-2].state,n[b-2].state=n[b-1].state,b--),b===1)n[0].apply(this,e.renderTexture,p.renderTexture,i.CLEAR_MODES.BLEND,e),this.returnFilterTexture(e.renderTexture);else{let s=e.renderTexture,c=this.getOptimalFilterTexture(s.width,s.height,e.resolution);c.filterFrame=s.filterFrame;let h=0;for(h=0;h<b-1;++h){n[h].apply(this,s,c,i.CLEAR_MODES.CLEAR,e);const f=s;s=c,c=f}n[h].apply(this,s,p.renderTexture,i.CLEAR_MODES.BLEND,e),this.returnFilterTexture(s),this.returnFilterTexture(c)}F&&(n[b-1].state=F);let g=!1;for(let s=0;s<n.length;s++)if(n[s]._backdropActive){const c=n[s].backdropUniformName;g||(this.returnFilterTexture(n[s].uniforms[c]),g=!0),n[s].uniforms[c]=null,n[s]._backdropActive=!1}e.clear(),this.statePool.push(e)}let X=!1;function ae(t,e){const n=this.renderer,l=n.renderTexture.current,a=this.renderer.renderTexture.sourceFrame,r=n.projection.transform||R.Matrix.IDENTITY;let o=1;if(l)o=l.baseTexture.resolution,e[1]=1;else{if(this.renderer.background.alpha>=1)return X||(X=!0,console.warn("pixi-picture: you are trying to use Blend Filter on main framebuffer!"),console.warn("pixi-picture: please set backgroundAlpha=0 in renderer creation params")),null;o=n.resolution,e[1]=-1}const p=Math.round((t.x-a.x+r.tx)*o),b=t.y-a.y+r.ty,F=Math.round((e[1]<0?a.height-(b+t.height):b)*o),g=Math.round(t.width*o),s=Math.round(t.height*o),c=n.gl,h=this.getOptimalFilterTexture(g,s,1);return e[1]<0&&(e[0]=s/h.height),h.filterFrame=a,h.setResolution(o),n.texture.bindForceLocation(h.baseTexture,0),c.copyTexSubImage2D(c.TEXTURE_2D,0,0,0,p,F,g,s),h}function z(){i.TextureSystem.prototype.bindForceLocation=te,i.FilterSystem.prototype.push=ie,i.FilterSystem.prototype.pushWithCheck=ne,i.FilterSystem.prototype.pop=le,i.FilterSystem.prototype.prepareBackdrop=ae}return z(),d.BLEND_OPACITY=_,d.BackdropFilter=N,d.BlendFilter=O,d.COLOR_BURN_PART=G,d.COLOR_DODGE_PART=V,d.DARKEN_PART=H,d.FlipYFilter=x,d.HARDLIGHT_PART=I,d.LIGHTEN_PART=U,d.MASK_CHANNEL=y,d.MULTIPLY_PART=k,d.MaskConfig=A,d.MaskFilter=P,d.OVERLAY_PART=Y,d.SOFTLIGHT_PART=w,d.Sprite=Q,d.TilingSprite=Z,d.applyMixins=z,d.blendPartsArray=m,d.getBlendFilter=j,d.getBlendFilterArray=M,d}({},PIXI,PIXI,PIXI,PIXI);
//# sourceMappingURL=pixi-picture.js.map
