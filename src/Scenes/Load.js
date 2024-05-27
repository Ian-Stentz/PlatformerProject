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
        this.load.image("TilesetBackground","tilemap-backgrounds_packed.png")
        //this.load.image("Tileset_Characters", "tilemap-characters_packed.png");                            // Packed tilemap
        this.load.tilemapTiledJSON("platformer-final", "PlatformerFinal.tmj");   // Tilemap in JSON
        this.load.tilemapTiledJSON("platformer-background", "PlatformerBackground.tmj");
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

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}