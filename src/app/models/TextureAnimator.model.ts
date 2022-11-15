import * as THREE from "three";
import { Texture } from "three";

export class TextureAnimator {
    currentDisplayTime: number;
    currentTile: number;
    duration: number;
    tilesHoriz: number;
    tilesVert: number;
    totalTiles: number;
    texture: Texture;
    
    constructor(texture: Texture, tilesHoriz: number, tilesVert: number, duration: number) {
        this.duration = duration;
        this.tilesHoriz = tilesHoriz;
        this.tilesVert = tilesVert;
        this.texture = texture;

        this.totalTiles = this.tilesHoriz * this.tilesVert;
        this.texture.wrapS = this.texture.wrapT = THREE.RepeatWrapping;
        this.texture.repeat.set(1 / this.tilesHoriz, 1 / this.tilesVert);
        this.duration = duration;
        this.currentDisplayTime = 0;
        this.currentTile = 0;
    }

    update(millis:number): void {
        this.currentDisplayTime += millis;

        while(this.currentDisplayTime > this.duration) {
            this.currentDisplayTime -= this.duration;
            this.currentTile++;

            if(this.currentTile === this.totalTiles) {
                this.currentTile = 0;
            }

            var currentCol = this.currentTile % this.tilesHoriz;
            this.texture.offset.x = currentCol / this.tilesHoriz;
            
            var currentRow = this.currentTile % this.tilesVert;
            this.texture.offset.y = currentRow / this.tilesVert;
        }
    }
}