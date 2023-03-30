// Flappy Bird Clone
// Version 1.0.0 build 3/27/2023
// Written by Dan Andersen
//


const _VERSION_ = "1.0a";

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

//load sprites
const sprites = new Image();
sprites.src = "assets/flappy-bird-set.png";
const logo = new Image();
logo.src = "assets/fb-logo.png";
const ufo_sprite = new Image();
ufo_sprite.src = "assets/airplane.png";


const game_objects = {
// background 
	background : {
		size : [431, 768],
		canvas_fill : 0,
		speed : 0
	},

// ground
	ground : {
		size : [551, 150],
		canvas_fill : 0, // Math.ceil(SCREEN_SIZE[0] / ground.size[0]) + 1;
		collision : 0 // SCREEN_SIZE[1] - ground.size[1];
	},

// pipes
	pipe_array_data : {
		x : 0, 
		y : 0, 
		scored : false, 
		moveable : false,
		inverse_y : 0
	},

	pipe : {
		//sprite dimensions
		pipe_size : [78,77],
		top_pipe : [432,511],
		btm_pipe : [510,108],
		// pipe stems
		stem_pipe : [432,110],
		stem_size : [78, 0],
		max_stem_size : 400,
		
		draw_size : [0, 0], //draw_scaling
		
		// 0 = distance between each pipe
		// 1 = distance between top and bottom for each pair of pipe
		pipeGap : [270, 220],
		
		start_position : 0,
		max_num_of_pipes : 0
	},

// player
	player : {
		//sprite dimensions
		size : [51, 36],
		x_adjustment : 0,
		flyHeight : 0,
		
		draw_size : [0, 0], //draw scaling
			
		jump : -11.5,
		flight : 0,
	},

// ufo
	ufo : {
		//sprite dimensions
		size : [248, 161],
		sprite_scale : 1,
		
		// draw scaling constrants
		scale_min : .55,
		scale_max : .9,
		draw_size : [0, 0], //draw scaling
		
		startPOS : 0,
		currentPOS : [0,0],
		interval : 5, //spawn new ufo when score % interval = 0
		LastSpawn : 0,
		
		speed : 0
	},

	game : {
		gamePlaying : false,
		gravity : 0.5,
		speed : 6.2,
		
		increased_speed : 0,
		
		currentScore : 0,
		bestScore : 0,
		attempts : 0
	}
};

const scoreboard_buffer = 32;
let SCREEN_SIZE = [window.innerWidth, game_objects.background.size[1]];
let Y_Scaling = 1;

//checks to see if vertical space > game height for scaling
if (window.innerHeight > SCREEN_SIZE[1]) {
	SCREEN_SIZE[1] = window.innerHeight - scoreboard_buffer; 
	Y_Scaling = SCREEN_SIZE[1] / game_objects.background.size[1];
}

set_scaling(); 

//adjust canvas size
ctx.canvas.width = SCREEN_SIZE[0];
ctx.canvas.height = SCREEN_SIZE[1];

// game settings
game_objects.game.increased_speed = game_objects.game.speed;

game_objects.background.speed = game_objects.game.speed / 5;
game_objects.background.canvas_fill = Math.ceil(SCREEN_SIZE[0] / game_objects.background.size[0]);

game_objects.ground.canvas_fill = Math.ceil(SCREEN_SIZE[0] / game_objects.background.size[0]) + 1;
game_objects.ground.collision = SCREEN_SIZE[1] - game_objects.ground.size[1];

game_objects.pipe.start_position = SCREEN_SIZE[0] + game_objects.pipe.pipeGap[0] + game_objects.pipe.draw_size[0];
game_objects.pipe.max_num_of_pipes = Math.ceil(SCREEN_SIZE[0] / (game_objects.pipe.pipe_size[0] + game_objects.pipe.pipeGap[0])) + 1;

game_objects.ufo.startPOS = SCREEN_SIZE[0] + (game_objects.ufo.draw_size[0] * game_objects.ufo.sprite_scale);
game_objects.ufo.speed = game_objects.game.speed * 2.5;

const logoScaling = 0.90;

const cTenth = ((SCREEN_SIZE[0] / 2) - game_objects.player.draw_size[0] / 2);
const playerAdjustment = (SCREEN_SIZE[0] / 2) < (game_objects.pipe.pipeGap[0] * 1.75);

