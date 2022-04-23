class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // Load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        // Load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        // Place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);

        // Green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        
        // White borders
        this.add.rectangle(0, 0, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, game.config.height - borderUISize, game.config.width, borderUISize, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(0, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);
        this.add.rectangle(game.config.width - borderUISize, 0, borderUISize, game.config.height, 0xFFFFFF).setOrigin(0 ,0);

        // add Rocket (p1)
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);

        // add Spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);

        // Define keys
        keyF = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);

        // Animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // Initialize score
        this.p1Score = 0;

        // Get highest score. Default is 0
        this.highScore = parseInt(localStorage.getItem("score")) || 0;

        // Play and loop music
        this.playMusic = this.sound.add('sfx_music');
        this.playMusic.setLoop(true); 
        this.playMusic.play();

        // Display score
        let textConfig = {
            fontFamily: 'Courier',
            fontSize: '18px',
            backgroundColor: '#F3B141',
            color: '#843605',
            align: 'center',
            padding: {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 100
        }
        
        this.scoreLeft = this.add.text
        (
            borderUISize + borderPadding,
            borderUISize + borderPadding*2,
            this.p1Score, 
            textConfig
            );

        this.best = this.add.text
        (
            225,
            borderUISize + borderPadding*2,
            "Best: " + this.highScore,
            textConfig
        );

        // Timer
        this.gameClock = game.settings.gameTimer;

        this.timeLeft = this.add.text
        (
            400,
            borderUISize + borderPadding*2,
            this.timeFormat(this.gameClock),
            textConfig
        );

        this.timedEvent = this.time.addEvent
        (
            { 
                delay: 1000, 
                callback: () =>
                {
                    this.gameClock -= 1000; 
                    this.timeLeft.text = this.timeFormat(this.gameClock);
                },
                callbackScope: this, 
                loop: true 
            }
        );

        
        // GAME OVER flag
        this.gameOver = false;

        // 60-second play clock
        textConfig.fixedWidth = 0;
        this.clock = this.time.delayedCall(game.settings.gameTimer, () => {
            this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', textConfig).setOrigin(0.5);
            this.add.text(game.config.width/2, game.config.height/2 + 64, 'Press (R) to Restart or ← to Menu', textConfig).setOrigin(0.5);
            this.gameOver = true;
        }, null, this);
    }

    update() {
        // Stop music from overlapping
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.playMusic.stop();
            this.scene.restart();
        }
        
        // Check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= 4;  // update tile sprite

        if(!this.gameOver) {
            this.p1Rocket.update();             // update p1
             this.ship01.update();               // update spaceship (x3)
            this.ship02.update();
            this.ship03.update();
        }

        // Check collisions
        if(this.checkCollision(this.p1Rocket, this.ship03)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship03);
        }
        if (this.checkCollision(this.p1Rocket, this.ship02)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship02);
        }
        if (this.checkCollision(this.p1Rocket, this.ship01)) {
            this.p1Rocket.reset();
            this.shipExplode(this.ship01);
        }
    }

    checkCollision(rocket, ship) {
        // Simple AABB checking
        if (rocket.x < ship.x + ship.width && 
            rocket.x + rocket.width > ship.x && 
            rocket.y < ship.y + ship.height &&
            rocket.height + rocket.y > ship. y) {
                return true;
        } else {
            return false;
        }
    }

    shipExplode(ship) {
        // Temporarily hide ship
        ship.alpha = 0;  

        // Create explosion sprite at ship's position
        let boom = this.add.sprite(ship.x, ship.y, 'explosion').setOrigin(0, 0);
        boom.anims.play('explode');             // play explode animation
        boom.on('animationcomplete', () => {    // callback after anim completes
            ship.reset();                         // reset ship position
            ship.alpha = 1;                       // make ship visible again
            boom.destroy();                       // remove explosion sprite
        });

        // Score add and repaint
        this.p1Score += ship.points;
        this.scoreLeft.text = this.p1Score;
        
        // Update high score
        if (this.p1Score > this.highScore)
        {
            this.highScore = this.p1Score;
            localStorage.setItem("score", this.highScore);
            this.best.text = "Best: " + this.highScore;
        }

        this.sound.play('sfx_explosion');
      }

    // Helper function to format time  
    timeFormat(ms)                      // Take in milliseconds
    {
        let s = ms/1000;                // Find seconds
        let min = Math.floor(s/60);     // Find minutes
        let seconds = s%60;             // Seconds 
        seconds = seconds.toString().padStart(2, "0");
        return `${min}:${seconds}`;
    }
}
