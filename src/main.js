let config = {
  type: Phaser.CANVAS,
  width: 640,
  height: 480,
  scene: [ Menu, Play ]
}

let game = new Phaser.Game(config);

// Set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// Reserve keyboard variables
let keyF, keyR, keyLEFT, keyRIGHT;

/*
    Mods (total 100 pts):
    • Track a high score that persists across scenes and display it in the UI (5)
    • Add your own (copyright-free) background music to the Play scene (5)
    • Implement the speed increase that happens after 30 seconds in the original game (5)
    • Allow the player to control the Rocket after it's fired (5)
    • Display the time remaining (in seconds) on the screen (10)
    • Create a new title screen (e.g., new artwork, typography, layout) (10)
    • Implement parallax scrolling (10)
    • Create new artwork for all of the in-game assets (rocket, spaceships, explosion) (20)
    • Implement a simultaneous two-player mode. In this mode there are two rockets at the same time, 
      each with its own (key) controls, each capable of independent firing. (30)
*/
a