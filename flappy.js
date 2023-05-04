// Flappy Bird Clone JS
// Version 1.0.0e build 3/27/2023
// Written by Dan Andersen
// Original code base provided by Codepen.com
// https://codepen.io/ju-az/pen/eYJQwLx
// Source was heavily modified.

const _VERSION_ = "1.0.0g";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// delta time
const frames_per_second = 60;
let previousTime = performance.now();

const frame_interval = 1000 / frames_per_second;
let delta_time_multiplier = 1;
let delta_time = 0;

// load sprites
const sprites = new Image();
sprites.src = "assets/flappy-bird-set.png";

const logo = new Image();
logo.src = "assets/fb-logo.png";

const ufo_sprite = new Image();
ufo_sprite.src = "assets/airplane.png";

const ufo_warning = new Image();
ufo_warning.src = "assets/warning_arrow.png";

//EasterEgg Sprite
// const egg_sprite = new Image();
// egg_sprite.src = "assets/eastereggs.png";
// const egg_size = [158, 178];

// load media
const jump_fx = new Audio('assets/bloop.ogg');
jump_fx.load();

const airplane_fx = new Audio('assets/airplane.ogg');
airplane_fx.load();

const blast_fx = new Audio('assets/blast.ogg');
blast_fx.load();

const game_objects = {
// background 
	background : {
		size : [431, 768],
		draw_size : [0, 0], // for scaling
		canvas_fill : 0,
		speed : 0,
		lastPOS_x : 0
	},

// ground
	ground : {
		size : [550, 150],
		draw_size : [0, 0], // for scaling
		canvas_fill : 0, // Math.ceil(SCREEN_SIZE[0] / ground.size[0]) + 1;
		collision : 0, // SCREEN_SIZE[1] - ground.size[1];
		speed : 0,
		lastPOS_x : 0
	},

// pipes
	pipe_array_data : {
		x : 0, 
		y : 0, 
		scored : false, // flag to ensure score is only counted once per pipe

		type_index : 0, // 0 = "green", 1 = "blue", 3 = "red"

		inverse_y : 0, // for movable pipes (blue)'
		
		red_top_or_btm : false, // true = top pipe, false = bottom pipe
		
		blasted : false, // check if the cannon has already been fired (red).
		reached_max_blast_height : false,
		cannon_Y : 0 // track trajectory of cannonball
	},

	pipe : {
		// sprite dimensions
		green : { // classic pipe
			top_pipe : [432,511],
			btm_pipe : [510,108],
			stem_pipe : [432,110]
		},
		
		blue : { // moving pipe
			top_pipe : [588,511],
			btm_pipe : [666,108],
			stem_pipe : [588,110]
		},
		
		red : { // cannonball pipe
			top_pipe : [744,511],
			btm_pipe : [822,108],
			stem_pipe : [744,110],

			cannonball_sprite : [500, 0],
			cannonball_size : [62, 62],
			cannonball_draw_size : [0, 0],
			blast_speed: 11.5,
			max_blast_height: 0
		},
		
		pipe_size : [78,77],
		stem_size : [78, 0],
		max_stem_size : 400,
		
		draw_size : [0, 0], // draw_scaling
		
		// 0 = distance between each pipe
		// 1 = distance between top and bottom for each pair of pipe
		pipeGap : [270, 220],
		
		start_position : 0,
		max_num_of_pipes : 0,

		total_pipes : 0
	},

// player
	player : {
		// sprite dimensions
		size : [51, 36],
		x_adjustment : 0,
		flyHeight : 0,
		
		draw_size : [0, 0], // draw scaling
		
		sprite_index : 0, // 0 - 2
		max_sprites : 3, // bird has 3 frames
		sprite_interval : 3, // how often to change the index
		last_sprite_update : 0, // when was the last frame update
		
		jump : -11.5,
		flight : 0,
	},

// ufo
	ufo : {
		// sprite dimensions
		size : [248, 161],
		warning_size : [50, 50],
		sprite_scale : 1,
		
		// draw scaling constrants
		scale_min : .5,
		scale_max : .75,
		draw_size : [0, 0], // draw scaling
		
		startPOS : 0,
		currentPOS : [0,0],
		interval : 10, // spawn new ufo when score % interval = 0
		LastSpawn : 0,
		
		speed : 0

	},

	game : {
		gamePlaying : false,

		easterEgg: false,
		
		gravity : 0.5,
		
		speed : 5.5,//6.2,
		
		increased_speed : 0,
		
		currentScore : 0,
		bestScore : 0,
		attempts : 0
	}
};

