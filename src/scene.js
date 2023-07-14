export default class Scene {
    
    constructor(display, scene_type) {

        this._set_size(scene_type);

        this._draw_size = [0, 0]; // for scaling
        this._set_scaling(display.draw_scaling);

		this._speed = 0;
		this._last_draw_position = 0;

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/sprites/flappy-bird-set.png";

    }

    _set_size(scene_type) {

        switch(scene_type) {

            case "background":

                this._size = [430, 768]; //background
                this._sprite_Y_location = 0;

                break;

            case "ground":

                this._size = [550, 150]; //ground
                this._sprite_Y_location = 768;
                
                break;
            
                default:
        }
    }

    _set_scaling(display) {

        this._draw_size[0] = Math.floor(this._size[0] * display.draw_scaling);
        this._draw_size[1] = Math.floor(this._size[1] * display.draw_scaling);
    
    }

    set set_scaling(display) {
        
        this._set_scaling(display);
    
    }

    draw_scene(display, delta, game, speed_divider, Y_position, scroll) {

        let tile_position = this._last_draw_position;

        while (tile_position < display.width) {

            display.ctx.drawImage(this._sprite_sheet, 0, this._sprite_Y_location, ...this._size, 
                tile_position, Y_position, ...this._draw_size);
            
            tile_position += this._draw_size[0];

        }
        
        if (scroll) {

            this._speed = Math.floor(((game.increased_speed * display.draw_scaling) * delta.delta_time_multiplier) / speed_divider);

            if (this._last_draw_position <= -this._draw_size[0]) {

                this._last_draw_position += (this._draw_size[0] - this._speed); // reset

            } else {

                this._last_draw_position -= this._speed;
                
            }
        }   

    }

}
