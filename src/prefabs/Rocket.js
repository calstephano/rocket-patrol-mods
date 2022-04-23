// Rocket prefab
class Rocket extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, frame) {
        super(scene, x, y, texture, frame);

        scene.add.existing(this);   // add to existing, displayList, updateList
        this.isFiring = false;      // track rocket's firing status
        this.moveSpeed = 3;         // pixels per frame

        this.fireKey;
        this.leftKey;
        this.rightKey;

        this.sfxRocket = scene.sound.add('sfx_rocket')  // add rocket sfx
    }

    update() {
        // Left/right movement
        if(this.leftKey.isDown && this.x >= borderUISize + this.width) {
            this.x -= this.moveSpeed;
        }
        else if (this.rightKey.isDown && this.x <= game.config.width - borderUISize - this.width) {
            this.x += this.moveSpeed;
        }
        
        // Fire button
        if(Phaser.Input.Keyboard.JustDown(this.fireKey) && !this.isFiring) {
            this.isFiring = true;
            this.sfxRocket.play();
        }
        // If fired, move up
        if(this.isFiring && this.y >= borderUISize * 3 + borderPadding) {
            this.y -= this.moveSpeed;
        }
        // Reset on miss
        if(this.y <= borderUISize * 3 + borderPadding) {
            this.reset();
        }
    }

    // Reset rocket to "ground"
    reset() {
        this.isFiring = false;
        this.y = game.config.height - borderUISize - borderPadding;
    }
}
