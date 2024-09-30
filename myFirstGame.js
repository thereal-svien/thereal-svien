//in case someone had opened Inspect
console.warn("IMPORTANT: DO NOT ADJUST THE GAME CODE")

// Allow HTML to adjust variables in the styles
function updateCSSVar(variable, value) {
	// Update the corresponding CSS variable
	document.documentElement.style.setProperty(`--${variable}`, value);
};

// Misc for styles
	let darkModeEnabled = false;  // Boolean for dark mode

	// Toggle dark mode with a checkbox
	document.getElementById('dark-mode').addEventListener('change', (event) => {
		darkModeEnabled = event.target.checked;
		toggleDarkMode(darkModeEnabled);
	});

	// Function to apply dark mode based on the boolean flag
	function toggleDarkMode(enabled) {
		if (enabled) {
			document.body.style.backgroundColor = '#1C3A59';
			document.body.style.color = '#e5ddf7';
			document.button.style.color = '#4893BF'
		} else {
			document.body.style.backgroundColor = '#e5ddf7';  // Original background color
			document.body.style.color = '#1C3A59';  // Original text color
			document.button.style.color = '#CDA8EE';
		}
	}
    function changeCSSVariable(variableName, value) {
        // Set the CSS variable dynamically
        document.documentElement.style.canvas(`--${variableName}`, value + 'px');
	}

// Reset html settings
function resetAllSettings() {
	changeCSSVariable(game-border-radius, 10);
};


// Create a canvas element and set up the context
const canvas = document.createElement('canvas');
canvas.width = 1300;
canvas.height = 400;
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

// Starts game loop once
var alreadyStartedGame = false;

// Music and other audio
function playMusic() {
	var music = new Audio('assets/audio/Pixel War.ogg');
	var music = new Audio('assets/audio/Pixel War.mp3'); // Use relative path

	// Start music on user interaction
	document.getElementById('start-game').addEventListener('click', () => {
		music.play().catch(error => {
			console.error('Audio playback was prevented:', error);
		});
		if (!alreadyStartedGame) {
			update(); // Start the game loop
			alreadyStartedGame = true; // Click once only
			music.volume = 1; // Set volume to maximum (0.0 to 1.0)
			music.play();
		}
	});

}
playMusic();

var playerSfx = {
	dead: new Audio('assets/audio/death.wav'),
	jump: new Audio('assets/audio/jump.wav'),
	land: new Audio('assets/audio/landing.wav'),
};
var levels = {
	advance: new Audio('assets/audio/nextlvl.wav'),
}


// Setup
let level = 1;
console.log(level);
var platforms;
function levelStructure() {
	if (level === 1) {
		platforms = [
			{ x: 0, y: 350, width: 700, height: 50, type: 'normal'},   // ground
			{ x: 950, y: 335, width: 360, height: 65, type: 'normal'},   // ground
			{ x: 160, y: 280, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 300, y: 200, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 520, y: 146, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 758, y: 69, width: 100, height: 10, type: 'normal'}   // floating platform
		];
	};
	if (level === 2) {
		platforms = [
			{ x: 0, y: 350, width: 100, height: 50, type: 'normal'},   // ground
			{ x: 125, y: 280, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 100, y: 220, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 130, y: 160, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 113, y: 100, width: 100, height: 10, type: 'normal'},   // floating platform
			// this batch
			{ x: 495, y: 280, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 514, y: 220, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 493, y: 160, width: 100, height: 10, type: 'normal'},  // floating platform
			{ x: 531, y: 100, width: 100, height: 10, type: 'normal'},   // floating platform
			
			{ x: 900, y: 355, width: 90, height: 20, type: 'normal'},   // floating platform
			{ x: 1100, y: 305, width: 10, height: 10, type: 'normal'},   // floating platform
		];
	};
}

// Game settings

const gravity = 0.5;
const friction = 0.9;

//Misc
const loopTimes = 1;
let count = 0;
const timer = {
	frames: 0,
	seconds: 0
};
let fps = 60;
let advanceLevelTransparency = 00;
let glowEdgeAura;
let glowFrame;
var stayingOnGround;

// Player object
const player = {
    x: 50,
    y: 300,
    width: 40,
    height: 40,
    color: 'blue',
    dx: 0,
    dy: 0,
    speed: 5,
    jumpPower: -10,
    grounded: false
};

