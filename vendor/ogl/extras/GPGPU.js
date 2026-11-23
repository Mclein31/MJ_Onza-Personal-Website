import{Program as f}from"../core/Program.js";import{Mesh as c}from"../core/Mesh.js";import{Texture as d}from"../core/Texture.js";import{RenderTarget as h}from"../core/RenderTarget.js";import{Triangle as l}from"./Triangle.js";class M{constructor(t,{data:s=new Float32Array(16),geometry:i=new l(t),type:a}){this.gl=t;const r=s;this.passes=[],this.geometry=i,this.dataLength=r.length/4,this.size=Math.pow(2,Math.ceil(Math.log(Math.ceil(Math.sqrt(this.dataLength)))/Math.LN2)),this.coords=new Float32Array(this.dataLength*2);for(let e=0;e<this.dataLength;e++){const m=e%this.size/this.size,p=Math.floor(e/this.size)/this.size;this.coords.set([m,p],e*2)}const o=(()=>{if(r.length===this.size*this.size*4)return r;{const e=new Float32Array(this.size*this.size*4);return e.set(r),e}})();this.uniform={value:new d(t,{image:o,target:t.TEXTURE_2D,type:t.FLOAT,format:t.RGBA,internalFormat:t.renderer.isWebgl2?t.RGBA32F:t.RGBA,wrapS:t.CLAMP_TO_EDGE,wrapT:t.CLAMP_TO_EDGE,generateMipmaps:!1,minFilter:t.NEAREST,magFilter:t.NEAREST,width:this.size,flipY:!1})};const n={width:this.size,height:this.size,type:a||t.HALF_FLOAT||t.renderer.extensions.OES_texture_half_float.HALF_FLOAT_OES,format:t.RGBA,internalFormat:t.renderer.isWebgl2?a===t.FLOAT?t.RGBA32F:t.RGBA16F:t.RGBA,minFilter:t.NEAREST,depth:!1,unpackAlignment:1};this.fbo={read:new h(t,n),write:new h(t,n),swap:()=>{let e=this.fbo.read;this.fbo.read=this.fbo.write,this.fbo.write=e,this.uniform.value=this.fbo.read.texture}}}addPass({vertex:t=A,fragment:s=v,uniforms:i={},textureUniform:a="tMap",enabled:r=!0}={}){i[a]=this.uniform;const o=new f(this.gl,{vertex:t,fragment:s,uniforms:i}),e={mesh:new c(this.gl,{geometry:this.geometry,program:o}),program:o,uniforms:i,enabled:r,textureUniform:a};return this.passes.push(e),e}render(){this.passes.filter(s=>s.enabled).forEach((s,i)=>{this.gl.renderer.render({scene:s.mesh,target:this.fbo.write,clear:!1}),this.fbo.swap()})}}const A=`
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`,v=`
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;export{M as GPGPU};
