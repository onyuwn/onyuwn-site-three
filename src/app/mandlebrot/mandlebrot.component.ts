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

  @Input() public cameraZ: number = 600;
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
  uniform vec2 u_resolution;
  uniform float u_time;

  void main() {
      vec2 st = gl_FragCoord.xy/u_resolution.xy;
      gl_FragColor=vec4(st.x,st.y,0.0,1.0);
  }
  `;

  private mandlebrotPlane = new THREE.PlaneGeometry( 10, 10, 10 );

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
    

    var mandlebrotMaterial = new THREE.ShaderMaterial({uniforms:this.uniforms, vertexShader:this.vertexShader, fragmentShader:this.fragmentShader});
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

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    let component: MandlebrotComponent = this;
    (function render() {
      requestAnimationFrame(render);
      component.uniforms.u_time.value += component.clock.getDelta();
      component.renderer.render(component.scene, component.camera);
    }());
  }

}
