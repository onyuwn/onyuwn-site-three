import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ShaderService { // TODO: fetch shaders from cosmos, storing in static strings here now

    basicRippleFrag: string = `
    #ifdef GL_ES
    precision mediump float;
    #endif
  
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
  
    uniform vec2 u_resolution;
    uniform float u_time;
    void main() {
        vec2 st = gl_FragCoord.xy/u_resolution;
        float dist = distance(st,vec2(0.5));
        vec3 color = vec3(dist);
        gl_FragColor = vec4(color, 1.0);
    }
    `;

    fisheyeFrag: string = `
    #ifdef GL_ES
    precision mediump float;
    #endif
  
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
  
    uniform vec2 u_resolution;
    uniform float u_time;
    void main() {
        vec2 st = gl_FragCoord.xy/u_resolution;
        st -= vec2(.5);
        st *= (cos(st.x) + sin(st.y));
        float dist = distance(vec2(sin(st.x), cos(st.y)),vec2(.0, 0.15));
        vec3 color = vec3(dist);
        float scale = .05 * cos(u_time * .5);
        float coord = floor(st.x * u_resolution.x * scale) + floor(st.y * u_resolution.y * scale);
        if(mod(coord, 2.0) == 0.0) {
          gl_FragColor = vec4(cos(u_time), sin(u_time * .375), 0.0, dist);
        } else {
          gl_FragColor = vec4(0.0, 0.0, 1.0, dist);
        }
    }
    `;
    
    particlesFrag: string = `
    #ifdef GL_ES
    precision mediump float;
    #endif
  
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
  
    uniform vec2 u_resolution;
    uniform float u_time;

    void main() {

    }
    `;

    fireworksFrag: string = `
    #ifdef GL_ES
    precision mediump float;
    #endif
  
    #define PI 3.14159265359
    #define TWO_PI 6.28318530718
    #define POINT_COUNT 100

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform vec2 u_mouse;
    uniform vec2 u_points[POINT_COUNT];
    
    float rand(vec2 co){
      return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
    }

    vec3 hsb2rgb(vec3 c){
      vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                               6.0)-3.0)-1.0,
                       0.0,
                       1.0 );
      rgb = rgb*rgb*(3.0-2.0*rgb);
      return c.z * mix(vec3(1.0), rgb, c.y);
    }

    void main() {
      vec2 st = gl_FragCoord.xy/u_resolution;
      st -= vec2(0.5);
      //st -= u_mouse;
      float explosionSpeed = 1.0;
      float innerRadius = 0.3 * sin(u_time * .5 * explosionSpeed) + .3;
      float innerDf = 0.3 * sin((u_time - .1) * .5) + .3;
      float outerRadius = 0.5 * sin(u_time * .5 * explosionSpeed) + .5;
      float dist = distance(st, vec2(0.0));
      float alpha = 1.0 - outerRadius;
      float speed = 1.0 - distance(vec2(st.x, st.y), vec2(0.0));
      float circleSize =  abs(innerRadius * .05);

      if(innerDf > innerRadius) {
        alpha = 0.0;
      }

      for(int i = 0; i < POINT_COUNT; i++) {
        float rad = (u_points[i].y/u_points[i].x);
        float thetaTwo = atan(rad);
        vec3 color = hsb2rgb(vec3(thetaTwo, 1.0, 1.0));

        //if(distance(vec2(u_points[i].x, u_points[i].y), vec2(0.0)) < 1.0 - outerRadius ) {
          if(u_points[i].x < 0.0 && u_points[i].y > 0.0) {
            if(distance(st, vec2( u_points[i].x - (innerRadius * cos(thetaTwo)), u_points[i].y - (innerRadius * sin(thetaTwo)) )) * speed < circleSize) {
              gl_FragColor = vec4(color, alpha);
              return;
            }
          } else if(u_points[i].x < 0.0 && u_points[i].y < 0.0) {
            if(distance(st, vec2( u_points[i].x - (innerRadius * cos(thetaTwo)), u_points[i].y - (innerRadius * sin(thetaTwo)) )) * speed < circleSize) {
              gl_FragColor = vec4(color, alpha);
              return;
            }
          } else {
            if(distance(st, vec2( u_points[i].x + (innerRadius * cos(thetaTwo)), u_points[i].y + (innerRadius * sin(thetaTwo)) )) * speed < circleSize) {
              gl_FragColor = vec4(color, alpha);
              return;
            }
          }
        //}
      }
      gl_FragColor = vec4(0.0);
    }
    `;

    private vertexShader: string = `
    uniform float u_time;
  
    void main() {
      gl_Position = vec4(position.x, position.y, position.z, 1.0);
    }
    `;

    constructor() { }

}