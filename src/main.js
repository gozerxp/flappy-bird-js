// Flappy Bird Clone JS
// Written by Dan Andersen

const _VERSION_ = "1.0.6";

import _Delta_Time from './delta.js';
import _Display from './display.js';
import _Game from './game.js';
import _Player from './player.js';
import _Scene from './scene.js';
import _Pipes from './pipes.js';
import _Scoreboard from './scoreboard.js';
import _Button from './button.js';

const __touch_device__ = window.ontouchstart !== undefined;

const delta = new _Delta_Time();
const display = new _Display();

const game = new _Game(display);

const background = new _Scene(display, "background");
const ground = new _Scene(display, "ground");

const player = new _Player(display);
const pipes = new _Pipes(display);
const score = new _Scoreboard(game.game_mode);
const game_mode_button = new _Button();

scale_assets();

window.requestAnimationFrame(run_game);

function run_game(currentTime) {

    let delta_time = currentTime - delta.previousTime;
	delta.delta_time_multiplier = Math.max(delta_time / delta.frame_interval, 1); // caps at FPS (60)

    if (delta_time >= Math.floor(delta.frame_interval)) { 

        delta.previousTime = currentTime;

      	switch (game.game_state) {                           

		 	case 0: 
			
			// start screen
				background.draw_scene(display, delta, game, 4, 0, true);
				game.draw_start_screen(display, __touch_device__, _VERSION_);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
				player.draw_player(display, game, delta);
				game_mode_button.draw_button(display, game);
				
		 		break;

			case 1: 
			
			//live game
				background.draw_scene(display, delta, game, 4, 0, true);
				pipes.draw_pipes(display, player, game, delta);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
				player.draw_player(display, game, delta);
				game.game_logic(player, pipes, delta, score);
				
				break;

			case 2: 
			
			//game over screen/animation
				background.draw_scene(display, delta, game, 4, 0, false);
				pipes.draw_pipes(display, player, game, delta);
				ground.draw_scene(display, delta, game, 1, game.ground_collision, false);
				game.draw_game_over(display, delta, __touch_device__, _VERSION_);
				player.draw_player(display, game, delta);
				game_mode_button.draw_button(display, game);
				
				break;

			default:
		}

		score.draw_scoreboard(display, game);

    }

    window.requestAnimationFrame(run_game);
}

function scale_assets() {
	display.resize_canvas();
	game.set_scaling = display;
	background.set_scaling = display;
	ground.set_scaling = display;
	player.set_scaling = display;
	pipes.set_scaling = display;
	game_mode_button.resize_button(25, game.ground_collision - 125, 75, 75);
}

const user_input = (cursor_X, cursor_Y) => {

	if (game.game_state !== 1 && game_mode_button.check_mouse_hover(cursor_X, cursor_Y)) {
		game.game_mode++;
		score.load_high_score(game.game_mode);
		return;
	}

	if (game.game_playable) {
	
		player.jump(display.draw_scaling);

		if (game.game_state !== 1) {
		
			game.reset_game();
			score.reset_score();
			pipes.reset(display, game);
			player.reset_position(display);
			
		}
	}


}

//user inputs
if (__touch_device__) {
	document.body.ontouchstart = (e) => {
		user_input(e.pageX, e.pageY);
	}
} else {
	
	document.body.onmousedown = (e) => {
		user_input(e.clientX, e.clientY);
	}
		
	document.body.onkeydown = (e) => {
		if (e.key === " ") {
			user_input(null, null);
		}
	}

	document.body.onmousemove = (e) => {
		game_mode_button.check_mouse_hover(e.clientX, e.clientY);

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
