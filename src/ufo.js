
export default class UFO {

    constructor(display) {

        this._active = false;

        this._size = [248, 161];
        this._draw_size = [0, 0];

        this._draw_scaling = 0.75;

        this._fly_speed = 0;

        this._warning_sign_size = [50,50];
        this._current_position = [0, 0];

        this._spawn_interval = 5;
        this._last_spawn = 0;
        this._warning_interval = 1;
        this._warning_timer = 0;
        
        this.resize = display;

        this._ufo_sprite = new Image();
        this._ufo_sprite.src = "assets/airplane.png";
        
        this._ufo_warning_sprite = new Image();
        this._ufo_warning_sprite.src = "assets/warning_arrow.png";
    
        this._sound_fx = new Audio('assets/airplane.ogg');
        this._sound_fx.load();
       
    }

    set resize(display) {
        this._draw_size[0] = this._size[0] * display.draw_scaling;
        this._draw_size[1] = this._size[1] * display.draw_scaling;
        this._start_position = display.width + this._draw_size[0];
        if (!this._active) { this._current_position[0] = this._start_position; }
    }

    reset(delta) {
        this._active = false;
        this._current_position[0] = this._start_position; 
        this._last_spawn = delta.previousTime;
    }

    draw_ufo(display, delta, game) {
        
        if (!this._active) {
            this._spawn_ufo(display, game, delta); 
            return;
        }
            
        if ((this._current_position[0] + (this._draw_size[0] * this._draw_scaling)) < 0) {
            this._active = false;
        } else {	

            if (game.game_state === 1 && (delta.previousTime - this._warning_timer < (this._warning_interval * 1000))) {
                // show warning arrow when ufo is off screen
                display.ctx.drawImage(this._ufo_warning_sprite, 1, 0, ...this._warning_sign_size, 
                    display.width - ((this._warning_sign_size[0] * display.draw_scaling) * 1.25), this._current_position[1] + (this._warning_sign_size[1] / 2), 
                    this._warning_sign_size[0] * display.draw_scaling, this._warning_sign_size[1] * display.draw_scaling);
            }  else {
                this._current_position[0] -= this._fly_speed * delta.delta_time_multiplier;
                // draw ufo
                display.ctx.drawImage(this._ufo_sprite, 1, 0, ...this._size, 
                    ...this._current_position,
                    this._draw_size [0] * this._draw_scaling, this._draw_size [1] * this._draw_scaling);
            }
        }
        
    }

    _spawn_ufo(display, game, delta) {

        if (game.game_state === 2) { return; }

        if (delta.previousTime - this._last_spawn >= (this._spawn_interval * 1000)) {
       
            this._fly_speed = (game.increased_speed * display.draw_scaling) * 3.25;

            this._active = true;
        
            this._sound_fx.play();

            this._current_position[0] = this._start_position;
            this._current_position[1] = this._ufo_elevation(game);

            this._last_spawn = delta.previousTime; // interval tracking
            this._warning_timer = delta.previousTime;

        }

    }

    _ufo_elevation(game) {
        return Math.random() * (game.ground_collision - this._draw_size[1]);
    }


    check_collision(player) {
        
        if  (
        	(this._current_position[0] <= player.getPosition + player.getSize[0]) && 
        	(this._current_position [0] + (this._draw_size[0] * this._draw_scaling) >= player.getPosition) &&
        	(player.getflyHeight + player.getSize[1] >= this._current_position[1]) && 
        	(player.getflyHeight <= this._current_position [1] + (this._draw_size[1] * this._draw_scaling))	
        ) {
        	return 1;

        }
        
        return 0;
    }

    // function random_UFO_size() { 
        
    // 	let RandomSize = game.ufo.scale_min + Math.random();
    // 	while (RandomSize > game.ufo.scale_max) { // loop that ensures random size stays within min and max constrants
    // 		let Size_Constrant = RandomSize - game.ufo.scale_max;
    // 		RandomSize = game.ufo.scale_min + Size_Constrant;
    // 	}
    // 	return RandomSize;
    // }


}