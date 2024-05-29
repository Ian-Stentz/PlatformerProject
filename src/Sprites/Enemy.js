class Enemy extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;

        return this;
    }

    update(time, delta) {
        
    }   

    die() {
       console.log("euch no!");
       this.destroy();
    }
}