const scoreboard_buffer = 0;//32;
let SCREEN_SIZE = [window.innerWidth, game_objects.background.size[1]];
let Y_Scaling = 1;

// checks to see if vertical space > game height for scaling
if (window.innerHeight > SCREEN_SIZE[1]) {
	SCREEN_SIZE[1] = window.innerHeight - scoreboard_buffer; 
	Y_Scaling = SCREEN_SIZE[1] / game_objects.background.size[1];
}

set_scaling(); // sets draw sizes for objects based on resolution

// adjust canvas size
ctx.canvas.width = SCREEN_SIZE[0];
ctx.canvas.height = SCREEN_SIZE[1];

// game settings
game_objects.game.increased_speed = game_objects.game.speed;

game_objects.background.canvas_fill = Math.ceil(SCREEN_SIZE[0] / game_objects.background.draw_size[0]);

game_objects.ground.canvas_fill = Math.ceil(SCREEN_SIZE[0] / game_objects.ground.draw_size[0]);
game_objects.ground.collision = SCREEN_SIZE[1] - (game_objects.ground.size[1] * (Y_Scaling / 1.5));

game_objects.pipe.start_position = SCREEN_SIZE[0] + game_objects.pipe.pipeGap[0] + game_objects.pipe.draw_size[0];
game_objects.pipe.max_num_of_pipes = Math.ceil(SCREEN_SIZE[0] / (game_objects.pipe.pipe_size[0] + game_objects.pipe.pipeGap[0])) + 1;
game_objects.pipe.red.max_blast_height = game_objects.pipe.pipeGap[1];

game_objects.ufo.startPOS = (SCREEN_SIZE[0] + (game_objects.ufo.draw_size[0] * game_objects.ufo.sprite_scale)) * 1.75;

const player_center_pos = ((SCREEN_SIZE[0] / 2) - (game_objects.player.draw_size[0] / 2));

const playerAdjustment = (SCREEN_SIZE[0] / 2) < (game_objects.pipe.pipeGap[0] * 1.75);

// if portrait mode then adjust player to the left side of the screen
if (playerAdjustment) {	
	game_objects.player.x_adjustment = SCREEN_SIZE[0] / 7;
} else { 
	game_objects.player.x_adjustment = player_center_pos; 
}

//  mobile or desktop device
function isTouchDevice() { return (window.ontouchstart !== undefined); }
const __touch_device__ = isTouchDevice();

// All variables are initialized

/////////////////////////////////////////////////////

let game = game_objects;
let pipes = [];

function InvertPosition(y, canvas_size) {

	let x = canvas_size / 2;
	let  z = (x - y);
	z += x;
	return z;
}

function pipeLoc() { return ( game.pipe.draw_size[1] + (Math.random() * ((game.ground.collision / 2) - game.pipe.draw_size[1]))); }

function set_scaling() {

	// setting draw size scaling for game objects
	game_objects.background.draw_size[0] = game_objects.background.size[0] * Y_Scaling;
	game_objects.background.draw_size[1] = game_objects.background.size[1] * Y_Scaling;
	
	game_objects.ground.draw_size[0] = game_objects.ground.size[0] * Y_Scaling;
	game_objects.ground.draw_size[1] = game_objects.ground.size[1] * Y_Scaling;
	
	game_objects.ufo.draw_size = [game_objects.ufo.size[0] * Y_Scaling, game_objects.ufo.size[1] * Y_Scaling];
	
	game_objects.player.draw_size = [game_objects.player.size[0] * Y_Scaling, game_objects.player.size[1] * Y_Scaling];
	game_objects.player.jump *= Y_Scaling;
	
	game_objects.pipe.pipeGap[0] *= Y_Scaling;
	game_objects.pipe.pipeGap[1] *= Y_Scaling;
	
	game_objects.pipe.draw_size[0] = game_objects.pipe.pipe_size[0] * Y_Scaling;
	game_objects.pipe.draw_size[1] = game_objects.pipe.pipe_size[1] * Y_Scaling;
	game_objects.pipe.red.cannonball_draw_size[0] = game_objects.pipe.red.cannonball_size[0] * Y_Scaling;
	game_objects.pipe.red.cannonball_draw_size[1] = game_objects.pipe.red.cannonball_size[1] * Y_Scaling;
	game_objects.pipe.red.blast_speed *= Y_Scaling;
	
	game_objects.game.gravity *= Y_Scaling;
	game_objects.game.speed *= Y_Scaling;
}

