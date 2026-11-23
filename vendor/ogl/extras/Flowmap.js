import{RenderTarget as s}from"../core/RenderTarget.js";import{Program as v}from"../core/Program.js";import{Mesh as p}from"../core/Mesh.js";import{Vec2 as n}from"../math/Vec2.js";import{Triangle as h}from"./Triangle.js";class O{constructor(e,{size:i=128,falloff:u=.3,alpha:m=1,dissipation:l=.98,type:r}={}){const t=this;this.gl=e,this.uniform={value:null},this.mask={read:null,write:null,swap:()=>{let o=t.mask.read;t.mask.read=t.mask.write,t.mask.write=o,t.uniform.value=t.mask.read.texture}},f(),this.aspect=1,this.mouse=new n,this.velocity=new n,this.mesh=c();function f(){r||(r=e.HALF_FLOAT||e.renderer.extensions.OES_texture_half_float.HALF_FLOAT_OES);let o=e.renderer.isWebgl2||e.renderer.extensions[`OES_texture_${r===e.FLOAT?"":"half_"}float_linear`]?e.LINEAR:e.NEAREST;const a={width:i,height:i,type:r,format:e.RGBA,internalFormat:e.renderer.isWebgl2?r===e.FLOAT?e.RGBA32F:e.RGBA16F:e.RGBA,minFilter:o,depth:!1};t.mask.read=new s(e,a),t.mask.write=new s(e,a),t.mask.swap()}function c(){return new p(e,{geometry:new h(e),program:new v(e,{vertex:A,fragment:d,uniforms:{tMap:t.uniform,uFalloff:{value:u*.5},uAlpha:{value:m},uDissipation:{value:l},uAspect:{value:1},uMouse:{value:t.mouse},uVelocity:{value:t.velocity}},depthTest:!1})})}}update(){this.mesh.program.uniforms.uAspect.value=this.aspect,this.gl.renderer.render({scene:this.mesh,target:this.mask.write,clear:!1}),this.mask.swap()}}const A=`
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`,d=`
    precision highp float;

    uniform sampler2D tMap;

    uniform float uFalloff;
    uniform float uAlpha;
    uniform float uDissipation;
    
    uniform float uAspect;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;

    varying vec2 vUv;

    void main() {
        vec4 color = texture2D(tMap, vUv) * uDissipation;

        vec2 cursor = vUv - uMouse;
        cursor.x *= uAspect;

        vec3 stamp = vec3(uVelocity * vec2(1, -1), 1.0 - pow(1.0 - min(1.0, length(uVelocity)), 3.0));
        float falloff = smoothstep(uFalloff, 0.0, length(cursor)) * uAlpha;

        color.rgb = mix(color.rgb, stamp, vec3(falloff));

        gl_FragColor = color;
    }
`;export{O as Flowmap};