//if portrait mode then adjust player to the left side of the screen
if (playerAdjustment) {	game_objects.player.x_adjustment = SCREEN_SIZE[0] / 5;
} else { game_objects.player.x_adjustment = cTenth; }

const soundFX = new Audio('assets/bloop.ogg')

//  mobile or desktop device
function isTouchDevice(){ return (window.ontouchstart !== undefined); }
const __touch_device__ = isTouchDevice();

// All variables are initialized

/////////////////////////////////////////////////////

let game_tick = 0;
let pipes = [];
let game = game_objects;

function InvertPosition(y, canvas_size) {
	var x,z;
	x = canvas_size / 2;
	z = (x - y);
	z += x;
	return z;
}

//formulas for randomizing pipe and ufo position
const ufoElevation = () => (InvertPosition(Math.abs(game.player.flyHeight), game.ground.collision - game.ufo.draw_size[1])); 

function pipeLoc() { return (Math.random() * (game.ground.collision / 2)) + game.pipe.draw_size[1]; }

function set_scaling() {

	//setting draw size scaling for game objects
	game_objects.ufo.draw_size = [game_objects.ufo.size[0] * Y_Scaling, game_objects.ufo.size[1] * Y_Scaling];
	
	game_objects.player.draw_size = [game_objects.player.size[0] * Y_Scaling, game_objects.player.size[1] * Y_Scaling];
	game_objects.player.jump *= Y_Scaling;
	
	game_objects.pipe.pipeGap[0] *= Y_Scaling;
	game_objects.pipe.pipeGap[1] *= Y_Scaling;
	
	game_objects.pipe.draw_size[0] *= Y_Scaling;
	game_objects.pipe.draw_size[1] *= Y_Scaling;
	
	game_objects.game.gravity *= Y_Scaling;
	game_objects.game.speed *= Y_Scaling;
}

function start() {
	
	run_game();
}

//game functions
function game_reset() {
	
	game.game.currentScore = 0;
	
	game.ufo.LastSpawn = 0;
	game.ufo.currentPOS[0] = -(game.ufo.draw_size[0] * game.ufo.sprite_scale);
	game.ufo.currentPOS[1] = ufoElevation();
		
	game.game.increased_speed = game.game.speed;
	game.player.flight = game.player.jump;
	
	// set initial flyHeight (middle of screen - size of the bird)
	game.player.flyHeight = (game.ground.collision / 2) - (game.player.draw_size[1] / 2);
	
	pipes = IntializePipes();
	
	game.game.gamePlaying = true;

}

function run_game() {
	
	// heartbeat
	game_tick++;

	draw_background();

	// pipe display
	if (game.game.gamePlaying) {
		draw_pipes();
		draw_UFO();
	} else {
		start_screen();
	}

	draw_player();
	draw_ground();

	game_over();

	update_score();
	
	window.requestAnimationFrame(run_game);
}

function game_over() {
	//player hit the ground
	if ((game.player.flyHeight + game.player.draw_size[1]) >= game.ground.collision) { game.game.gamePlaying = false; }
	
	//player hit UFO
	if (ufo_collision()) { game.game.gamePlaying = false; }
}

function draw_background() {
	 // tile background	 
	let draw_size = [game.background.size[0] * Y_Scaling, game.background.size[1]  * Y_Scaling];
	
	for (let i = 0; i <= game.background.canvas_fill; i++) {
		ctx.drawImage(sprites, 0, 0, game.background.size[0], game.background.size[1], 
			-((game_tick * game.background.speed) % draw_size[0]) + (draw_size[0] * i), 0, draw_size[0], draw_size[1]);
	}
}

function draw_ground() {
    // tile ground
	
	let draw_size = [game.ground.size[0] * Y_Scaling, game.ground.size[1]  * Y_Scaling];
	
	for (let i = 0; i <= game.ground.canvas_fill; i++) {
		ctx.drawImage(sprites, 0, game.background.size[1], game.ground.size[0], game.ground.size[1], 
			-((game_tick * game.game.increased_speed) % draw_size[0]) + (draw_size[0] * i), game.ground.collision, draw_size[0] + 1, draw_size[1]);
	}
}


//ufo functions
function random_UFO_size() { 
	
	let x = game.ufo.scale_min + Math.random();
	while (x > game.ufo.scale_max) {
		y = x - game.ufo.scale_max;
		x = game.ufo.scale_min + y;
	}
	console.log(x);
	return x;	
}