function start() {

	window.requestAnimationFrame(run_game);

}

function run_game(currentTime) {
	
	delta_time = currentTime - previousTime;
	delta_time_multiplier = Math.max(delta_time / frame_interval, 1); // caps at FPS (60)
		
	if (delta_time >= Math.floor(frame_interval)) { 
	
		previousTime = currentTime;

		draw_background();

		// pipe display
		if (game.game.gamePlaying) {
			
			pipes.forEach(draw_pipes);
			pipes = spawn_pipes(pipes);

			draw_UFO();
					
		} else {
			
			start_screen();

		}

		update_score();

		draw_player();
	
		game_over();

		draw_ground();

	}
	
	window.requestAnimationFrame(run_game);
	
}

// reset game functions
function game_reset() {
	
	game.game.currentScore = 0;
	
	game.ufo.LastSpawn = 0;
	game.ufo.currentPOS[0] = -(game.ufo.draw_size[0] * game.ufo.sprite_scale);
	game.ufo.currentPOS[1] = ufo_Elevation();
		
	game.game.increased_speed = game.game.speed;
	game.player.flight = game.player.jump;
	
	// set initial flyHeight (middle of screen - size of the bird)
	game.player.flyHeight = (game.ground.collision / 2) - (game.player.draw_size[1] / 2);
	
	game.pipe.total_pipes = 0;
	pipes = IntializePipes();
	
	spawn_ufo();
	
	game.game.gamePlaying = true;

	game.game.easterEgg = false;

}

function game_over() {
	// player hit the ground
	if ((game.player.flyHeight + game.player.draw_size[1]) >= game.ground.collision) {
		game.game.gamePlaying = false;

	}
	
	// player hit UFO
	if (ufo_collision()) { 
		game.game.gamePlaying = false; 

	}
	
}

function draw_background() {
	 // tile background	 
	 
	game.background.speed = game_objects.game.increased_speed / 10;
	
	for (let i = 0; i <= game.background.canvas_fill; i++) {
		ctx.drawImage(sprites, 0, 0, ...game.background.size, 
			game.background.lastPOS_x + (i * game.background.draw_size[0]), 0, 
				...game.background.draw_size);
	}
	
	if (game.background.lastPOS_x <= -game.background.draw_size[0]) {
		game.background.lastPOS_x = 0; // reset
	} else {
		game.background.lastPOS_x -= game.background.speed * delta_time_multiplier;
	}
}

function draw_ground() {
    // tile ground
	game.ground.speed = game_objects.game.increased_speed;	
	
	for (let i = 0; i <= game.ground.canvas_fill; i++) {
		ctx.drawImage(sprites, 0, game.background.size[1], ...game.ground.size, 
			game.ground.lastPOS_x + (i * game.ground.draw_size[0]), game.ground.collision, 
				...game.ground.draw_size);
	}
	
	if (game.ground.lastPOS_x <= -game.ground.draw_size[0]) {
		game.ground.lastPOS_x = 0; // reset
	} else {
		game.ground.lastPOS_x -= game.ground.speed * delta_time_multiplier;
	}
}


// ufo functions
function ufo_Elevation() {
	return Math.random() * (game.ground.collision - game.ufo.draw_size[1]);
}

function random_UFO_size() { 
	
	let x = game.ufo.scale_min + Math.random();
	while (x > game.ufo.scale_max) { // loop that ensures random size stays within min and max constrants
		y = x - game.ufo.scale_max;
		x = game.ufo.scale_min + y;
	}
	return x;
}

