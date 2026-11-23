import{Geometry as m}from"../core/Geometry.js";import{Program as y}from"../core/Program.js";import{Mesh as x}from"../core/Mesh.js";import{Vec2 as g}from"../math/Vec2.js";import{Vec3 as f}from"../math/Vec3.js";import{Color as w}from"../math/Color.js";const s=new f;class U{constructor(e,{points:t,vertex:h=A,fragment:v=P,uniforms:r={},attributes:l={}}){this.gl=e,this.points=t,this.count=t.length,this.position=new Float32Array(this.count*3*2),this.prev=new Float32Array(this.count*3*2),this.next=new Float32Array(this.count*3*2);const a=new Float32Array(this.count*1*2),c=new Float32Array(this.count*2*2),n=new Uint16Array((this.count-1)*3*2);for(let o=0;o<this.count;o++){a.set([-1,1],o*2);const u=o/(this.count-1);if(c.set([0,u,1,u],o*4),o===this.count-1)continue;const i=o*2;n.set([i+0,i+1,i+2],(i+0)*3),n.set([i+2,i+1,i+3],(i+1)*3)}const p=this.geometry=new m(e,Object.assign(l,{position:{size:3,data:this.position},prev:{size:3,data:this.prev},next:{size:3,data:this.next},side:{size:1,data:a},uv:{size:2,data:c},index:{size:1,data:n}}));this.updateGeometry(),r.uResolution||(this.resolution=r.uResolution={value:new g}),r.uDPR||(this.dpr=r.uDPR={value:1}),r.uThickness||(this.thickness=r.uThickness={value:1}),r.uColor||(this.color=r.uColor={value:new w("#000")}),r.uMiter||(this.miter=r.uMiter={value:1}),this.resize();const d=this.program=new y(e,{vertex:h,fragment:v,uniforms:r});this.mesh=new x(e,{geometry:p,program:d})}updateGeometry(){this.points.forEach((e,t)=>{e.toArray(this.position,t*3*2),e.toArray(this.position,t*3*2+3),t?(e.toArray(this.next,(t-1)*3*2),e.toArray(this.next,(t-1)*3*2+3)):(s.copy(e).sub(this.points[t+1]).add(e),s.toArray(this.prev,t*3*2),s.toArray(this.prev,t*3*2+3)),t===this.points.length-1?(s.copy(e).sub(this.points[t-1]).add(e),s.toArray(this.next,t*3*2),s.toArray(this.next,t*3*2+3)):(e.toArray(this.prev,(t+1)*3*2),e.toArray(this.prev,(t+1)*3*2+3))}),this.geometry.attributes.position.needsUpdate=!0,this.geometry.attributes.prev.needsUpdate=!0,this.geometry.attributes.next.needsUpdate=!0}resize(){this.resolution&&this.resolution.value.set(this.gl.canvas.width,this.gl.canvas.height),this.dpr&&(this.dpr.value=this.gl.renderer.dpr)}}const A=`
    precision highp float;

    attribute vec3 position;
    attribute vec3 next;
    attribute vec3 prev;
    attribute vec2 uv;
    attribute float side;

    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec2 uResolution;
    uniform float uDPR;
    uniform float uThickness;
    uniform float uMiter;

    varying vec2 vUv;

    vec4 getPosition() {
        mat4 mvp = projectionMatrix * modelViewMatrix;
        vec4 current = mvp * vec4(position, 1);
        vec4 nextPos = mvp * vec4(next, 1);
        vec4 prevPos = mvp * vec4(prev, 1);

        vec2 aspect = vec2(uResolution.x / uResolution.y, 1);    
        vec2 currentScreen = current.xy / current.w * aspect;
        vec2 nextScreen = nextPos.xy / nextPos.w * aspect;
        vec2 prevScreen = prevPos.xy / prevPos.w * aspect;
    
        vec2 dir1 = normalize(currentScreen - prevScreen);
        vec2 dir2 = normalize(nextScreen - currentScreen);
        vec2 dir = normalize(dir1 + dir2);
    
        vec2 normal = vec2(-dir.y, dir.x);
        normal /= mix(1.0, max(0.3, dot(normal, vec2(-dir1.y, dir1.x))), uMiter);
        normal /= aspect;

        float pixelWidthRatio = 1.0 / (uResolution.y / uDPR);
        float pixelWidth = current.w * pixelWidthRatio;
        normal *= pixelWidth * uThickness;
        current.xy -= normal * side;
    
        return current;
    }

    void main() {
        vUv = uv;
        gl_Position = getPosition();
    }
`,P=`
    precision highp float;

    uniform vec3 uColor;
    
    varying vec2 vUv;

    void main() {
        gl_FragColor.rgb = uColor;
        gl_FragColor.a = 1.0;
    }
`;export{U as Polyline};