function draw_UFO() {
	
	if ((game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale)) >= 0) {
		game.ufo.currentPOS[0] -= game.ufo.speed;
	} else if (((game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale)) < 0) //check to make sure ufo on not screen
			&& (game.game.currentScore > 0) //dont spawn unless currentScore > 0
				&& (game.game.currentScore % game.ufo.interval == 0) //score trigger spawn interval
					&& (game.ufo.LastSpawn != game.game.currentScore)) //make sure not spawn more than once per interval
		{ 
		console.log("new ufo");
		//reset UFO when it's off screen and every 5 points
		game.ufo.currentPOS[0] = game.ufo.startPOS;
		game.ufo.currentPOS[1] = ufoElevation();
		game.ufo.sprite_scale = random_UFO_size();
		game.ufo.LastSpawn = game.game.currentScore; //interval tracking	
	}
	
	ctx.drawImage(ufo_sprite, 1, 0, game.ufo.size[0], game.ufo.size[1], 
		game.ufo.currentPOS[0], game.ufo.currentPOS[1], game.ufo.draw_size[0] * game.ufo.sprite_scale, game.ufo.draw_size[1] * game.ufo.sprite_scale);
}

function ufo_collision() {
	if  (
		(game.ufo.currentPOS[0] <= game.player.x_adjustment + game.player.draw_size[0]) && 
		(game.ufo.currentPOS[0] + (game.ufo.draw_size[0] * game.ufo.sprite_scale) >= game.player.x_adjustment) &&
		(game.player.flyHeight + game.player.draw_size[1] >= game.ufo.currentPOS[1]) && 
		(game.player.flyHeight <= game.ufo.currentPOS[1] + (game.ufo.draw_size[1] * game.ufo.sprite_scale))	
	) {
		return 1;
		console.log("HIT!~!!!");
	} else {
		return 0;
	}
}	


//pipe functions
function IntializePipes() {

	let pipes_array = [];
	const max_pipes = game.pipe.max_num_of_pipes;
	
	for (let i = 0; i < max_pipes; i++) {
	
		const temp = {...game.pipe_array_data};
		
		temp.x = game.pipe.start_position + (i * (game.pipe.pipeGap[0] + game.pipe.draw_size[0]));
		temp.y = pipeLoc();
		temp.scored = false;	
		temp.moveable = false;	// move up and side, not side to side.
		temp.inverse_y = InvertPosition(temp.y, game.ground.collision - game.pipe.draw_size[1]); //metric for moveable pipe
		
		pipes_array.push(temp);
	}
	
	console.log(pipes_array)
	
	return pipes_array;
}

function spawn_pipes() {

	// create new pipe when pipe[0].x goes offscreen
	
	pipe_array = {...pipes};
	
	if (pipe_array[0].x <= -game.pipe.draw_size[0]) {
		
		console.log("SPAWN!");
		
		//let i = pipe_array[pipe_array.length - 1].x;
						
		const temp = {...game.pipe_array_data};
		temp.x = pipe_array[(pipe_array.length - 1)].x + (game.pipe.pipeGap[0] + game.pipe.pipe_size[0]);
		temp.y = pipeLoc();
		temp.inverse_y = InvertPosition(temp.y, game.ground.collision - game.pipe.pipe_size[1]);
		temp.scored = false;
		temp.moveable = false;	
		
		// shift data
		for (let i = 0; i < pipe_array.length - 1; i++) {
			pipe_array[i] = pipe_array[(i + 1)];	
		}
		
		pipe_array[pipe_array.length - 1] = {...temp};
		
		console.log(pipe_array);
		
	}
	
	return {...pipe_array};
}


function draw_pipes() {

	// pipe moving	
	
	for(let i = 0; i < pipes.length; i++) {
		
		var x,y;
													
		pipes[i].x -= game.game.increased_speed;				
		//top pipe_stem
		y = 0;
		x = pipes[i].y - game.pipe.draw_size[1];
		draw_pipe_stems(y, x, pipes[i]);
				
		//bottom pipe_stem
		y = pipes[i].y + game.pipe.pipeGap[1] + game.pipe.draw_size[1];
		x = game.ground.collision - y;
		draw_pipe_stems(y, x, pipes[i]);

		//top_pipe
		ctx.drawImage(sprites, game.pipe.top_pipe[0], game.pipe.top_pipe[1], game.pipe.pipe_size[0], game.pipe.pipe_size[1], 
			pipes[i].x, pipes[i].y - game.pipe.draw_size[1] - 1, game.pipe.draw_size[0], game.pipe.draw_size[1]);
			
		//bottom_pipe
		ctx.drawImage(sprites, game.pipe.btm_pipe[0], game.pipe.btm_pipe[1], game.pipe.pipe_size[0], game.pipe.pipe_size[1], 
			pipes[i].x, pipes[i].y + game.pipe.pipeGap[1] + 1, game.pipe.draw_size[0], game.pipe.draw_size[1]);
			
		pipe_logic(pipes[i]); //collision and scoring detection	
		
	}
	
	pipes = spawn_pipes(pipes);


}

function draw_pipe_stems(y, stem_, pipe) {
	
	var x, z;
	stem_size = stem_;
	
	while (stem_size > 0) {
		if (stem_size > game.pipe.max_stem_size) { 
			x = game.pipe.max_stem_size;
		} else {
			x = stem_size;
		}
		ctx.drawImage(sprites, game.pipe.stem_pipe[0], game.pipe.stem_pipe[1], game.pipe.stem_size[0], x, 
			pipe.x, y, game.pipe.draw_size[0], stem_size); 

		y += x;
		stem_size -= game.pipe.max_stem_size;	
	}
}

function pipe_logic(pipe) {

		// if hit the pipe, end
	if ([
		pipe.x <= game.player.x_adjustment + game.player.draw_size[0], 
		pipe.x + game.pipe.draw_size[0] >= game.player.x_adjustment, 
		pipe.y > game.player.flyHeight || game.pipe.y + game.pipe.pipeGap[1] < game.player.flyHeight + game.player.draw_size[1]
	].every(elem => elem)) {
		console.log("hit pipe");
		//game.gamePlaying = false;
	} else if ((pipe.y + game.pipe.draw_size[0]) < game.player.x_adjustment && pipe.scored == false) { 
	//check to see if pipe moves past theshold for the first time.
		
		pipe.scored = true; // flag so we don't count the same pipe more than once
		game.game.currentScore++; // score!
		game.game.bestScore = Math.max(game.game.bestScore, game.game.currentScore); //high score
	}
}

//player functions
function draw_player() {
	var x;
	if (game.game.gamePlaying) {
		x = game.player.x_adjustment;
		game.player.flight += game.game.gravity;
		game.player.flyHeight = Math.min(game.player.flyHeight + game.player.flight, game.ground.collision - game.player.draw_size[1]);
	
	} else {
		x = cTenth;
		game.player.flyHeight = (SCREEN_SIZE[1] / 2) - (game.player.size[1] / 2);
	}
	
	ctx.drawImage(sprites, 433, Math.floor((game_tick % 9) / 3) * game.player.size[1], ...game.player.size, 
			x, game.player.flyHeight, ...game.player.draw_size);
}

function start_screen()
{
	//Click to play

	//drawing logo
	ctx.drawImage(logo, 0, 0, 600, 160,
		(SCREEN_SIZE[0] / 2) - ((600 / 2) * logoScaling), (135 * Y_Scaling), (600 * logoScaling), (160 * logoScaling));
	
	var txt = "";
	if (__touch_device__) { txt = "Tap to play";
	} else { txt = "Click to play";	}
	
	ctx.font = "bold 45px courier new";
	ctx.fillStyle = "#4c3b46";
	ctx.fillText(txt, SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), (550 * Y_Scaling));
	
	txt = "Version : " + _VERSION_;
	ctx.font = "bold 24px courier new";
	ctx.fillText(txt, 10, 25)
}


function update_score() {
	document.getElementById('bestScore').innerHTML = `Best : ${game.game.bestScore}`;
	document.getElementById('currentScore').innerHTML = `Current : ${game.game.currentScore}`;
	document.getElementById('attempts').innerHTML = `Attempts : ${game.game.attempts}`;
	
}

function user_input() {
	if (game.player.flyHeight > -game.player.size[1]) { //makes sure player doesnt fly off the screen
		game.player.flight = game.player.jump;
		soundFX.play();
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
		console.log("touch");
	}
} else {
	document.body.onmousedown = () => { 
		user_input();
		console.log("click");
	}
	
	document.body.onkeydown = function(e) {
		if (e.key == " ") {
			user_input();
			console.log("spacebar");
		}
	}
}

window.addEventListener('wheel', e => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });



	 

	
	