function draw_UFO() {
	
	if ((game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale)) > 0) {
		game.ufo.currentPOS[0] -= game.ufo.speed * delta_time_multiplier;
		
	} else if (((game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale)) < 0) // check to make sure ufo on not screen
			&& (game.game.currentScore > 0) // dont spawn unless currentScore > 0
				&& (game.game.currentScore % game.ufo.interval === 0) // score trigger spawn interval
					&& (game.ufo.LastSpawn !== game.game.currentScore)) // make sure not spawn more than once per interval
	{ 
		spawn_ufo();
	}
	
	if (game.ufo.currentPOS[0] > (SCREEN_SIZE[0] + game.ufo.draw_size[0])) {
		
		// show warning arrow when ufo is off screen
		ctx.drawImage(ufo_warning, 1, 0, ...game.ufo.warning_size, 
			SCREEN_SIZE[0] - ((game.ufo.warning_size[0] * Y_Scaling) * 1.25), game.ufo.currentPOS[1] + (game.ufo.warning_size[1] / 2), 
				game.ufo.warning_size[0] * Y_Scaling, game.ufo.warning_size[1] * Y_Scaling);
	}  
	
	// draw ufo
	ctx.drawImage(ufo_sprite, 1, 0, ...game.ufo.size, 
		...game.ufo.currentPOS,
			game.ufo.draw_size[0] * game.ufo.sprite_scale, game.ufo.draw_size[1] * game.ufo.sprite_scale);
	
	
}

function spawn_ufo() {
	
	game.ufo.speed = game.game.increased_speed * 3;
	console.log("UFO SPAWNED!");
	airplane_fx.play();
	// reset UFO when it's off screen and every 5 points
	game.ufo.currentPOS[0] = game.ufo.startPOS;
	game.ufo.currentPOS[1] = ufo_Elevation();
	game.ufo.sprite_scale = random_UFO_size();
	game.ufo.LastSpawn = game.game.currentScore; // interval tracking	
}

function ufo_collision() {
	
	if  (
		(game.ufo.currentPOS[0] <= game.player.x_adjustment + game.player.draw_size[0]) && 
		(game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale) >= game.player.x_adjustment) &&
		(game.player.flyHeight + game.player.draw_size[1] >= game.ufo.currentPOS[1]) && 
		(game.player.flyHeight <= game.ufo.currentPOS[1] + (game.ufo.draw_size[1] * game.ufo.sprite_scale))	
	) {
		return 1;
		console.log("HIT UFO!");
	}
	
	return 0;

}	


// pipe functions
function IntializePipes() {

	let pipes_array = [];
	
	for (let i = 0; i < game.pipe.max_num_of_pipes; i++) {
	
		const temp = {...game.pipe_array_data};
		
		temp.x = game.pipe.start_position + (i * (game.pipe.pipeGap[0] + game.pipe.draw_size[0]));
		temp.y = pipeLoc();
		temp.type_index = level_up(); // start with green pipes
		temp.inverse_y = moving_pipe_invert(temp.y);
		temp.red_top_or_btm = Boolean(Math.round(Math.random()));

		// metric for movable pipe
		
		pipes_array.push(temp);

		game.pipe.total_pipes++;
	}
	
	return pipes_array;
}

function spawn_pipes(pipes_array) {

	// create new pipe when pipe[0].x goes offscreen
	
	if (pipes_array[0].x <= -game.pipe.draw_size[0]) {
		
		console.log("NEW PIPE!");
		
		const new_pipes = pipes_array;
					
		new_pipes.shift();
		
		// new pipe		
		const temp = {...game.pipe_array_data};
		temp.x = pipes[(pipes.length - 1)].x + (game.pipe.pipeGap[0] + game.pipe.draw_size[0]);
		temp.y = pipeLoc();
		temp.type_index = level_up();
		temp.inverse_y = moving_pipe_invert(temp.y);
		temp.red_top_or_btm = Boolean(Math.round(Math.random())); //randomizes if the red pipe will be on the top of bottom of the screen
		
		new_pipes.push(temp);

		game.pipe.total_pipes++;
		
		return new_pipes;
		
	} 
		
	return pipes_array;
	
}

function level_up() {
	return game.pipe.total_pipes < 5 ? 0 : Math.round(Math.random() * 2);	
}

function moving_pipe_invert(y) {
	
	let x = InvertPosition(y, game.ground.collision - game.pipe.draw_size[1]);
	
	if (Math.abs(x - y) < game.pipe.pipeGap[1]) { 
		if (x > y) {
			x = y - game.pipe.pipeGap[1];
		} else {
			x = y + game.pipe.pipeGap[1]; 
		}
	}
	
	return x;
}

