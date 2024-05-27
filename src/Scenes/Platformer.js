class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.ACCELERATION = 600;
        this.DRAG = 1200;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.TERMINAL_VELOCITY = 400;
        this.SCALE = 1.0;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // w tiles wide and h tiles tall.*
        // *180 x 40
        this.map = this.add.tilemap("platformer-final", 18, 18, 180, 40);
        this.physics.world.setBounds(0,0, 180*18*SCALE, 40*18*SCALE);
        console.log(this.map);
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tilesetB = this.map.addTilesetImage("Tileset_Base", "TilesetBase");
        this.tilesetF = this.map.addTilesetImage("Tileset_Farm", "TilesetFarm");
        this.tilesetI = this.map.addTilesetImage("Tileset_Industrial", "TilesetIndustrial");
        //this.tilesetC = this.map.addTilesetImage("Tileset_Characters", "Tileset_Characters");

        this.tilesets = [this.tilesetB, this.tilesetF, this.tilesetI];

        this.map2 = this.add.tilemap("platformer-background", 24, 24, 135, 30);
        this.tilesetBack = this.map2.addTilesetImage("Tileset_Background", "TilesetBackground");
        this.parallaxLayer = this.map2.createLayer("Parallax", this.tilesetBack, 0, 0).setScale(2.0);
        this.parallaxLayer.setScrollFactor(0.25);

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.tilesets, 0, 0).setScale(2.0);
        console.log(this.backgroundLayer);
        this.foregroundLayer = this.map.createLayer("Foreground", this.tilesets, 0, 0).setScale(2.0);
        this.popLayer = this.map.createLayer("Popground", this.tilesets, 0, 0).setScale(2.0);

        

        // Make it collidable
        this.backgroundLayer.setCollisionByProperty({
            collides: true
        });
        this.foregroundLayer.setCollisionByProperty({
            collides: true
        });
        this.popLayer.setCollisionByProperty({
            collides: true
        });

        // set up player avatar
        my.sprite.player = this.physics.add.sprite(game.config.width/4, game.config.height/2, "platformer_characters", "tile_0000.png").setScale(SCALE)
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.backgroundLayer);
        this.physics.add.collider(my.sprite.player, this.foregroundLayer);
        this.physics.add.collider(my.sprite.player, this.popLayer);

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*SCALE, this.map.heightInPixels*SCALE);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setDeadzone(0.25, 0.25);
        this.cameras.main.setZoom(this.SCALE);
        my.sprite.player.setMaxVelocity(this.TERMINAL_VELOCITY, this.TERMINAL_VELOCITY * 2);

    }

    update() {
        if(cursors.left.isDown) {
            // TODO: have the player accelerate to the left
            if(my.sprite.player.body.blocked.down && my.sprite.player.body.velocity.x > 0) {
                my.sprite.player.body.setVelocityX(my.sprite.player.body.velocity.x / 2);
            }
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

        } else if(cursors.right.isDown) {
            // TODO: have the player accelerate to the right
            if(my.sprite.player.body.blocked.down && my.sprite.player.body.velocity.x < 0) {
                my.sprite.player.body.setVelocityX(my.sprite.player.body.velocity.x / 2);
            }
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            // TODO: set a Y velocity to have the player "jump" upwards (negative Y direction)
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
        }
    }
}