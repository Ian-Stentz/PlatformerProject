class Walker extends Enemy {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);
        this.scene = scene;

        this.speedX = 50;
        this.velocityX = -this.speedX;

        return this;
    }

    update(time, delta) {
        this.x += this.velocityX * delta / 1000;
        console.log("beep");
    }   

    bounce(time, delta) {
        if(!this.flipX) {
            this.setFlip(true, false);
            this.velocityX = this.speedX;
        } else {
            this.setFlip(false, false);
            this.velocityX = -this.speedX;
        }
    }
}