function draw_pipes(pipe) {		
									
	// pipe moving	
	pipe.x -= game.game.increased_speed * delta_time_multiplier;
	
	let top_pipe, btm_pipe, stem_pipe;
	
	switch (pipe.type_index) {
		case 0: // green pipe
			top_pipe = [game.pipe.green.top_pipe[0], game.pipe.green.top_pipe[1]];
			btm_pipe = [game.pipe.green.btm_pipe[0], game.pipe.green.btm_pipe[1]];
			stem_pipe= [game.pipe.green.stem_pipe[0], game.pipe.green.stem_pipe[1]];

			break;

		case 1: // blue pipe
			top_pipe = [game.pipe.blue.top_pipe[0], game.pipe.blue.top_pipe[1]];
			btm_pipe = [game.pipe.blue.btm_pipe[0], game.pipe.blue.btm_pipe[1]];
			stem_pipe = [game.pipe.blue.stem_pipe[0], game.pipe.blue.stem_pipe[1]];

			// movable pipes - pipe index 1 - blue pipe
			if (pipe.x < (SCREEN_SIZE[0] + game.pipe.draw_size[0]) && !pipe.scored) {
				if (pipe.inverse_y > pipe.y) {
					pipe.y += (1 * Y_Scaling) * delta_time_multiplier;
				} else {
					pipe.y -= (1 * Y_Scaling) * delta_time_multiplier; 
				}
			}

			break;

		case 2:  // red pipe
			top_pipe = [game.pipe.red.top_pipe[0], game.pipe.red.top_pipe[1]];
			btm_pipe = [game.pipe.red.btm_pipe[0], game.pipe.red.btm_pipe[1]];
			stem_pipe= [game.pipe.red.stem_pipe[0], game.pipe.red.stem_pipe[1]];

			// check to see if cannon has been blasted
			if (pipe.blasted) { 
				draw_cannonball(pipe); 
				cannonball_logic(pipe); 
			} else {
				//code for checking why cannon hasn't been blasted yet.
				check_for_blastoff(pipe);
			}
			// write code for cannonball
			break;
	}

	if (!(pipe.type_index === 2 && !pipe.red_top_or_btm)) { // checking red pipe logic
		// top pipe_stem
		let x = 0;
		let y = pipe.y - game.pipe.draw_size[1];
		draw_pipe_stems(x, y, stem_pipe, pipe);
				
		// top_pipe
		ctx.drawImage(sprites, ...top_pipe, ...game.pipe.pipe_size, 
			pipe.x, pipe.y - game.pipe.draw_size[1] - 1, ...game.pipe.draw_size);
	}

	if (!(pipe.type_index === 2 && pipe.red_top_or_btm)) { // checking red pipe logic
		// bottom pipe_stem
		let y = pipe.y + game.pipe.pipeGap[1] + game.pipe.draw_size[1];
		let x = game.ground.collision - y;
		draw_pipe_stems(y, x, stem_pipe, pipe);
			
		// bottom_pipe
		ctx.drawImage(sprites, ...btm_pipe, ...game.pipe.pipe_size, 
			pipe.x, pipe.y + game.pipe.pipeGap[1] + 1, ...game.pipe.draw_size);
	}

	pipe_logic(pipe); // collision and scoring detection

	
}

function check_for_blastoff(pipe) {

	if (pipe.x - game.player.x_adjustment <= (game.pipe.pipeGap[0] / 1.5)) {
		
		if (pipe.red_top_or_btm) {
			pipe.cannon_Y = pipe.y - game.pipe.red.cannonball_draw_size[1]; // top pipe cannonball starting position
		} else {
			pipe.cannon_Y = pipe.y + game.pipe.pipeGap[1] + game.pipe.red.cannonball_draw_size[1]; // bottom pipe cannonball starting position
		}
		
		pipe.blasted = true;
		blast_fx.play();
	}

}

function draw_cannonball(pipe) {

	if (pipe.red_top_or_btm) { //top pipe
		pipe.cannon_Y += game.pipe.red.blast_speed * delta_time_multiplier;
	} else {
		pipe.cannon_Y -= game.pipe.red.blast_speed * delta_time_multiplier;
	}

	let x = pipe.x + (game.pipe.draw_size[0] / 2) - (game.pipe.red.cannonball_draw_size[0] / 2);

	// cannon ball	
	ctx.drawImage(sprites, ...game.pipe.red.cannonball_sprite, ...game.pipe.red.cannonball_size,
		x, pipe.cannon_Y, ...game.pipe.red.cannonball_draw_size);

}

