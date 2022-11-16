import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'mandlebrot',
  templateUrl: './mandlebrot.component.html',
  styleUrls: ['./mandlebrot.component.css']
})
export class MandlebrotComponent implements OnInit, AfterViewInit {
  @ViewChild ('canvas') private canvasRef: ElementRef;
  @Input() public size: number = 200;
  @Input() public texture: string = "/assets/texture.jpg";

  @Input() public cameraZ: number = 1;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  private uniforms: any = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() }
  };

  private vertexShader: string = `
  void main() {
    gl_Position = vec4( position, 1.0 );
  }
  `;

  private fragmentShader: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  uniform vec2 u_resolution;
  uniform float u_time;

  vec3 colorA = vec3(0.149, 0.141, 0.912);
  vec3 colorB = vec3(1.000,0.833,0.224);

  float plot(vec2 st, float pct) {
    return smoothstep(pct-0.01, pct, st.y) - smoothstep(pct, pct + 0.01, st.y);
  }

  vec3 rgb2hsb(in vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz),
                 vec4(c.gb, K.xy),
                 step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r),
                 vec4(c.r, p.yzx),
                 step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)),
                d / (q.x + e),
                q.x);
  }

  vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                             0.0,
                             1.0);
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    vec3 color = vec3(0.0);

    //color = hsb2rgb(vec3(st.x, 1.0, st.y));
    vec2 toCenter = vec2(0.5)-st;
    float angle = atan(toCenter.y, toCenter.x);
    float radius = length(toCenter) * 2.0;

    color = hsb2rgb(vec3((angle/TWO_PI) + 0.5, radius, 1.0));

    gl_FragColor = vec4(color,1.0);
  }
  `;

  private mandlebrotFrag: string = `
  uniform vec2 u_resolution;
  uniform float u_time;
  float maxIterations = 255.0;

  vec2 squareImaginary(vec2 number) {
    return vec2(
      pow(number.x,2.0)-pow(number.y,2.0),
      2.0*number.x*number.y
    );
  }

  vec4 iterateMandelbrot(vec2 coord) {
    vec2 z = vec2(0,0);
    vec4 result = vec4(0.0);

    for(float i = 0.0;i<maxIterations;i++) {
      z = squareImaginary(z) + coord;
      if(length(z) > 2.0) { // 2 is the escape value
        result = vec4(sin(i/20.0), cos(i/20.0), tan(i/20.0), 0.0);
        break;
      }
    }
    return result;
  }

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    st /= (10.0 * (cos(u_time) + 10.0)); // zoom by decreasing viewport
    st.x -= .769;
    st.y -= .1;
    vec4 shade = iterateMandelbrot(st);
    gl_FragColor = shade;
  }
  `

  private mandlebrotPlane = new THREE.PlaneGeometry( 2, 2 );

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;
  private clock = new THREE.Clock();

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor() { }

  ngAfterViewInit(): void {
    this.createScene();
    this.initRenderer();
  }

  ngOnInit(): void {
  }

  private createScene() {
    const light = new THREE.PointLight(0xFFFFFF, 2);
    light.position.y = 2;
    light.position.x = 2;
    light.position.z = 2;

    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0x000000);
    

    var mandlebrotMaterial = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:this.vertexShader, fragmentShader:this.mandlebrotFrag});
    var mandlebrotMesh = new THREE.Mesh(this.mandlebrotPlane, mandlebrotMaterial);  

    this.scene.add(mandlebrotMesh);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.z = this.cameraZ;
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animate() {
    // this.candle.scene.rotation.y += this.rotationSpeedY;
    // this.flameMesh.rotation.y += this.rotationSpeedY;
  }

  updateShader(event: any) {
    if(event.target) {
      this.fragmentShader = event.target.value;
      var mandlebrotMaterial = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:this.vertexShader, fragmentShader:this.fragmentShader});
      var mandlebrotMesh = new THREE.Mesh(this.mandlebrotPlane, mandlebrotMaterial);  
  
      this.scene.add(mandlebrotMesh);
    }
  }

  private onWindowResize() {
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;

    window.addEventListener('resize', this.onWindowResize, false);

    let component: MandlebrotComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.uniforms.u_time.value += component.clock.getDelta();
      component.renderer.render(component.scene, component.camera);
    }());
  }
}
