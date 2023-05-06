export default class Player {
    
    constructor(game) {
        this._sprite = {
            // sprite dimensions
            size : [51, 36],          
            draw_size : [0, 0], // draw scaling
            
            sprite_index : 0, // 0 - 2
            max_sprites : 3, // bird has 3 frames
            sprite_interval : 3, // how often to change the index
            last_sprite_update : 0, // when was the last frame update

        };

        this._sprite.draw_size[0] = this._sprite.size[0] * game.draw_scaling;
        this._sprite.draw_size[1] = this._sprite.size[1] * game.draw_scaling;   

        this._flyHeight = 0;
        this._x_adjustment = 0;
        this._jump = -11.5 * game.draw_scaling;
        this._flight = 0;
        this._center_position = ((game.SCREEN_SIZE[0] / 2) - (this._sprite.draw_size[0] / 2));

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/flappy-bird-set.png";

        this._jump_fx = new Audio('assets/bloop.ogg');
        this._jump_fx.load();

        this._player_adjustment(game.SCREEN_SIZE[0]);
        this.reset_position(game.SCREEN_SIZE[1]);

    }

    _player_adjustment(SCREEN_SIZE) {

        let playerAdjustment = (SCREEN_SIZE / 2) < (270 * 1.75);

        if (playerAdjustment) {	
            this._x_adjustment = SCREEN_SIZE / 7;
        } else {    
            this._x_adjustment = this._center_position; 
        }
    }
    
    reset_position(SCREEN_SIZE) {
        this._flight = this._jump;
        this._flyHeight = (SCREEN_SIZE / 2) - (this._sprite.draw_size[1] / 2);
    }

    draw_player(ctx, game, delta) {

        let x_position = this._x_adjustment;

        if (!game.game_over) {

            this._flight += game.gravity * delta.delta_time_multiplier;
            this._flyHeight = Math.min(this._flyHeight + this._flight, game.ground_collision - this._sprite.draw_size[1]);
        
        } else {

            x_position = this._center_position;
            this._flyHeight = (game.SCREEN_SIZE[1] / 2) - (this._sprite.draw_size[1] / 2);

        }
        
        this._sprite_update(delta);
        
        ctx.drawImage(this._sprite_sheet, 433, this._sprite.sprite_index * this._sprite.size[1], this._sprite.size[0], this._sprite.size[1]-1,
            x_position, this._flyHeight, ...this._sprite.draw_size);

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

    FLY(delta_time_multiplier) {

        if (this._flyHeight > -this._sprite.draw_size[1]) { // makes sure player doesnt fly off the screen
            this._flight = this._jump * delta_time_multiplier;
            this._jump_fx.play();

        }

    }

}