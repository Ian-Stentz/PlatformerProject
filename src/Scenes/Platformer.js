class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    preload() {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    init() {
        // variables and settings
        this.ACCELERATION = 300;
        this.DRAG = 600;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 900;
        this.JUMP_VELOCITY = -500;
        this.TERMINAL_VELOCITY = 200;
        this.CAMERA_SCALE = 2.0;
        this.PARTICLE_VELOCITY = 25;
        this.ATTACK_COOLDOWN = 0.3;
        this.ATTACK_DURATION = 250
        this.attackTimer = 0;
        this.ATTACK_SCALE = 0.2;
        this.ATTACK_RADIUS = 512/2 * this.ATTACK_SCALE;
        this.doubleJumpOn = false;
        this.doubleJumped = false;
        this.targetY = 0;
        this.controlSeized = false;
        this.lock = false;
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // w tiles wide and h tiles tall.*
        // *180 x 40
        this.map = this.add.tilemap("platformer-final", 18, 18, 180, 40);
        this.physics.world.setBounds(0,0, 180*18*SCALE, 40*18*SCALE);
        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tilesetB = this.map.addTilesetImage("Tileset_Base", "TilesetBase");
        this.tilesetF = this.map.addTilesetImage("Tileset_Farm", "TilesetFarm");
        this.tilesetI = this.map.addTilesetImage("Tileset_Industrial", "TilesetIndustrial");
        this.tilesetP = this.map.addTilesetImage("Tileset_Prompts", "TilesetPrompts");
        //this.tilesetC = this.map.addTilesetImage("Tileset_Characters", "Tileset_Characters");

        this.tilesets = [this.tilesetB, this.tilesetF, this.tilesetI, this.tilesetP];

        this.map2 = this.add.tilemap("platformer-background", 24, 24, 135, 30);
        this.tilesetBack = this.map2.addTilesetImage("Tileset_Background", "TilesetBackground");
        this.parallaxLayer = this.map2.createLayer("Parallax", this.tilesetBack, 0, 0).setScale(1.5);
        this.parallaxLayer.setScrollFactor(0.375);

        // Create a layer
        this.backgroundLayer = this.map.createLayer("Background", this.tilesets, 0, 0).setScale(SCALE);
        this.foregroundLayer = this.map.createLayer("Foreground", this.tilesets, 0, 0).setScale(SCALE);
        this.popLayer = this.map.createLayer("Popground", this.tilesets, 0, 0).setScale(SCALE);

        this.playerSpawn = this.map.findObject("CharacterSpawns", obj => obj.name === 'PlayerSpawn');
        this.checkpoint = this.playerSpawn;

        this.animatedTiles.init(this.map);

        this.checkpoints = this.map.createFromObjects("CharacterSpawns", {
            name: "Checkpoint",
            key: "tilemap_base",
            frame: 111
        })

        this.gems = this.map.createFromObjects("CharacterSpawns", {
            name: "Gem",
            key: "tilemap_base",
            frame: 67
        })

        this.physics.world.enable(this.checkpoints, Phaser.Physics.Arcade.STATIC_BODY);

        this.checkpointGroup = this.add.group(this.checkpoints);
        this.checkpointGroup.playAnimation('flag');

        this.gemGroup = this.add.group(this.gems);

        this.physics.world.enable(this.gems, Phaser.Physics.Arcade.STATIC_BODY);

        this.invisibleCollider = null;

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
        my.sprite.player = this.physics.add.sprite(0, 0, "platformer_characters", "tile_0000.png").setScale(SCALE);
        my.sprite.player.x = this.checkpoint.x*SCALE+my.sprite.player.displayWidth/2;
        my.sprite.player.y = this.checkpoint.y*SCALE-my.sprite.player.displayHeight/2;
        my.sprite.player.setFlip(true, false);
        my.sprite.player.setCollideWorldBounds(true);

        // Enable collision handling
        this.physics.add.collider(my.sprite.player, this.backgroundLayer);
        this.physics.add.collider(my.sprite.player, this.foregroundLayer);
        this.physics.add.collider(my.sprite.player, this.popLayer);

        this.physics.add.overlap(my.sprite.player, this.checkpointGroup, (obj1, obj2) => {
            this.sound.play("Checkpoint");
            this.checkpoint = obj2;
            obj2.checkCollision = false;
        }, (obj1, obj2) => {
            return this.checkpoint != obj2
        })

        this.physics.add.overlap(my.sprite.player, this.gemGroup, (obj1, obj2) => {
            this.sound.play("Gem");
            this.enableDJ();
            this.map.createLayer("GemGuidance", this.tilesetP, 0, 0).setScale(SCALE);
            obj2.destroy();
        })

        for (let gem of this.gemGroup.getChildren()) {
            gem.baseY = gem.y;
        }

        // set up Phaser-provided cursor key input
        cursors = this.input.keyboard.createCursorKeys();

        //this.input.keyboard.on('keydown-D', () => {this.enableDJ()}, this);

        this.input.keyboard.on('keydown-SPACE', () => {this.attack()}, this);

        this.cameras.main.setBounds(0, 0, this.map.widthInPixels*SCALE, this.map.heightInPixels*SCALE);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.1);
        this.cameras.main.setDeadzone(40, 40);
        this.cameras.main.setZoom(this.CAMERA_SCALE);
        my.sprite.player.setMaxVelocity(this.TERMINAL_VELOCITY, this.TERMINAL_VELOCITY * 2);

        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            // TODO: Try: add random: true
            scale: {start: .075, end: 0.03, random: true},
            // TODO: Try: maxAliveParticles: 8,
            maxAliveParticles: 14,
            lifespan: 350,
            // TODO: Try: gravityY: -400,
            alpha: {start: 0.8, end: 0.1}, 
            gravityY: -400
        });
        my.vfx.jump = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_02.png', 'smoke_03.png'],
            scale: {start: 0.04, end: 0.04},
            lifespan: 200,
            alpha: {start: 1, end: 0.5},
            gravityY: -300
        })
        my.vfx.attack = this.add.particles(0, 0, "kenny-particles", {
            frame: ['twirl_01.png', 'twirl_02.png', 'twirl_03.png'],
            rotate: {
                onEmit: (particle) => {
                    return particle.scaleX > 0 ? -150 : 150
                },
                onUpdate: (particle) => {
                    return particle.angle + (particle.scaleX > 0 ? 12 : -12);
                }
            },
            lifespan: this.ATTACK_DURATION,
            frequency: -1,
            x: {
                onUpdate: () => {
                    return my.sprite.player.x     
                }
            },
            y: {
                onUpdate: () => {
                    return my.sprite.player.y     
                }
            },
            tint: {
                onEmit: () => {
                    return 0xafafff;
                }
            }
        })

        my.vfx.walking.stop();

        my.sfx.walking = this.sound.add('Steps', {loop: true});
        my.sfx.music = this.sound.add('Music', {volume: 0.85, loop: true});
        my.sfx.music.play();
    }

    update(time, delta) {
        //this.cameras.main.setDeadzone(40, 40);

        for (let gem of this.gemGroup.getChildren()) {
            gem.y = gem.baseY + gem.displayHeight/8 * Math.sin(time/400);
        }

        if(cursors.left.isDown && !this.controlSeized) {
            // TODO: have the player accelerate to the left
            if(my.sprite.player.body.blocked.down && my.sprite.player.body.velocity.x > 0) {
                my.sprite.player.body.setVelocityX(my.sprite.player.body.velocity.x / 2);
            }
            my.sprite.player.body.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth/2-10, my.sprite.player.displayHeight/2-5, false);

            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                this.setAudio(my.sfx.walking, true);
            } else {
                my.vfx.walking.stop();
            }
        } else if(cursors.right.isDown || this.controlSeized) {
            // TODO: have the player accelerate to the right
            if(my.sprite.player.body.blocked.down && my.sprite.player.body.velocity.x < 0) {
                my.sprite.player.body.setVelocityX(my.sprite.player.body.velocity.x / 2);
            }
            my.sprite.player.body.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);

            my.vfx.walking.startFollow(my.sprite.player, -(my.sprite.player.displayWidth/2-10), my.sprite.player.displayHeight/2-5, false);
            my.vfx.walking.setParticleSpeed(-this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect and play walking sound if touching the ground
            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                this.setAudio(my.sfx.walking, true);
            } else {
                my.vfx.walking.stop();
            }
        } else {
            // TODO: set acceleration to 0 and have DRAG take over
            my.sprite.player.body.setAccelerationX(0);
            my.sprite.player.body.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
            this.setAudio(my.sfx.walking, false);
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
            this.setAudio(my.sfx.walking, false);
            if(this.doubleJumpOn && !this.doubleJumped && Phaser.Input.Keyboard.JustDown(cursors.up) && !this.controlSeized) {
                my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
                this.sound.play("Jump", {volume: 0.6});
                this.doubleJumped = true;
            }
            this.cameras.main.setFollowOffset(0,my.sprite.player.y-this.targetY);
        } else {
            if(this.doubleJumped) {
                this.doubleJumped = false;
            }
            if(this.targetY != my.sprite.player.y) {
                this.cameras.main.setFollowOffset(0,0);
                this.targetY = my.sprite.player.y;
            }
        }
        if(my.sprite.player.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up) && !this.controlSeized) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.sound.play("Jump", {volume: 0.6});
        }

        if (this.attackTimer > 0) {
            this.attackTimer -= delta / 1000
        } 

        if(this.attackTimer > this.ATTACK_COOLDOWN - this.ATTACK_DURATION / 1000) {
            if(this.invisibleCollider) {
                this.invisibleCollider.x = my.sprite.player.x;
                this.invisibleCollider.y = my.sprite.player.y;
                this.invisibleCollider.setVelocity(0);
            }
        } else {
            if(this.invisibleCollider) {
                this.invisibleCollider.destroy();
            }
        }

        if(my.sprite.player.y > this.map.heightInPixels * SCALE - 18 * 3 * SCALE) {
            this.die();
        }
        if(my.sprite.player.x > this.map.widthInPixels * SCALE - 18 * 2 * SCALE) {
            this.levelEnd();
        }
        if(my.sprite.player.x > this.map.widthInPixels * SCALE && !this.lock) {
            this.lock = true;
            my.sfx.music.stop();
            my.sprite.player.body.gravity = 0;
        }
    }

    setAudio(audio, newState) {
        if(!audio.isPlaying && newState) {
            audio.play();
        } else if(audio.isPlaying && !newState) {
            audio.stop();
        }
    }

    attack() {
        if(this.attackTimer <= 0) {
            my.vfx.attack.startFollow(my.sprite.player, 0, 0, false)
            if(my.sprite.player.flipX){
                my.vfx.attack.setParticleScale(this.ATTACK_SCALE,-this.ATTACK_SCALE);
            } else {
                my.vfx.attack.setParticleScale(-this.ATTACK_SCALE,-this.ATTACK_SCALE);
            } 
            my.vfx.attack.explode(1);
            this.sound.play("Attack");
            this.attackTimer = this.ATTACK_COOLDOWN;
            if(this.invisibleCollider) {
                this.invisibleCollider.destroy();
            }
            this.invisibleCollider = this.physics.add.image(my.sprite.player.x, my.sprite.player.y, "Twirl").setScale(this.ATTACK_SCALE);
            this.invisibleCollider.setAlpha(0);
            this.invisibleCollider.setCircle(this.ATTACK_RADIUS*5, 0, 0);
            this.physics.add.overlap(my.sprite.player, this.invisibleCollider, (obj1, obj2) => {
                //this.die();
                //obj2.destroy();
            })
        }
    }

    enableDJ() {
        this.doubleJumpOn = true;
    }
    
    die() {
        this.sound.play("Death");
        my.sprite.player.body.setVelocity(0);
        my.sprite.player.x = this.checkpoint.x*SCALE+my.sprite.player.displayWidth/2;
        my.sprite.player.y = this.checkpoint.y*SCALE-my.sprite.player.displayHeight/2;
    }

    levelEnd() {
        if(!this.controlSeized) {
            this.controlSeized = true;
            this.cameras.main.stopFollow();
            my.sprite.player.setCollideWorldBounds(false);
            this.sound.play("Win");
        }
    }
}