const spawn = {
	x: player.x,
	y: player.y
};

// Platform objects
levelStructure();

// Key handling
const keys = {
    right: false,
    left: false,
    up: false
};

// Event listeners for key presses
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.right = true;
    if (e.code === 'ArrowLeft') keys.left = true;
    if (e.code === 'ArrowUp' && player.grounded) {
		playerSfx.jump.play().catch(error => {
			console.error('Audio (jump) playback was prevented:', error);
		});
		playerSfx.jump.volume = 0.5;
		playerSfx.jump.play();
        player.dy = player.jumpPower;  // Apply jump power
        player.grounded = false;       // Player is in the air
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' ) keys.right = false;
    if (e.code === 'ArrowLeft' ) keys.left = false;
});

// Death
function death() {
	playerSfx.dead.play().catch(error => {
		console.error('Audio (death) playback was prevented:', error);
	});
	playerSfx.dead.volume = 1;
	playerSfx.dead.play();
	console.log ("Player died at x" + player.x + " y" + player.y)
	player.x = spawn.x;
	player.y = spawn.y;
	player.dx = 0;
	player.dy = 0;
};


// Types of platforms


// Advance level
function nextLevel() {
	level ++;
	player.x = spawn.x;
	player.y = spawn.y;
	levelStructure();
	levels.advance.play().catch(error => {
		console.error('Audio (advancing level) playback was prevented:', error);
	});
	levels.advance.volume = 1;
	levels.advance.play();
};

document.getElementById('go-to-level').addEventListener('click', () => {
	level = prompt("Select level...") - 1;
	nextLevel();
	console.log("We have teleported to level " + level);
});
	

// Game loop
function update() {
	// Timer
	timer.frames ++
	timer.seconds += 1 / fps
	
	// frames per second
	
	
	// animate transparency
	advanceLevelTransparency = Math.floor(90 * Math.abs(Math.sin(timer.frames * 21)))
	
    // Player movement
    if (keys.right) player.dx = player.speed;
    if (keys.left) player.dx = -player.speed;
    if (!keys.right && !keys.left) player.dx *= friction;

    // Apply gravity
    player.dy += gravity;

    // Update player position
	count = 0;
	while (count != loopTimes) {
		count += 1;
		player.x += player.dx / loopTimes;
		player.y += player.dy / loopTimes;
	

		// Keep the player on the ground
		if (player.y + player.height > canvas.height) {
			player.y = canvas.height - player.height;
			player.dy = 0;
			player.grounded = true;
			stayingOnGround ++;
			if (stayingOnGround = 1) {
				playerSfx.land.play().catch(error => {
					console.error('Audio (landing) playback was prevented:', error);
				});
				playerSfx.land.volume = 1;
				playerSfx.land.play();
			}
		} else {
			stayingOnGround = 0;
		};
	};
	

	
    // Platform collision detection
    player.grounded = false;  // Assume player is not on the ground
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height < platform.y + platform.height) {
            player.dy = 0;  // Stop falling
            player.grounded = true;
            player.y = platform.y - player.height;  // Place player on top of the platform
        }
    });

    // Prevent player from going off the canvas
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = nextLevel();
	if (player.y < 0) {
		player.y = 0;
		player.dy = 0;
	}
	if (player.y > 359) death();
	

    // Clear the canvas before drawing
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw platforms
    platforms.forEach(platform => {
	if (platform.type = 'normal') {
		ctx.fillStyle = 'green';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
	};
    });

    // Request next frame
    requestAnimationFrame(update);
	
	// glowing edge to advance level
	glowFrame ++
	if (glowFrame === 30) glowEdgeAura = 'ff';
	if (glowFrame === 60) glowEdgeAura = 'dd';
	if (glowFrame === 90) {
		glowEdgeAura = 'bb';
		glowFrame = 0;
	};
	ctx.fillStyle = '#0ff6a1bb';
    ctx.fillRect(canvas.width - 40, 0, 40, canvas.height);
	//
	
	// Display xy pos in the console
	document.addEventListener('keydown', (e) => {
		if (e.code === 'Space') {
			console.log("Player's xy position")
			console.log(player.x)
			console.log(player.y)
		}
	});

}

// Start the game loop
console.log (glowEdgeAura);
