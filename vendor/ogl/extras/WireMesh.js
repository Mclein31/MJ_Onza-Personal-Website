import{Mesh as w}from"../core/Mesh.js";import{Program as h}from"../core/Program.js";import{Geometry as g}from"../core/Geometry.js";import{Color as p}from"../math/Color.js";class P extends w{constructor(e,{geometry:o,wireColor:r=new p(0,.75,.5),...s}={}){const m=new h(e,{vertex:M,fragment:x,uniforms:{wireColor:{value:r}}}),a=o.attributes.position.data,c=[],u=new Set;function l(t){for(let i=0;i<t.length;i+=2)v(t[i]*3,t[i+1]*3,a,u)&&c.push(t[i],t[i+1])}if(o.attributes.index){const t=o.attributes.index.data;for(let i=0;i<t.length;i+=3)l([t[i],t[i+1],t[i+1],t[i+2],t[i+2],t[i]])}else{const t=Math.floor(a.length/3);for(let i=0;i<t;i+=3)l([i,i+1,i+1,i+2,i+2,i])}const f=c.length>65536?new Uint32Array(c):new Uint16Array(c),d=new g(e,{position:{...o.attributes.position},index:{data:f}});super(e,{...s,mode:e.LINES,geometry:d,program:m})}}function v(n,e,o,r){const s=[o[n],o[n+1],o[n+2],o[e],o[e+1],o[e+2]].join("#"),m=[o[e],o[e+1],o[e+2],o[n],o[n+1],o[n+2]].join("#"),a=r.size;return r.add(s),r.add(m),r.size-a===2}const M=`
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,x=`
precision highp float;
uniform vec3 wireColor;

void main() {    
    gl_FragColor = vec4(wireColor, 1.0);
}
`;export{P as WireMesh};
