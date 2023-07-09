export default class Player {
    
    constructor(display) {

        this._sprite = {
            // sprite dimensions
            size : [51, 35],          
            draw_size : [0, 0], // draw scaling
            
            sprite_index : 0, // 0 - 2
            max_sprites : 3, // bird has 3 frames
            sprite_interval : 3, // how often to change the index
            last_sprite_update : 0, // when was the last frame update

        }; 

        this._flyHeight = 0;
        this._angle = 45;
        this._x_adjustment = 0;
        this._jump = -11.5;// * game.draw_scaling;
        this._flight = 0;

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/flappy-bird-set.png";

        this._jump_fx = new Audio('assets/bloop.ogg');
        this._jump_fx.load();

        this._set_scaling(display);
        this.reset_position(display);

    }

    _set_scaling(display) {
        this._sprite.draw_size[0] = Math.floor(this._sprite.size[0] * display.draw_scaling);
        this._sprite.draw_size[1] = Math.floor(this._sprite.size[1] * display.draw_scaling); 
        this._center_position = Math.floor((display.width / 2) - (this._sprite.draw_size[0] / 2));
        this._player_adjustment(display);
    }

    set set_scaling(display) {
        this._set_scaling(display);
    }

    _player_adjustment(display) {
        if (display.portrait_mode) {	
            this._x_adjustment = display.width / 5;
        } else {    
            this._x_adjustment = this._center_position; 
        }
    }
    
    _set_flight_angle(previous_height, new_height, game, delta) {

        if (game.game_state === 0) { 
            this._sprite_update(delta);
            return 0;
        }

        let increment = 12.5 * delta.delta_time_multiplier;
        let max_angle = 50;
        
        if (new_height > previous_height) { //player is falling
            
            this._sprite.sprite_index = 0;
            return Math.min(this._angle + increment, max_angle); 

        } else if (new_height < previous_height) { //player is flying

            this._sprite_update(delta);
            return Math.max(this._angle - increment, -max_angle);

        } else {

            this._sprite_update(delta);
            return 0;
        }

    }

    reset_position(display) {
        this._angle = 0;
        this._flight = this._jump * display.draw_scaling;
        this._flyHeight = (display.height / 2) - (this._sprite.draw_size[1] / 2);
    }

    draw_player(display, game, delta) {

        let x_position = this._x_adjustment;
        let previous_flyHeight = this._flyHeight;

        switch (game.game_state) { //check gamer state before drawing to determine player position
            
            case 0: //start screen, player flies in the middle
                x_position = this._center_position;
                this._flyHeight = (display.height / 2) - (this._sprite.draw_size[1] / 2);
                this._angle = this._set_flight_angle(previous_flyHeight, this._flyHeight, game, delta);
                break;
            
            case 1: // live game flight calculation
                this._flight += (game.gravity * display.draw_scaling) * delta.delta_time_multiplier;
                this._flyHeight = Math.min(this._flyHeight + this._flight, game.ground_collision - this._sprite.draw_size[1]);
                this._angle = this._set_flight_angle(previous_flyHeight, this._flyHeight, game, delta);
                break;
            
            case 2: // game over fall
                if (this._flyHeight < game.ground_collision - this._sprite.draw_size[1]) {
                    this._flight += (game.gravity * display.draw_scaling) * delta.delta_time_multiplier;
                    this._flyHeight = this._flyHeight + this._flight;
                    this._angle -= 10 * delta.delta_time_multiplier;
                } else {
                    game.game_playable = true;
                }

                break;
            default:
        }

        display.ctx.save();

        let translate_pos = [x_position + (this._sprite.draw_size[0] / 2), this._flyHeight + (this._sprite.draw_size[1] / 2)]

        display.ctx.translate(...translate_pos);
        display.ctx.rotate(this._angle * Math.PI / 360);
        display.ctx.translate(-translate_pos[0], -translate_pos[1]);
      
        display.ctx.drawImage(this._sprite_sheet, 432, this._sprite.sprite_index * (this._sprite.size[1] + 1), this._sprite.size[0], this._sprite.size[1] + 1,
            x_position, this._flyHeight, ...this._sprite.draw_size);

        display.ctx.restore();

    }

    _sprite_update(delta) {

        let delta_time = (delta.previousTime - this._sprite.last_sprite_update) / delta.frame_interval;
	
        if (delta_time >= this._sprite.sprite_interval) {
        
            (this._sprite.sprite_index === this._sprite.max_sprites - 1) ?
                this._sprite.sprite_index = 0 : this._sprite.sprite_index++;
            
            this._sprite.last_sprite_update = delta.previousTime;
          
        }
    }

    get getflyHeight() {
        return this._flyHeight;
    }

    get getSize() {
        return this._sprite.draw_size;
    }

    get getPosition() {
        return this._x_adjustment;
    }

    jump(display, delta) {

        if (this._flyHeight > -this._sprite.draw_size[1]) { // makes sure player doesnt fly off the screen

            this._flight = (this._jump * display.draw_scaling) * delta.delta_time_multiplier;
            this._jump_fx.play();

        }

    }

}