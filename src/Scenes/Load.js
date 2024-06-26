class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");
 
        // Load tilemap information
        this.load.image("TilesetBase", "tilemap_base_packed.png");   
        this.load.image("TilesetFarm", "tilemap_farm_packed.png");      
        this.load.image("TilesetIndustrial", "tilemap_industrial_packed.png");   
        this.load.image("TilesetBackground","tilemap-backgrounds_packed.png");
        this.load.spritesheet("TilesetCharacters", "tilemap-characters_packed.png", {
            frameWidth: 24,
            frameHeight: 24
        });
        this.load.image("TilesetPrompts", "ButtonSheet.png");
        //this.load.image("Tileset_Characters", "tilemap-characters_packed.png");                            // Packed tilemap
        this.load.tilemapTiledJSON("platformer-final", "PlatformerFinal.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("platformer-background", "PlatformerBackground.tmj");
        
        this.load.multiatlas("kenny-particles", "kenny-particles.json");

        this.load.spritesheet("tilemap_base", "tilemap_base_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.image("Twirl", "Particles_Trans/twirl_01.png");
        
        this.load.audio("Jump", "Jump.mp3");
        this.load.audio("Steps", "miniman_footsteps.mp3");
        this.load.audio("Music", "miniman_mx.mp3");
        this.load.audio("Attack", "miniman_slash.mp3");
        this.load.audio("Death", "impactPlate_light_001.ogg")
        this.load.audio("Win", "jingles_HIT01.ogg")
        this.load.audio("Checkpoint", "jingles_HIT07.ogg")
        this.load.audio("Gem", "jingles_HIT16.ogg")
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'flag',
            frames: [
                {key: "tilemap_base", frame: 111, duration: 150},
                {key: "tilemap_base", frame: 112, duration: 150}
            ],
            repeat: -1
        })

        this.anims.create({
            key: 'Robyte_Walk',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0021.png", duration: 100},
                { frame: "tile_0022.png", duration: 100}
            ],
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }

    bounce() {
        
    }
}