export default class Scoreboard {

    constructor(game_mode) {

        this._current_score = 0;
        this._attempts = 0;

        this.load_high_score(game_mode);
    }

    save_high_score(game_mode) {
        localStorage.setItem(`high_score_${game_mode}`, this._high_score);
    }

    load_high_score(game_mode) {

        this._high_score = localStorage.getItem(`high_score_${game_mode}`);
        //if scoreboard is null then localStorage variable has not been saved.
        //this variable will be saved on the first gameover screen.
        if (!this._high_score) {
            this._high_score = 0;   
        }

    }

    reset_score() {
        this._current_score = 0;
        this._attempts++;
    }

    increase_score() {
        this._current_score++;
        this._high_score = Math.max(this._high_score, this._current_score)
    }

    get get_current_score() {
        return this._current_score;
    }

    draw_scoreboard(display, game) {

        let txt_size = 60;
        let Y_position = (txt_size * display.draw_scaling) * 2;
        let txt = this._current_score;

        if (game.game_state > 0) { //only draw current score during gameplay.
            display.ctx.font = `${txt_size * display.draw_scaling}px 'Press Start 2P'`;
            display.ctx.strokeStyle = "#553847";
            display.ctx.lineWidth = 6 * display.draw_scaling;
            display.ctx.strokeText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
            display.ctx.fillStyle = "#fefefe";
            display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
        }

        let padding = 25;
        txt_size = 15 * display.draw_scaling;
        Y_position = (padding * 1.25) * display.draw_scaling;

        display.ctx.font = `${txt_size}px 'Press Start 2P'`;
        display.ctx.fillStyle = game.GAME_MODE_COLOR();//"#553847";

        txt = `Best: ${this._high_score}`;
        display.ctx.fillText(txt, padding, Y_position);

        display.ctx.fillStyle = "#553847";
        txt = `Attempts: ${this._attempts}`;
        display.ctx.fillText(txt, display.width - display.ctx.measureText(txt).width - padding, Y_position);
        
    }

}

