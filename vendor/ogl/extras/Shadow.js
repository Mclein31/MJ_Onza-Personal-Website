import{Camera as m}from"../core/Camera.js";import{Program as l}from"../core/Program.js";import{RenderTarget as c}from"../core/RenderTarget.js";class x{constructor(r,{light:t=new m(r),width:i=1024,height:a=i}){this.gl=r,this.light=t,this.target=new c(r,{width:i,height:a}),this.targetUniform={value:this.target.texture},this.depthProgram=new l(r,{vertex:e,fragment:o,cullFace:!1}),this.castMeshes=[]}add({mesh:r,receive:t=!0,cast:i=!0,vertex:a=e,fragment:s=o,uniformProjection:g="shadowProjectionMatrix",uniformView:h="shadowViewMatrix",uniformTexture:p="tShadow"}){if(t&&!r.program.uniforms[g]&&(r.program.uniforms[g]={value:this.light.projectionMatrix},r.program.uniforms[h]={value:this.light.viewMatrix},r.program.uniforms[p]=this.targetUniform),!!i&&(this.castMeshes.push(r),r.colorProgram=r.program,!r.depthProgram)){if(a===e&&s===o){r.depthProgram=this.depthProgram;return}r.depthProgram=new l(this.gl,{vertex:a,fragment:s,cullFace:!1})}}setSize({width:r=1024,height:t=r}){this.target=new c(this.gl,{width:r,height:t}),this.targetUniform.value=this.target.texture}render({scene:r}){r.traverse(t=>{t.draw&&(~this.castMeshes.indexOf(t)?t.program=t.depthProgram:(t.isForceVisibility=t.visible,t.visible=!1))}),this.gl.renderer.render({scene:r,camera:this.light,target:this.target}),r.traverse(t=>{t.draw&&(~this.castMeshes.indexOf(t)?t.program=t.colorProgram:t.visible=t.isForceVisibility)})}}const e=`
    attribute vec3 position;
    attribute vec2 uv;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;

    void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`,o=`
    precision highp float;

    vec4 packRGBA (float v) {
        vec4 pack = fract(vec4(1.0, 255.0, 65025.0, 16581375.0) * v);
        pack -= pack.yzww * vec2(1.0 / 255.0, 0.0).xxxy;
        return pack;
    }

    void main() {
        gl_FragColor = packRGBA(gl_FragCoord.z);
    }
`;export{x as Shadow};
