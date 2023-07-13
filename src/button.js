
export default class Button {

    constructor() {
        this._mouse_hover = false;
    }

    resize_button(x, y, w, h) {
        this._loc = {
            x_pos : x,
            y_pos : y
        }

        this._size = {
            width: w,
            height: h            
        }
    }

    draw_game_mode_button(display, game, __touch_device__) {

        display.ctx.fillStyle = game.GAME_MODE_COLOR(this._mouse_hover || __touch_device__, game.next_game_mode);
        display.ctx.beginPath();
        display.ctx.roundRect(this._loc.x_pos, this._loc.y_pos, this._size.width, this._size.height, 50 * display.draw_scaling);
        display.ctx.fill();
        display.ctx.lineWidth = 3 * display.draw_scaling;
        display.ctx.strokeStyle = "#4c3b46";
        display.ctx.stroke();

        let txt = game.GAME_MODE_TEXT(game.next_game_mode);
      
        let font_size = 22 * display.draw_scaling;
        display.ctx.font = `${font_size}px 'Press Start 2P'`;
        display.ctx.fillStyle = "#4c3b46";
        display.ctx.fillText(txt, this._loc.x_pos + this._size.width + (10 * display.draw_scaling), 
            this._loc.y_pos + (this._size.height / 2) + (font_size / 2));
    }

    draw_info_button(display, __touch_device__) {

        if (this._mouse_hover && !__touch_device__) {
            display.ctx.fillStyle = "#83e070";
        } else {
            display.ctx.fillStyle = "#fefefe";
        }
        
        display.ctx.beginPath();
        display.ctx.roundRect(this._loc.x_pos, this._loc.y_pos, this._size.width, this._size.height, 50 * display.draw_scaling);
        display.ctx.fill();
        display.ctx.lineWidth = 3 * display.draw_scaling;
        display.ctx.strokeStyle = "#4c3b46";
        display.ctx.stroke();

        let txt = "i";
        let font_size = 36 * display.draw_scaling;
        display.ctx.font = `bold ${font_size}px courier new`;
        display.ctx.fillStyle = "#4c3b46";
        display.ctx.fillText(txt, this._loc.x_pos + (this._size.width / 2) - (display.ctx.measureText(txt).width / 2.15), 
            this._loc.y_pos + (this._size.height / 2) + (font_size / 3.5));


    }

    check_mouse_hover(mouse_x, mouse_y) {
        let check_X = mouse_x >= this._loc.x_pos && mouse_x <= this._loc.x_pos + this._size.width;
        let check_Y = mouse_y >= this._loc.y_pos && mouse_y <= this._loc.y_pos + this._size.height;
        this._mouse_hover =  check_X && check_Y;
        return this._mouse_hover;
    }

}