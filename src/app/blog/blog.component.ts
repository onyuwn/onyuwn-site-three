import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { UrlMatcher } from '@angular/router';
import * as THREE from 'three';
import { ReverseSubtractEquation, Shader } from 'three';
import { ShaderService } from '../Services/shader.service';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogComponent implements OnInit {
  @ViewChild ('canvas') private canvasRef: ElementRef;
  @Input() public size: number = 200;
  @Input() public cameraZ: number = 1;
  @Input() public fieldOfView: number = 1;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 2;

  debug: boolean = false;

  uniforms: any = {
    u_time: { type: "f", value: 1.0 },
    u_resolution: { type: "v2", value: new THREE.Vector2() },
    u_mouse: { type: "v2", value: new THREE.Vector2() },
    u_points: { type: "v2v", value: [new THREE.Vector2(-.1, -.1), new THREE.Vector2(.1, -.1), new THREE.Vector2(.1, .1),
                new THREE.Vector2(0.05, 0.1), new THREE.Vector2(-.1, .1)]},
  };

  fireworksPos: THREE.Vector2 = new THREE.Vector2(0,0);

  private mandlebrotPlane = new THREE.PlaneGeometry( 2, 2 );

  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;
  private clock = new THREE.Clock();
  private shaderService: ShaderService;

  private fragmentShader: string = `
  #ifdef GL_ES
  precision mediump float;
  #endif

  #define PI 3.14159265359
  #define TWO_PI 6.28318530718

  uniform vec2 u_resolution;
  uniform float u_time;

  vec3 hsb2rgb(in vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x*6.0+vec3(0.0,4.0,2.0),
                             6.0)-3.0)-1.0,
                             0.0,
                             1.0);
    rgb = rgb*rgb*(3.0-2.0*rgb);
    return c.z * mix(vec3(1.0), rgb, c.y);
  }

  vec4 circle(vec2 coord) {
    float dist = length(coord - vec2(.5,.5));
    if(dist < .3) {
      vec3 shade = hsb2rgb(vec3((abs(coord.x - .5) * cos(u_time) * 5.0), 1.0, 1.0 - (dist/1.0)));
      return vec4(shade,1.0);
    } else {
      return vec4(0.0);
    }
  }

  void main() {
    vec2 st = gl_FragCoord.xy/u_resolution.xy;
    //vec2 cPos = (-10.0 * sin(u_time)) + (20.0 * cos(u_time)) * st;
    vec2 cPos = -2.0 + 2.0 * st;
    float cLength = length(cPos);
    //st += (cPos / cLength) * cos(cLength * 2.0 - u_time * 4.0) * (cos(u_time));
    st += (cPos / cLength) * cos(cLength - u_time); 
    //st += (cPos / cLength) * cos(cLength * 10.0 - u_time * 4.0); 
    gl_FragColor = circle(st);
  }
  `;

  private vertexShader: string = `
  uniform float u_time;

  void main() {
    gl_Position = vec4(position.x, position.y, position.z, 1.0);
  }
  `;

  shaderAvailable: boolean = false;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(shaders: ShaderService) {
    this.shaderService = shaders;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createScene();
    this.initRenderer();
  }

  private createScene() {
    const light = new THREE.PointLight(0xFFFFFF, 2);
    light.position.y = 2;
    light.position.x = 2;
    light.position.z = 2;

    this.scene = new THREE.Scene;
    this.scene.background = new THREE.Color(0xFFFFFF);
    

    var shaderViewMaterial = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:this.vertexShader, fragmentShader:this.shaderService.fireworksFrag});
    shaderViewMaterial.transparent = true;
    var mandlebrotMesh = new THREE.Mesh(this.mandlebrotPlane, shaderViewMaterial);  

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

  private onWindowResize() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;
  }

  private setPosition(event: any) {
    if(event.target.id === "shaderPreview") {
      var rect = event.target.getBoundingClientRect();
      var x: number = (event.clientX - rect.left) / rect.width;
      var y: number = (event.clientY - rect.top) / rect.height; 
      this.fireworksPos = new THREE.Vector2(x, y);
      console.log(this.fireworksPos);
    }
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.uniforms.u_resolution.value.x = this.renderer.domElement.width;
    this.uniforms.u_resolution.value.y = this.renderer.domElement.height;

    var points: any[] = [];
    var pointCount = 100;
    // start with base hypoteneuse length of .5
    var maxDist: number = .25;
    // divide 360 / ptCnt == find points in circle that many times around
    var thetaStep: number = 360 / pointCount;

    for(let i = 0; i < pointCount; i++) {
      var j: number = Math.random() * pointCount;
      var k: number = Math.random() * maxDist;

      var xComponent: number = (maxDist - k) * Math.cos(j * thetaStep);
      var yComponent: number = (maxDist - k) * Math.sin(j * thetaStep);
      this.uniforms.u_points.value.push(new THREE.Vector2(xComponent, yComponent));
    }

    // for(let i = 0; i < pointCount; i ++) {
      // var x = Math.random() * .5;
      // var y = Math.random() * .5;
      // x -= .25;
      // y -= .25;
      // this.uniforms.u_points.value.push(new THREE.Vector2(x, y));
    // }
    console.warn(this.uniforms.u_points.value);
    window.addEventListener('resize', this.onWindowResize, false);
    window.addEventListener('click', this.setPosition, false);

    let component: BlogComponent = this;
    let canvas: HTMLCanvasElement = this.canvas;
    (function render() {
      requestAnimationFrame(render);
      component.uniforms.u_time.value += component.clock.getDelta();
      component.uniforms.u_mouse.value = component.fireworksPos;
      component.renderer.render(component.scene, component.camera);
    }());
  }

  toggleAvailableShader() {
    this.shaderAvailable = !this.shaderAvailable;
  }
}
