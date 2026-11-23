import{Mesh as N}from"../../core/Mesh.js";import{Program as b}from"../../core/Program.js";import{Geometry as F}from"../../core/Geometry.js";import{Vec3 as t}from"../../math/Vec3.js";import{Mat3 as j}from"../../math/Mat3.js";const a=new t,l=new t,e=new t,w=new t,v=new t;class E extends N{constructor(o,{size:M=.1,color:g=new t(.15,.86,.86),...y}={}){const i=o.gl,n=o.geometry.attributes.position.data,A=new Float32Array([0,M]),s=o.geometry.attributes.index,c=s?r=>s.data[r]:r=>r,f=s?s.data.length:Math.floor(n.length/3),d=Math.floor(f/3),p=new Float32Array(d*2*3),u=new Float32Array(d*2*3),x=new Float32Array(d*2);for(let r=0;r<f;r+=3){a.fromArray(n,c(r+0)*3),l.fromArray(n,c(r+1)*3),e.fromArray(n,c(r+2)*3),w.add(a,l).add(e).multiply(1/3),a.sub(a,l),e.sub(e,l),v.cross(e,a).normalize();const m=r*2;p.set(w,m),p.set(w,m+3),u.set(v,m),u.set(v,m+3),x.set(A,r/3*2)}const z=new F(i,{position:{size:3,data:p},normal:{size:3,data:u},size:{size:1,data:x}}),h=new b(i,{vertex:C,fragment:W,uniforms:{color:{value:g},worldNormalMatrix:{value:new j},objectWorldMatrix:{value:o.worldMatrix}}});super(i,{...y,mode:i.LINES,geometry:z,program:h}),this.object=o}draw(o){this.program.uniforms.worldNormalMatrix.value.getNormalMatrix(this.object.worldMatrix),super.draw(o)}}const C=`
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
`,W=`
precision highp float;
uniform vec3 color;

void main() {    
    gl_FragColor = vec4(color, 1.0);
}
`;export{E as FaceNormalsHelper};
