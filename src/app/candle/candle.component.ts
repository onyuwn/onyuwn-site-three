import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';
import * as THREE from "three";
import { Clock, Texture } from 'three';
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { TextureAnimator } from '../models/TextureAnimator.model';

@Component({
  selector: 'candle',
  templateUrl: './candle.component.html',
  styleUrls: ['./candle.component.css']
})
export class CandleComponent implements OnInit, AfterViewInit {

  @ViewChild ('canvas') private canvasRef: ElementRef;

  @Input() public rotationSpeedX: number = 0.05;
  @Input() public rotationSpeedY: number = 0.01;
  @Input() public size: number = 200;
  @Input() public texture: string = "/assets/texture.jpg";

  @Input() public cameraZ: number = 600;
  @Input() public fieldOfView: number = .8;
  @Input('nearClipping') public nearClippingPlane: number = 1;
  @Input('farClipping') public farClippingPlane: number = 1000;

  private camera!: THREE.PerspectiveCamera;

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private clock = new THREE.Clock();
  private loader = new GLTFLoader();
  private geometry = new THREE.BoxGeometry(1,1,1);
  //private material = new THREE.MeshBasicMaterial({map: this.loader.load(this.texture)});
  private material = new THREE.MeshPhongMaterial({ color: 0xFF8001 });

  //candle flame
  private flameTexture = new THREE.TextureLoader().load("../assets/firesheet.png");
  private flameAnimation = new TextureAnimator(this.flameTexture, 5, 1, 100); // changes source of texture based on sprite sheet
  private flamePlane = new THREE.PlaneGeometry( 2.75, 3, 3 );
  private flameMaterial = new THREE.MeshPhongMaterial({map: this.flameTexture, emissiveMap: this.flameTexture, 
                                                      emissiveIntensity: 1,
                                                      transparent:true, side:THREE.DoubleSide});
  private flameMesh = new THREE.Mesh(this.flamePlane, this.flameMaterial);

  //floor
  private floorPlane = new THREE.PlaneGeometry( 10, 10, 10 );
  private floorTexture = new THREE.TextureLoader().load("../assets/floor.png");
  //private floorMaterial = new THREE.MeshPhongMaterial({map:this.floorTexture, side:THREE.DoubleSide});
  //private floor material = new THREE.MeshBasicMaterial({map:})
  //private floorMesh = new THREE.Mesh(this.floorPlane, this.floorMaterial);

  private renderer!: THREE.WebGLRenderer;

  private scene!: THREE.Scene;

  private candle: GLTF;

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
    this.scene.background = null;

    this.flameMesh.position.y = 2.75;
    // this.floorMesh.rotation.x = (Math.PI / 2) + .2;

    this.scene.add(light);
    this.scene.add(this.flameMesh);
    // this.scene.add(this.floorMesh);

    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPlane,
      this.farClippingPlane
    )
    this.camera.position.y = 14;
    this.camera.position.z = this.cameraZ;
    this.camera.rotation.x = -.018

    this.loader.load("../assets/candleiso.glb", (( gltf ) => {
      this.candle = gltf;
      this.scene.add(this.candle.scene);
    }));
  }

  private getAspectRatio() {
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private animate() {
    // this.candle.scene.rotation.y += this.rotationSpeedY;
    // this.flameMesh.rotation.y += this.rotationSpeedY;
  }

  private onWindowResize() {
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
  }

  private initRenderer() {
    this.renderer = new THREE.WebGLRenderer({ canvas:this.canvas, alpha:true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setClearColor(0x000000,0)

    let component: CandleComponent = this;
    window.addEventListener('resize', this.onWindowResize, false);
    (function render() {
      requestAnimationFrame(render);
      component.animate();
      component.renderer.render(component.scene, component.camera);
      var delta = component.clock.getDelta();
      component.flameAnimation.update(delta * 1000);
    }());
  }
}
