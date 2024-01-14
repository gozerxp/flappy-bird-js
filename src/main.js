// Flappy Bird Clone JS
// Written by Dan Andersen
// 2023 Gozerxp Software
// http://www.gozerxp.com

const _VERSION_ = "1.1.0";

import _Delta_Time from './delta.js';
import _Display from './display.js';
import _Game from './game.js';
import _Player from './player.js';
import _UFO from './ufo.js';
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
const ufo = new _UFO(display);
const pipes = new _Pipes(display);
const score = new _Scoreboard(game.game_mode);
const game_mode_button = new _Button();
const info_button = new _Button();

scale_assets();

window.requestAnimationFrame(run_game);

function run_game(currentTime) {

    let delta_time = currentTime - delta.previousTime;
	delta.delta_time_multiplier = Math.max(delta_time / delta.frame_interval, 1); // caps at FPS (60)

    if (delta_time >= Math.floor(delta.frame_interval)) { 

        delta.previousTime = currentTime;

		render_game_state(game.game_state);
	
	}

    window.requestAnimationFrame(run_game);
}

function render_game_state(game_state) {

	switch (game_state) {                           

		case 0: // start screen
	   
		   background.draw_scene(display, delta, game, 3, 0, true);
		   ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
		   score.draw_splash_scoreboard(display, game);
		   game.draw_start_screen(display, __touch_device__, _VERSION_);
		   ufo.draw_ufo(display, delta, game);
		   player.draw_player(display, game, delta);
		   game_mode_button.draw_game_mode_button(display, game, __touch_device__);
		   info_button.draw_info_button(display, __touch_device__);
		   
			break;

	   case 1: //live game
	   
		   background.draw_scene(display, delta, game, 3, 0, true);
		   pipes.draw_pipes(display, player, game, delta);
		   ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
		   score.draw_live_scoreboard(display, game);
		   player.draw_player(display, game, delta);
		   ufo.draw_ufo(display, delta, game);
		   game.game_logic(player, pipes, ufo, delta, score);
		   
		   break;

	   case 2: //game over screen/animation
	   
		   background.draw_scene(display, delta, game, 3, 0, false);
		   pipes.draw_pipes(display, player, game, delta);
		   ground.draw_scene(display, delta, game, 1, game.ground_collision, false);
		   game.draw_game_over(display, delta, score, __touch_device__, _VERSION_);
		   player.draw_player(display, game, delta);
		   ufo.draw_ufo(display, delta, game);
		   game_mode_button.draw_game_mode_button(display, game, __touch_device__);
		   info_button.draw_info_button(display, __touch_device__);
		   
		   break;
	   
	   case 3: //info screen

		   background.draw_scene(display, delta, game, 3, 0, true);
		   ground.draw_scene(display, delta, game, 1, game.ground_collision, true);
		   score.draw_splash_scoreboard(display, game);
		   ufo.draw_ufo(display, delta, game);
		   game.draw_info_screen(display, _VERSION_);
		   game_mode_button.draw_game_mode_button(display, game, __touch_device__);

		   break;

	   default:
   }
}

function scale_assets() {

	display.resize_canvas();
	game.set_scaling = display;
	background.set_scaling = display;
	ground.set_scaling = display;
	player.set_scaling = display;
	pipes.set_scaling = display;
	ufo.resize = display;

	let padding = 20 * display.draw_scaling;
	let button_size = (display.height - game.ground_collision) / 2;
	let button_location = [padding, (8 * display.draw_scaling) + game.ground_collision + ((display.height - game.ground_collision) / 2 - (button_size) / 2)];
	game_mode_button.resize_button(...button_location, button_size, button_size);

	button_location[0] = display.width - button_size - padding;
	info_button.resize_button(...button_location, button_size, button_size);

}

const user_input = (cursor_X, cursor_Y) => {

	if (game.game_state !== 1) {

		if (game_mode_button.check_mouse_hover(cursor_X, cursor_Y)) {

			game.next_game_mode++;
			score.load_high_score(game.next_game_mode);
			return;

		}

		if (game.game_state !== 3 && info_button.check_mouse_hover(cursor_X, cursor_Y)) {

			game.game_state = 3;
			return;

		}
	}

	if (game.game_playable) {

		if (game.game_state === 3) { // if info screen is showing, switch to start screen.

			game.game_state = 0; 
			return;

		}
	
		player.jump(display);

		if (game.game_state !== 1) {

			game.reset_game();
			score.reset_score();
			pipes.reset(display, game);
			player.reset_position(display);
			ufo.reset(delta);

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
		info_button.check_mouse_hover(e.clientX, e.clientY);

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
