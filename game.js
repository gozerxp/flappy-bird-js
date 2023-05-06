
const background_width = 768

// delta time
export default class Game {

    constructor(ctx) {

        this._draw_scaling = 1;
        this._setup_canvas(ctx);

        this._gravity = 0.5 * this._draw_scaling;
        this._speed = 5.5 * this._draw_scaling;
        this._increased_speed = this._speed;

        this._game_over = true;

        this.ground_collision = this.SCREEN_SIZE[1] - 150 * (this._draw_scaling / 1.5);

        this.scoreboard = {
            currentScore : 0,
            bestScore : 0,
            attempts : 0
        }

        this._logo_sprite = new Image();
        this._logo_sprite.src = "assets/fb-logo.png";
    }

    _setup_canvas(ctx) {

        this.SCREEN_SIZE = [window.innerWidth, background_width];

        if (window.innerHeight > this.SCREEN_SIZE[1]) {
            this.SCREEN_SIZE[1] = window.innerHeight;
            this._draw_scaling = this.SCREEN_SIZE[1] / background_width;
        }
        
        console.log(`res: ${this.SCREEN_SIZE[0]}x${this.SCREEN_SIZE[1]}`);

        ctx.canvas.width = this.SCREEN_SIZE[0];
        ctx.canvas.height = this.SCREEN_SIZE[1];
    }

    draw_scoreboard(ctx) {

        let Y_position = 125 * this._draw_scaling;
		let txt = this.scoreboard.currentScore;
		ctx.font = `${80 * this._draw_scaling}px 'Press Start 2P'`;
		ctx.strokeStyle = "#553847";
		ctx.lineWidth = 6 * this._draw_scaling;
		ctx.strokeText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);
		ctx.fillStyle = "#fefefe";
		ctx.fillText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);

    }

    get draw_scaling() {
        return this._draw_scaling;
    }

    get gravity() {
        return this._gravity;
    }

    get speed() {
        return this._speed;
    }

    get increased_speed() {
        return this._increased_speed;
    }

    set increase_speed(speed) {
        this._increased_speed = speed;
    }

    get game_over() {
        return this._game_over;
    }

    set game_over(game_over) {
        this._game_over = game_over;
    }

    draw_start_screen(ctx, __touch_device__, _VERSION_) {

        let logoScaling = 1;
        if(600 >= this.SCREEN_SIZE[0]) { logoScaling = 0.75; }
        // drawing logo
        ctx.drawImage(this._logo_sprite, 0, 0, 600, 160,
            (this.SCREEN_SIZE[0] / 2) - ((600 / 2) * logoScaling), (100 * this.draw_scaling), (600 * logoScaling), (160 * logoScaling));
        
        let txt = "";
        if (__touch_device__) { 
            txt = "Tap to play";
        } else { 
            txt = "Click to play";
        }
        
        ctx.font = "bold 45px courier new";
        ctx.fillStyle = "#4c3b46";
        ctx.fillText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), (550 * this.draw_scaling));
        
        txt = `Version: ${_VERSION_}`;
        ctx.font = "bold 24px courier new";
        ctx.fillText(txt, 10, this.ground_collision - 12)
    }


    increase_score() {
        this.scoreboard.currentScore++;
        this.scoreboard.bestScore = Math.max(this.scoreboard.bestScore, this.scoreboard.currentScore)
    }

    reset_game() {
        this.scoreboard.currentScore = 0;
        this.scoreboard.attempts++;

        this._increased_speed = this._speed;

        this._game_over = false;
    }
}