import{Mesh as w}from"../../core/Mesh.js";import{Program as d}from"../../core/Program.js";import{Geometry as g}from"../../core/Geometry.js";import{Vec3 as e}from"../../math/Vec3.js";class F extends w{constructor(o,{size:i=1,symmetric:s=!1,xColor:n=new e(.96,.21,.32),yColor:a=new e(.44,.64,.11),zColor:c=new e(.18,.52,.89),...m}={}){const r=s?-i:0,t=i,v=new Float32Array([r,0,0,t,0,0,0,r,0,0,t,0,0,0,r,0,0,t]),p=new Float32Array([...n,...n,...a,...a,...c,...c]),l=new g(o,{position:{size:3,data:v},color:{size:3,data:p}}),f=new d(o,{vertex:x,fragment:u});super(o,{...m,mode:o.LINES,geometry:l,program:f})}}const x=`
attribute vec3 position;
attribute vec3 color;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;

void main() {    
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,u=`
precision highp float;
varying vec3 vColor;

void main() {    
    gl_FragColor = vec4(vColor, 1.0);
}
`;export{F as AxesHelper};