function draw_pipe_stems(y, stem_size, stem_pipe, pipe) {
	
	let x, z;
	
	while (stem_size > 0) {
		if (stem_size > game.pipe.max_stem_size) { 
			x = game.pipe.max_stem_size;
		} else {
			x = stem_size;
		}
		ctx.drawImage(sprites, ...stem_pipe, game.pipe.stem_size[0], x, 
			pipe.x, y, game.pipe.draw_size[0], stem_size); 

		y += x;
		stem_size -= game.pipe.max_stem_size;
	}

}

function cannonball_logic(pipe) {

	let cannon_x = pipe.x + (game.pipe.draw_size[0] / 2) - (game.pipe.red.cannonball_draw_size[0] / 2);

	let check_x1 = cannon_x <= game.player.x_adjustment + game.player.draw_size[0];
	let check_x2 = cannon_x + game.pipe.red.cannonball_draw_size[0] >= game.player.x_adjustment;

	let check_y1 = pipe.cannon_Y <= game.player.flyHeight;
	let check_y2 = pipe.cannon_Y + game.pipe.red.cannonball_draw_size[1] >= game.player.flyHeight + game.player.draw_size[1];

	if ([check_x1, check_x2, check_y1, check_y2].every((elem) => elem)) {
		
		console.log("HIT CANNONBALL!");
		game.game.gamePlaying = false;
		
	}

}

function pipe_logic(pipe) {
	
	// if hit the pipe, end

	// check if player has entered into x-axis of oncoming pipe
	let check_pipe_x1 = pipe.x <= game.player.x_adjustment + game.player.draw_size[0];
	let check_pipe_x2 = pipe.x + game.pipe.draw_size[0] >= game.player.x_adjustment;

	// check if has hit the top or bottom pipe
	let check_top_pipe = pipe.y > game.player.flyHeight && 
		(!(pipe.type_index === 2 && !pipe.red_top_or_btm)); // red pipe logic
	let check_btm_pipe = pipe.y + game.pipe.pipeGap[1] < game.player.flyHeight + game.player.draw_size[1] &&
		 (!(pipe.type_index === 2 && pipe.red_top_or_btm)); // red pipe logic
	
	if ([check_pipe_x1, check_pipe_x2, check_top_pipe || check_btm_pipe].every((elem) => elem)) {
		
		console.log("HIT PIPE!");
		game.game.gamePlaying = false;
		
	} else if ((pipe.x + game.pipe.draw_size[0]) < game.player.x_adjustment && pipe.scored === false) { 
	// check to see if pipe moves past theshold for the first time.
	
		pipe.scored = true; // flag so we don't count the same pipe more than once
		console.log("SCORE!");
		game.game.currentScore++; // score!
		game.game.bestScore = Math.max(game.game.bestScore, game.game.currentScore); // high score
		
		if (game.game.currentScore >= 100 ) { game.game.easterEgg = true; } //easter egg for easter!
		
		//game.game.increased_speed = (game.game.speed + (game.game.currentScore / 10)) // increase speed by 0.1

	}
}

// player functions
function draw_player() {
	let x;
	if (game.game.gamePlaying) {
		
		x = game.player.x_adjustment;			
		game.player.flight += game.game.gravity * delta_time_multiplier;
		game.player.flyHeight = Math.min(game.player.flyHeight + game.player.flight, game.ground.collision - game.player.draw_size[1]);
	
	} else {
		x = player_center_pos;
		game.player.flyHeight = (SCREEN_SIZE[1] / 2) - (game.player.draw_size[1] / 2);
	}
	
	// interval for frame update
	delta = (previousTime - game.player.last_sprite_update) / frame_interval;
	
	if (delta >= game.player.sprite_interval) {
	
		if (game.player.sprite_index === game.player.max_sprites - 1) 
			{ game.player.sprite_index = 0; } else { game.player.sprite_index++; }
		
		game.player.last_sprite_update = previousTime;
	
	}

	ctx.drawImage(sprites, 433, game.player.sprite_index * game.player.size[1] +1, game.player.size[0], game.player.size[1]-2, //minus 1 for sprite clipping quick fix.
		x, game.player.flyHeight, ...game.player.draw_size);
		
}

function start_screen()
{
	// Click to play
	let logoScaling = 1;
	if (600 >= SCREEN_SIZE[0]) { logoScaling = 0.75; }
	// drawing logo
	ctx.drawImage(logo, 0, 0, 600, 160,
		(SCREEN_SIZE[0] / 2) - ((600 / 2) * logoScaling), (100 * Y_Scaling), (600 * logoScaling), (160 * logoScaling));
	
	let txt = "";
	if (__touch_device__) { 
		txt = "Tap to play";
	} else { 
		txt = "Click to play";
	}
	
	ctx.font = "bold 45px courier new";
	ctx.fillStyle = "#4c3b46";
	ctx.fillText(txt, SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), (550 * Y_Scaling));
	
	txt = "Version : " + _VERSION_;
	ctx.font = "bold 24px courier new";
	ctx.fillText(txt, 10, game.ground.collision - 12)
}


