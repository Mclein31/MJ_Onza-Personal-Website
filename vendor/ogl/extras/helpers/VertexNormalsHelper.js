import{Mesh as g}from"../../core/Mesh.js";import{Program as y}from"../../core/Program.js";import{Geometry as b}from"../../core/Geometry.js";import{Vec3 as z}from"../../math/Vec3.js";import{Mat3 as N}from"../../math/Mat3.js";class V extends g{constructor(r,{size:u=.1,color:p=new z(.86,.16,.86),...d}={}){const t=r.gl,a=r.geometry.attributes.normal.count,n=new Float32Array(a*2*3),s=new Float32Array(a*2*3),m=new Float32Array(a*2),x=r.geometry.attributes.normal.data,w=r.geometry.attributes.position.data,v=new Float32Array([0,u]);for(let o=0;o<a;o++){const e=o*6,i=o*3,l=w.subarray(i,i+3);n.set(l,e),n.set(l,e+3);const c=x.subarray(i,i+3);s.set(c,e),s.set(c,e+3),m.set(v,o*2)}const f=new b(t,{position:{size:3,data:n},normal:{size:3,data:s},size:{size:1,data:m}}),M=new y(t,{vertex:A,fragment:h,uniforms:{color:{value:p},worldNormalMatrix:{value:new N},objectWorldMatrix:{value:r.worldMatrix}}});super(t,{...d,mode:t.LINES,geometry:f,program:M}),this.object=r}draw(r){this.program.uniforms.worldNormalMatrix.value.getNormalMatrix(this.object.worldMatrix),super.draw(r)}}const A=`
attribute vec3 position;
attribute vec3 normal;
attribute float size;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 objectWorldMatrix;
uniform mat3 worldNormalMatrix;

void main() {
    vec3 n = normalize(worldNormalMatrix * normal) * size;
    vec3 p = (objectWorldMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * viewMatrix * vec4(p + n, 1.0);
}
`,h=`
precision highp float;
uniform vec3 color;

void main() {    
    gl_FragColor = vec4(color, 1.0);
}
`;export{V as VertexNormalsHelper};
