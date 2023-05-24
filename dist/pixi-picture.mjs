/*!
 * @pixi/picture - v4.0.1
 * Compiled Wed, 24 May 2023 22:39:31 UTC
 *
 * @pixi/picture is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2023, Ivan Popelyshev, All Rights Reserved
 */import{Filter as R,BLEND_MODES as a,CLEAR_MODES as C,FilterState as X,TextureSystem as q,FilterSystem as D}from"@pixi/core";import{Sprite as J}from"@pixi/sprite";import{TilingSprite as Q}from"@pixi/sprite-tiling";import{Matrix as A}from"@pixi/math";class k extends R{constructor(){super(...arguments),this.backdropUniformName=null,this.trivial=!1,this._backdropActive=!1,this.clearColor=null}}const Z=`
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
}`;class E extends k{constructor(e){let n=Z;n=n.replace("%UNIFORM_CODE%",e.uniformCode||""),n=n.replace("%BLEND_CODE%",e.blendCode||""),super(void 0,n,e.uniforms),this.backdropUniformName="uBackdrop"}}const ee=`
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

`;class N extends R{constructor(e,n){const i=n||{};i.flipY||(i.flipY=new Float32Array([0,1])),super(ee,e,i)}}var M=(r=>(r[r.RED=0]="RED",r[r.GREEN=1]="GREEN",r[r.BLUE=2]="BLUE",r[r.ALPHA=3]="ALPHA",r))(M||{});class Y{constructor(e=!1,n=3){this.maskBefore=e,this.uniformCode="uniform vec4 uChannel;",this.uniforms={uChannel:new Float32Array([0,0,0,0])},this.blendCode="b_res = dot(b_src, uChannel) * b_dest;",this.safeFlipY=!1,this.uniforms.uChannel[n]=1}}const re=new Float32Array([0,1]),x=class extends E{constructor(r,e=new Y){super(e),this.baseFilter=r,this.config=e,this.padding=r.padding,this.safeFlipY=e.safeFlipY}apply(r,e,n,i){const o=r.getFilterTexture(e);if(this.config.maskBefore){const{blendMode:t}=this.state;this.state.blendMode=a.NONE,r.applyFilter(this,e,o,C.YES),this.baseFilter.blendMode=t,this.baseFilter.apply(r,o,n,i),this.state.blendMode=t}else{const{uBackdrop:t,uBackdrop_flipY:s}=this.uniforms;if(s[1]>0||this.safeFlipY)this.baseFilter.apply(r,t,o,C.YES);else{const p=r.getFilterTexture(e);x._flipYFilter||(x._flipYFilter=new N),x._flipYFilter.uniforms.flipY[0]=s[0],x._flipYFilter.uniforms.flipY[1]=s[1],x._flipYFilter.apply(r,t,p,C.YES),this.baseFilter.apply(r,p,o,C.YES),r.returnFilterTexture(p),this.uniforms.uBackdrop_flipY=re}this.uniforms.uBackdrop=o,r.applyFilter(this,e,n,i),this.uniforms.uBackdrop=t,this.uniforms.uBackdrop_flipY=s}r.returnFilterTexture(o)}};let P=x;P._flipYFilter=null;const v=`if (b_src.a == 0.0) {
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
`,w={blendCode:v,npmBlendCode:"vec3 B = blend * base;"},U={blendCode:v,npmBlendCode:"vec3 B = blendOverlay(base, blend);",uniformCode:`
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
`},I={blendCode:v,npmBlendCode:"vec3 B = blendHardLightVec3(base, blend);",uniformCode:`
float blendHardLight(float base, float blend)
{
    return mix((1.0-2.0*(1.0-base)*(1.0-blend)), 2.0*base*blend, 1.0 - step(blend, 0.5));
}

vec3 blendHardLightVec3(vec3 base, vec3 blend) 
{
    return vec3(blendHardLight(base.r,blend.r),blendHardLight(base.g,blend.g),blendHardLight(base.b,blend.b));
}`},V={blendCode:v,npmBlendCode:"vec3 B = blendSoftLightVec3(blend, base);",uniformCode:`
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
`},H={blendCode:v,npmBlendCode:"vec3 B = blendDarkenVec3(blend, base);",uniformCode:`
float blendDarken(float base, float blend)
{
    return min(blend,base);
}

vec3 blendDarkenVec3(vec3 base, vec3 blend)
{
    return vec3(blendDarken(base.r,blend.r),blendDarken(base.g,blend.g),blendDarken(base.b,blend.b));
}
`},j={blendCode:v,npmBlendCode:"vec3 B = blendLightenVec3(blend, base);",uniformCode:`
float blendLighten(float base, float blend)
{
    return max(blend,base);
}

vec3 blendLightenVec3(vec3 base, vec3 blend)
{
    return vec3(blendLighten(base.r,blend.r),blendLighten(base.g,blend.g),blendLighten(base.b,blend.b));
}
`},G={blendCode:v,npmBlendCode:"vec3 B = blendColorDodge(blend, base);",uniformCode:`
float blendColorDodge(float base, float blend) {
    return (blend==1.0)?blend:min(base/(1.0-blend),1.0);
}

vec3 blendColorDodge(vec3 base, vec3 blend) {
    return vec3(blendColorDodge(base.r,blend.r),blendColorDodge(base.g,blend.g),blendColorDodge(base.b,blend.b));
}
`},z={blendCode:v,npmBlendCode:"vec3 B = blendColorBurn(blend, base);",uniformCode:`
float colorBurn(float base, float blend)
{
    return max((1.0-((1.0-base)/blend)),0.0);
}

vec3 blendColorBurn(vec3 base, vec3 blend)
{
    return vec3(colorBurn(base.r,blend.r),colorBurn(base.g,blend.g),colorBurn(base.b,blend.b));
}
`},f=[];f[a.MULTIPLY]=w,f[a.OVERLAY]=U,f[a.HARD_LIGHT]=I,f[a.SOFT_LIGHT]=V,f[a.DARKEN]=H,f[a.LIGHTEN]=j,f[a.COLOR_DODGE]=G,f[a.COLOR_BURN]=z;for(const r in f){const e=f[r];e.npmBlendCode&&(e.blendCode=e.blendCode.replace("%NPM_BLEND%",e.npmBlendCode))}const _=[],S=[],b=new Array(32);b[a.NORMAL]=!0,b[a.ADD]=!0,b[a.SCREEN]=!0,b[a.DST_OUT]=!0,b[a.DST_IN]=!0,b[a.DST_OVER]=!0,b[a.DST_ATOP]=!0,b[a.SRC_OUT]=!0,b[a.SRC_IN]=!0,b[a.SRC_OVER]=!0,b[a.SRC_ATOP]=!0,b[a.SRC_OUT]=!0,b[a.SRC_IN]=!0,b[a.SRC_OVER]=!0,b[a.XOR]=!0,b[a.SUBTRACT]=!0;function W(r){const e=b[r];return!e&&!f[r]?null:(_[r]||(e?(_[r]=new R,_[r].blendMode=r,_[r].trivial=!0):_[r]=new E(f[r])),_[r])}function O(r){return f[r]?(S[r]||(S[r]=[W(r)]),S[r]):null}class te extends J{_render(e){const n=this._texture;if(!n||!n.valid)return;const i=O(this.blendMode),o=this.blendMode;if(i){if(e.batch.flush(),!e.filter.pushWithCheck(this,i))return;this.blendMode=a.NORMAL}this.calculateVertices(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),i&&(e.batch.flush(),e.filter.pop(),this.blendMode=o)}}class ne extends Q{_render(e){const n=this._texture;if(!n||!n.valid)return;const i=O(this.blendMode);i&&(e.batch.flush(),!e.filter.pushWithCheck(this,i))||(this.tileTransform.updateLocalTransform(),this.uvMatrix.update(),e.batch.setObjectRenderer(e.plugins[this.pluginName]),e.plugins[this.pluginName].render(this),i&&(e.batch.flush(),e.filter.pop()))}}function ie(r,e){const n=e.x+e.width,i=e.y+e.height,o=r.x+r.width,t=r.y+r.height;return e.x>=r.x&&e.x<=o&&e.y>=r.y&&e.y<=t&&n>=r.x&&n<=o&&i>=r.y&&i<=t}function oe(r,e=0){const{gl:n}=this;this.currentLocation!==e&&(this.currentLocation=e,n.activeTexture(n.TEXTURE0+e)),this.bind(r,e)}const le=new A;function se(r,e,n=!0){const i=this.renderer,o=this.defaultFilterStack,t=this.statePool.pop()||new X,s=this.renderer.renderTexture;let p=e[0].resolution,d=e[0].padding,m=e[0].autoFit,g=e[0].legacy;for(let h=1;h<e.length;h++){const F=e[h];p=Math.min(p,F.resolution),d=this.useMaxPadding?Math.max(d,F.padding):d+F.padding,m=m&&F.autoFit,g=g||F.legacy}o.length===1&&(this.defaultFilterStack[0].renderTexture=s.current),o.push(t),t.resolution=p,t.legacy=g,t.target=r,t.sourceFrame.copyFrom(r.filterArea||r.getBounds(!0)),t.sourceFrame.pad(d);let l=!0;if(m){const h=this.tempRect.copyFrom(s.sourceFrame);i.projection.transform&&this.transformAABB(le.copyFrom(i.projection.transform).invert(),h),t.sourceFrame.fit(h)}else l=ie(this.renderer.renderTexture.sourceFrame,t.sourceFrame);if(n&&t.sourceFrame.width<=1&&t.sourceFrame.height<=1)return o.pop(),t.clear(),this.statePool.push(t),!1;if(this.roundFrame(t.sourceFrame,s.current?s.current.resolution:i.resolution,s.sourceFrame,s.destinationFrame,i.projection.transform),t.sourceFrame.ceil(p),l){let h=null,F=null;for(let T=0;T<e.length;T++){const B=e[T].backdropUniformName;if(B){const{uniforms:y}=e[T];y[`${B}_flipY`]||(y[`${B}_flipY`]=new Float32Array([0,1]));const L=y[`${B}_flipY`];h===null?(h=this.prepareBackdrop(t.sourceFrame,L),F=L):(L[0]=F[0],L[1]=F[1]),y[B]=h,h&&(e[T]._backdropActive=!0)}}h&&(p=t.resolution=h.resolution)}t.renderTexture=this.getOptimalFilterTexture(t.sourceFrame.width,t.sourceFrame.height,p),t.filters=e,t.destinationFrame.width=t.renderTexture.width,t.destinationFrame.height=t.renderTexture.height;const u=this.tempRect;u.x=0,u.y=0,u.width=t.sourceFrame.width,u.height=t.sourceFrame.height,t.renderTexture.filterFrame=t.sourceFrame,t.bindingSourceFrame.copyFrom(s.sourceFrame),t.bindingDestinationFrame.copyFrom(s.destinationFrame),t.transform=i.projection.transform,i.projection.transform=null,s.bind(t.renderTexture,t.sourceFrame,u);const c=e[e.length-1].clearColor;return c?i.framebuffer.clear(c[0],c[1],c[2],c[3]):i.framebuffer.clear(0,0,0,0),!0}function ae(r,e){return this.pushWithCheck(r,e,!1)}function de(){const r=this.defaultFilterStack,e=r.pop(),n=e.filters;this.activeState=e;const i=this.globalUniforms.uniforms;i.outputFrame=e.sourceFrame,i.resolution=e.resolution;const o=i.inputSize,t=i.inputPixel,s=i.inputClamp;if(o[0]=e.destinationFrame.width,o[1]=e.destinationFrame.height,o[2]=1/o[0],o[3]=1/o[1],t[0]=o[0]*e.resolution,t[1]=o[1]*e.resolution,t[2]=1/t[0],t[3]=1/t[1],s[0]=.5*t[2],s[1]=.5*t[3],s[2]=e.sourceFrame.width*o[2]-.5*t[2],s[3]=e.sourceFrame.height*o[3]-.5*t[3],e.legacy){const l=i.filterArea;l[0]=e.destinationFrame.width,l[1]=e.destinationFrame.height,l[2]=e.sourceFrame.x,l[3]=e.sourceFrame.y,i.filterClamp=i.inputClamp}this.globalUniforms.update();const p=r[r.length-1];e.renderTexture.framebuffer.multisample>1&&this.renderer.framebuffer.blit();let d=n.length,m=null;if(d>=2&&n[d-1].trivial&&(m=n[d-2].state,n[d-2].state=n[d-1].state,d--),d===1)n[0].apply(this,e.renderTexture,p.renderTexture,C.BLEND,e),this.returnFilterTexture(e.renderTexture);else{let l=e.renderTexture,u=this.getOptimalFilterTexture(l.width,l.height,e.resolution);u.filterFrame=l.filterFrame;let c=0;for(c=0;c<d-1;++c){n[c].apply(this,l,u,C.CLEAR,e);const h=l;l=u,u=h}n[c].apply(this,l,p.renderTexture,C.BLEND,e),this.returnFilterTexture(l),this.returnFilterTexture(u)}m&&(n[d-1].state=m);let g=!1;for(let l=0;l<n.length;l++)if(n[l]._backdropActive){const u=n[l].backdropUniformName;g||(this.returnFilterTexture(n[l].uniforms[u]),g=!0),n[l].uniforms[u]=null,n[l]._backdropActive=!1}e.clear(),this.statePool.push(e)}let $=!1;function ue(r,e){const n=this.renderer,i=n.renderTexture.current,o=this.renderer.renderTexture.sourceFrame,t=n.projection.transform||A.IDENTITY;let s=1;if(i)s=i.baseTexture.resolution,e[1]=1;else{if(this.renderer.background.alpha>=1)return $||($=!0,console.warn("pixi-picture: you are trying to use Blend Filter on main framebuffer!"),console.warn("pixi-picture: please set backgroundAlpha=0 in renderer creation params")),null;s=n.resolution,e[1]=-1}const p=Math.round((r.x-o.x+t.tx)*s),d=r.y-o.y+t.ty,m=Math.round((e[1]<0?o.height-(d+r.height):d)*s),g=Math.round(r.width*s),l=Math.round(r.height*s),u=n.gl,c=this.getOptimalFilterTexture(g,l,1);return e[1]<0&&(e[0]=l/c.height),c.filterFrame=o,c.setResolution(s),n.texture.bindForceLocation(c.baseTexture,0),u.copyTexSubImage2D(u.TEXTURE_2D,0,0,0,p,m,g,l),c}function K(){q.prototype.bindForceLocation=oe,D.prototype.push=ae,D.prototype.pushWithCheck=se,D.prototype.pop=de,D.prototype.prepareBackdrop=ue}K();export{v as BLEND_OPACITY,k as BackdropFilter,E as BlendFilter,z as COLOR_BURN_PART,G as COLOR_DODGE_PART,H as DARKEN_PART,N as FlipYFilter,I as HARDLIGHT_PART,j as LIGHTEN_PART,M as MASK_CHANNEL,w as MULTIPLY_PART,Y as MaskConfig,P as MaskFilter,U as OVERLAY_PART,V as SOFTLIGHT_PART,te as Sprite,ne as TilingSprite,K as applyMixins,f as blendPartsArray,W as getBlendFilter,O as getBlendFilterArray};
//# sourceMappingURL=pixi-picture.mjs.map
