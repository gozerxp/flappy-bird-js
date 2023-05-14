// Flappy Bird Clone JS
// Version 1.0.1 build 5/4/2023
// Written by Dan Andersen

const _VERSION_ = "1.0.1";

import _Delta_Time from './delta.js';
import _Game from './game.js';
import _Player from './player.js';
import _Scene from './scene.js';
import _Pipes from './pipes.js';

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const __touch_device__ = window.ontouchstart !== undefined;

const delta = new _Delta_Time();
const game = new _Game(ctx);
const player = new _Player(game);
const background = new _Scene(game, "background");
const ground = new _Scene(game, "ground");
const pipes = new _Pipes(game);

window.requestAnimationFrame(run_game);

function run_game(currentTime) {

    let delta_time = currentTime - delta.previousTime;
	delta.delta_time_multiplier = Math.max(delta_time / delta.frame_interval, 1); // caps at FPS (60)

    if (delta_time >= Math.floor(delta.frame_interval)) { 

        delta.previousTime = currentTime;

		background.draw_scene(ctx, game, delta, 3, 0);
		
		ground.draw_scene(ctx, game, delta, 1, game.ground_collision);
        
		switch (game.game_state) {                           
			case 0: // start screen
				game.draw_start_screen(ctx, __touch_device__, _VERSION_);
				break;
			case 1: //live game
				pipes.draw_pipes(ctx, player, game, delta);
				game.game_logic(player, pipes);
				break;
			case 2: //game over screen/animation
				game.draw_game_over();
				break;
			default:
		}

		game.draw_scoreboard(ctx);
		player.draw_player(ctx, game, delta);

    }

    window.requestAnimationFrame(run_game);
}

const user_input = () => {

	player.jump(delta.delta_time_multiplier);

	if (game.game_state === 0) {

		game.reset_game();
		pipes.reset(game);
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
