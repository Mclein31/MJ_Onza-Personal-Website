import{Mesh as l}from"../../core/Mesh.js";import{Program as u}from"../../core/Program.js";import{Geometry as v}from"../../core/Geometry.js";import{Vec3 as d}from"../../math/Vec3.js";class F extends l{constructor(r,{size:i=10,divisions:c=10,color:m=new d(.75,.75,.75),...s}={}){const a=(i+1)*2*2,n=new Float32Array(a*3),o=i/2;for(let t=0;t<=c;t++){const e=t/c*i-o;n.set([e,0,-o,e,0,o],t*12),n.set([-o,0,e,o,0,e],t*12+6)}const p=new v(r,{position:{size:3,data:n}}),f=new u(r,{vertex:x,fragment:w,uniforms:{color:{value:m}}});super(r,{...s,mode:r.LINES,geometry:p,program:f})}}const x=`
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,w=`
precision highp float;
uniform vec3 color;

void main() {    
    gl_FragColor = vec4(color, 1.0);
}
`;export{F as GridHelper};
