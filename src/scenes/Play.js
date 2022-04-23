class Play extends Phaser.Scene {
    constructor() {
        super("playScene");
    }

    preload() {
        // Load images/tile sprites
        this.load.image('rocket', './assets/rocket.png');
        this.load.image('border', './assets/border.png');
        this.load.image('spaceship', './assets/spaceship.png');
        this.load.image('starfield', './assets/starfield.png');
        this.load.image('starfield2', './assets/meteor.png');
        // Load spritesheet
        this.load.spritesheet('explosion', './assets/explosion.png', {frameWidth: 64, frameHeight: 32, startFrame: 0, endFrame: 9});
    }

    create() {
        // Place tile sprite
        this.starfield = this.add.tileSprite(0, 0, 640, 480, 'starfield').setOrigin(0, 0);
        this.starfield2 = this.add.tileSprite(0, 0, 640, 480, 'starfield2').setOrigin(0, 0);

        // Green UI background
        this.add.rectangle(0, borderUISize + borderPadding, game.config.width, borderUISize * 2, 0x00FF00).setOrigin(0, 0);
        
        // New border
        this.border = this.add.tileSprite(0, 0, 640, 480, 'border').setOrigin(0, 0);
        this.border.depth = 1;

        // add Rockets
        this.p1Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);
        this.p2Rocket = new Rocket(this, game.config.width/2, game.config.height - borderUISize - borderPadding, 'rocket').setOrigin(0.5, 0);

        // add Spaceships (x3)
        this.ship01 = new Spaceship(this, game.config.width + borderUISize*6, borderUISize*4, 'spaceship', 0, 30).setOrigin(0, 0);
        this.ship02 = new Spaceship(this, game.config.width + borderUISize*3, borderUISize*5 + borderPadding*2, 'spaceship', 0, 20).setOrigin(0,0);
        this.ship03 = new Spaceship(this, game.config.width, borderUISize*6 + borderPadding*4, 'spaceship', 0, 10).setOrigin(0,0);

        // Define keys
        keyR = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
        keyUP = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyLEFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyRIGHT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);

        this.p1Rocket.fireKey = keyUP;
        this.p1Rocket.leftKey = keyLEFT;
        this.p1Rocket.rightKey = keyRIGHT;
        this.p2Rocket.fireKey = keyW;
        this.p2Rocket.leftKey = keyA;
        this.p2Rocket.rightKey = keyD;

        // Animation config
        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 9, first: 0}),
            frameRate: 30
        });

        // Initialize scores
        this.p1Score = 0;
        this.p2Score = 0;

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
            borderUISize + borderPadding*2.5,
            this.p1Score, 
            textConfig
            );

        this.scoreRight = this.add.text
        (
            497,
            borderUISize + borderPadding*2.5,
            this.p2Score, 
            textConfig
            );

        this.best = this.add.text
        (
            215,
            borderUISize + borderPadding*2.5,
            "Best: " + this.highScore,
            textConfig
        );

        // Timer
        this.gameClock = game.settings.gameTimer;

        this.timeLeft = this.add.text
        (
            325,
            borderUISize + borderPadding*2.5,
            this.timeFormat(this.gameClock),
            textConfig
        );
            
        this.timer = this.time.addEvent
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
            this.timer.paused = true;
        }, null, this);

    }

    update() {
        // Check key input for restart / menu
        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyR)) {
            this.playMusic.stop();  // Stop music from overlapping
            this.scene.restart();
        }

        if(this.gameOver && Phaser.Input.Keyboard.JustDown(keyLEFT)) {
            this.playMusic.stop();
            this.scene.start("menuScene");
        }

        this.starfield.tilePositionX -= 4;  // update tile sprite
        this.starfield2.tilePositionX -= 2; // moves at slower speed

        if(!this.gameOver) {
            this.p1Rocket.update();             // update p1
            this.p2Rocket.update();             // update p1
            this.ship01.update();               // update spaceship (x3)
            this.ship02.update();
            this.ship03.update();
        }

        // Check collisions (p1)
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

        // Check collisions (p2)
        if(this.checkCollision(this.p2Rocket, this.ship03)) {
            this.p2Rocket.reset();
            this.shipExplode2(this.ship03);
        }
        if (this.checkCollision(this.p2Rocket, this.ship02)) {
            this.p2Rocket.reset();
            this.shipExplode2(this.ship02);
        }
        if (this.checkCollision(this.p2Rocket, this.ship01)) {
            this.p2Rocket.reset();
            this.shipExplode2(this.ship01);
        }    }

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

    shipExplode2(ship) {
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
        this.p2Score += ship.points;
        this.scoreRight.text = this.p2Score;
        
        // Update high score
        if (this.p2Score > this.highScore)
        {
            this.highScore = this.p2Score;
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
