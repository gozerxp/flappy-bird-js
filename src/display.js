const background_height = 768;
const minimum_display_height = 100;

export default class Display {

    constructor() {

        this._canvas = document.getElementById('canvas');
        this._ctx = canvas.getContext('2d');
        
        this._draw_scaling = 1;
        this.resize_canvas(this._ctx);
        
    }

    resize_canvas() {

        this._DISPLAY_SIZE = [window.innerWidth, background_height];

        if (window.innerHeight !== this._DISPLAY_SIZE[1]) {

            this._DISPLAY_SIZE[1] = Math.max(window.innerHeight, minimum_display_height);
            this._draw_scaling = this._DISPLAY_SIZE[1] / background_height;
        }

        this._portrait_mode = this._DISPLAY_SIZE[0] < this._DISPLAY_SIZE[1];

        console.log(`res: ${this._DISPLAY_SIZE[0]}x${this._DISPLAY_SIZE[1]}`);

        this._ctx.canvas.width = this._DISPLAY_SIZE[0];
        this._ctx.canvas.height = this._DISPLAY_SIZE[1];
    }

    get draw_scaling() {

        return this._draw_scaling;

    }

    get width() {

        return this._DISPLAY_SIZE[0];

    }

    get height() {

        return this._DISPLAY_SIZE[1];

    }

    get canvas() {

        return this._canvas;

    }

    get ctx() {

        return this._ctx;

    }

    get portrait_mode() {

        return this._portrait_mode;
        
    }

}
