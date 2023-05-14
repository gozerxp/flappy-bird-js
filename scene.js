export default class Scene {
    constructor(game, scene_type) {

        this._set_size(scene_type);

		this._draw_size = [0, 0]; // for scaling
        this._draw_size[0] = this._size[0] * game.draw_scaling;
        this._draw_size[1] = this._size[1] * game.draw_scaling;

		this._canvas_fill = Math.ceil(game.SCREEN_SIZE[0] / this._draw_size[0]);
		this._speed = 0;
		this._last_draw_position = 0;

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/flappy-bird-set.png";
    }

    _set_size(scene_type) {
        switch(scene_type) {
            case "background":
                this._size = [431, 768]; //background
                this._sprite_Y_location = 0;
                break;
            case "ground":
                this._size = [550, 150]; //ground
                this._sprite_Y_location = 768;
                break;
            default:

        }
    }

    draw_scene(ctx, game, delta, speed_divider, Y_position) {

        this._speed = game.increased_speed / speed_divider;

        // loop to tile specified image until canvas is full
        for (let i = 0; i <= this._canvas_fill; i++) {
            ctx.drawImage(this._sprite_sheet, 0, this._sprite_Y_location, ...this._size, 
                this._last_draw_position + (i * this._draw_size[0]), Y_position, 
                    ...this._draw_size);
        }
        
        if (this._last_draw_position <= -this._draw_size[0]) {
            this._last_draw_position += (this._draw_size[0] - this._speed - 1); // reset
        } else {
            this._last_draw_position -= this._speed * delta.delta_time_multiplier;
        }
    }

}
