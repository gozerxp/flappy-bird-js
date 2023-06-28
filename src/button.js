
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

    draw_button(display, game) {
		display.ctx.fillStyle = game.GAME_MODE_COLOR();
		display.ctx.fillRect(this._loc.x_pos, this._loc.y_pos, this._size.width, this._size.height);
    }

    check_mouse_hover(mouse_x, mouse_y) {
        let check_X = mouse_x >= this._loc.x_pos && mouse_x <= this._loc.x_pos + this._size.width;
        let check_Y = mouse_y >= this._loc.y_pos && mouse_y <= this._loc.y_pos + this._size.height;
        this._mouse_hover =  check_X && check_Y;
        return this._mouse_hover;
    }

}