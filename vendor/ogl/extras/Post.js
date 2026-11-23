import{Program as p}from"../core/Program.js";import{Mesh as v}from"../core/Mesh.js";import{RenderTarget as f}from"../core/RenderTarget.js";import{Triangle as c}from"./Triangle.js";class H{constructor(e,{width:s,height:t,dpr:i,wrapS:n=e.CLAMP_TO_EDGE,wrapT:o=e.CLAMP_TO_EDGE,minFilter:a=e.LINEAR,magFilter:h=e.LINEAR,geometry:l=new c(e),targetOnly:r=null,depth:d=!0}={}){this.gl=e,this.passes=[],this.geometry=l,this.uniform={value:null},this.targetOnly=r,i&&(this.dpr=i),s&&(this.width=s),t&&(this.height=t),i=this.dpr||this.gl.renderer.dpr,this.resolutionWidth=Math.floor(this.width||this.gl.renderer.width*i),this.resolutionHeight=Math.floor(this.height||this.gl.renderer.height*i);let u={dpr:this.dpr,width:this.resolutionWidth,height:this.resolutionHeight,wrapS:n,wrapT:o,minFilter:a,magFilter:h,depth:d};const g=this.fbo={read:new f(this.gl,u),write:new f(this.gl,u),swap:()=>{let m=g.read;g.read=g.write,g.write=m}}}addPass({vertex:e=w,fragment:s=b,uniforms:t={},textureUniform:i="tMap",enabled:n=!0}={}){t[i]={value:this.fbo.read.texture};const o=new p(this.gl,{vertex:e,fragment:s,uniforms:t}),h={mesh:new v(this.gl,{geometry:this.geometry,program:o}),program:o,uniforms:t,enabled:n,textureUniform:i};return this.passes.push(h),h}resize({width:e,height:s,dpr:t}={}){t&&(this.dpr=t),e&&(this.width=e),s&&(this.height=s),t=this.dpr||this.gl.renderer.dpr,this.resolutionWidth=Math.floor(this.width||this.gl.renderer.width*t),this.resolutionHeight=Math.floor(this.height||this.gl.renderer.height*t),this.fbo.read.setSize(this.resolutionWidth,this.resolutionHeight),this.fbo.write.setSize(this.resolutionWidth,this.resolutionHeight)}render({scene:e,camera:s,texture:t,target:i=null,update:n=!0,sort:o=!0,frustumCull:a=!0,beforePostCallbacks:h}){const l=this.passes.filter(r=>r.enabled);t||(this.gl.renderer.render({scene:e,camera:s,target:l.length||!i&&this.targetOnly?this.fbo.write:i,update:n,sort:o,frustumCull:a}),this.fbo.swap(),h&&h.forEach(r=>r&&r())),l.forEach((r,d)=>{r.mesh.program.uniforms[r.textureUniform].value=!d&&t?t:this.fbo.read.texture,this.gl.renderer.render({scene:r.mesh,target:d===l.length-1&&(i||!this.targetOnly)?i:this.fbo.write,clear:!0}),this.fbo.swap()}),this.uniform.value=this.fbo.read.texture}}const w=`
    attribute vec2 uv;
    attribute vec2 position;

    varying vec2 vUv;

    void main() {
        vUv = uv;
        gl_Position = vec4(position, 0, 1);
    }
`,b=`
    precision highp float;

    uniform sampler2D tMap;
    varying vec2 vUv;

    void main() {
        gl_FragColor = texture2D(tMap, vUv);
    }
`;export{H as Post};