function update_score() {
	
	//document.getElementById('bestScore').innerHTML = `Best : ${game.game.bestScore}`;
	//document.getElementById('currentScore').innerHTML = `Current : ${game.game.currentScore}`;
	//document.getElementById('attempts').innerHTML = `Attempts : ${game.game.attempts}`;

	let box_size = [500, 250];

	//ctx.globalAlpha = 0.5;
	// ctx.strokeStyle = "#4c3b46";
	// ctx.fillStyle = "#4c3b46";
	// ctx.beginPath();
    // ctx.roundRect((SCREEN_SIZE[0] / 2) - (box_size[0] / 2), (SCREEN_SIZE[1] /  2) - (box_size[1] / 2), box_size[0], box_size[1], 50);
	// ctx.stroke();
	// ctx.fill();
    // ctx.globalAlpha = 1.0;
	
	if (game.game.gamePlaying) {
		let Y_position = 175;
		let txt = game.game.currentScore;
		ctx.font = "125px 'Press Start 2P'";
		ctx.strokeStyle = "#553847";
		ctx.lineWidth = 10;
		ctx.strokeText(txt, SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);
		ctx.fillStyle = "#fefefe";
		ctx.fillText(txt, SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);

	}
	
}

// function EasterEgg() {

// 	for (let x = 0; x < 3; x++) {

// 		ctx.drawImage(egg_sprite, 0, egg_size[1] * x + 4, ...egg_size, 
// 		50, 50 + (egg_size[1] * x) + (50 * x) , ...egg_size);

// 		ctx.drawImage(egg_sprite, egg_size[0], egg_size[1] * x + 4, ...egg_size, 
// 			SCREEN_SIZE[0] - egg_size[0] - 50, 50 + (egg_size[1] * x) + (50 * x) , ...egg_size);

// 	}

// 	let title = "Happy Easter, Penny & Ferris!";
// 	let txt = ["This is an Easter EasterEgg to help",
// 				"you on your scanvenger hunt!",
// 				" ",
// 				"You will find 2 eggs at each location.",
// 				"Take only 1 each!",
// 				"Work together to find them all!",
// 				" ",
// 				"CLUE #2:",
// 				"Your teasure can be found on the",
// 				"window sill of your parent's room."];

// 	let box_size = [800, 600];

// 	ctx.globalAlpha = 0.5;
// 	ctx.strokeStyle = "#4c3b46";
// 	ctx.fillStyle = "#4c3b46";
// 	ctx.beginPath();
// 	ctx.roundRect((SCREEN_SIZE[0] / 2) - (box_size[0] / 2), 100, box_size[0], box_size[1], 50);
// 	ctx.stroke();
// 	ctx.fill();
// 	ctx.globalAlpha = 1.0;

// 	//draw text
// 	ctx.font = "bold 40px courier new";
// 	ctx.fillStyle = "#e9fcd9";
// 	ctx.fillText(title, SCREEN_SIZE[0] / 2 - (ctx.measureText(title).width / 2), 175);

// 	ctx.font = "bold 25px courier new";

// 	for (let i = 0; i < txt.length; i++) {
// 		ctx.fillText(txt[i], SCREEN_SIZE[0] / 2 - (ctx.measureText(txt[i]).width / 2), 275 + (i * 40));
// 	}

// }

function user_input() {
	if (game.player.flyHeight > -game.player.size[1]) { // makes sure player doesnt fly off the screen
		game.player.flight = game.player.jump; // * delta_time_multiplier;
		jump_fx.play();
	}
	if (!game.game.gamePlaying) {
		game.game.attempts++;
		game_reset();
	}
}

// launch 
sprites.onload = start;
	
if (__touch_device__) {
	document.body.ontouchstart = () => {
		user_input();
	}
} else {
	document.body.onmousedown = () => { 
		user_input();
	}
	
	document.body.onkeydown = function(e) {
		if (e.key === " ") {
			user_input();
		}
	}
}

window.addEventListener('wheel', e => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });
