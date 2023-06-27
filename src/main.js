// Flappy Bird Clone JS
// Version 1.0.4 build 5/4/2023
// Written by Dan Andersen

const _VERSION_ = "1.0.4";

import _Delta_Time from './delta.js';
import _Display from './display.js';
import _Game from './game.js';
import _Player from './player.js';
import _Scene from './scene.js';
import _Pipes from './pipes.js';

const __touch_device__ = window.ontouchstart !== undefined;

const delta = new _Delta_Time();
const display = new _Display();

const game = new _Game(display);

const background = new _Scene(display, "background");
const ground = new _Scene(display, "ground");

const player = new _Player(display);
const pipes = new _Pipes(display);

scale_assets();

window.requestAnimationFrame(run_game);

function run_game(currentTime) {

    let delta_time = currentTime - delta.previousTime;
	delta.delta_time_multiplier = Math.max(delta_time / delta.frame_interval, 1); // caps at FPS (60)

    if (delta_time >= Math.floor(delta.frame_interval)) { 

        delta.previousTime = currentTime;

      	switch (game.game_state) {                           

		 	case 0: // start screen
				background.draw_scene(display, delta, game, 4, 0, true);
				game.draw_start_screen(display, __touch_device__, _VERSION_);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
				player.draw_player(display, game, delta);
				
		 		break;
			case 1: //live game
				background.draw_scene(display, delta, game, 4, 0, true);
				pipes.draw_pipes(display, player, game, delta);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
				player.draw_player(display, game, delta);
				game.game_logic(player, pipes, delta);
				
				break;
			case 2: //game over screen/animation
				background.draw_scene(display, delta, game, 4, 0, false);
				pipes.draw_pipes(display, player, game, delta);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, false);
				game.draw_game_over(display, delta, __touch_device__, _VERSION_);
				player.draw_player(display, game, delta);
				
				break;
			default:
		}

		game.draw_scoreboard(display);

    }

    window.requestAnimationFrame(run_game);
}

function scale_assets() {
	display.resize_canvas();
	game.set_scaling(display);
	background.set_scaling = display.draw_scaling;
	ground.set_scaling = display.draw_scaling;
	player.set_scaling = display;
	pipes.set_scaling = display;
}

const user_input = () => {

	if (game.game_playable) {
		
		player.jump(display.draw_scaling);

		if (game.game_state !== 1) {
		
			game.reset_game();
			pipes.reset(display, game);
			player.reset_position(display);
			
		}
	}


}

//user inputs
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

// disables browser zooming
window.addEventListener('wheel', e => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

window.onresize = function(e) {
	scale_assets();
}
