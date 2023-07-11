export default class Scoreboard {

    constructor(game_mode) {

        this._current_score = 0;
        this._attempts = 0;

        this.load_high_score(game_mode);

        this._display_high_score = this._high_score;
        this._new_highscore = false;

        this._score_fx = new Audio('assets/audio/score.ogg');
        this._score_fx.load();
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
        this._display_high_score = this._high_score;
        this._new_highscore = false;
    }

    increase_score() {
        this._current_score++;
        this._high_score = Math.max(this._high_score, this._current_score)
        this._new_highscore = this._high_score > this._display_high_score;
        this._display_high_score = this._high_score;

        this._score_fx.pause();
        this._score_fx.play();
    }

    get get_current_score() {
        return this._current_score;
    }

    draw_splash_scoreboard(display, game) {

        let padding = 25;
        let txt_size = 18 * display.draw_scaling;
        let Y_position = (padding * 1.3) * display.draw_scaling;

        display.ctx.font = `${txt_size}px 'Press Start 2P'`;
        display.ctx.fillStyle = game.GAME_MODE_COLOR(true, game.next_game_mode);//"#553847";

        let txt = `Best: ${this._high_score}`;
        display.ctx.fillText(txt, padding, Y_position);

        display.ctx.fillStyle = "#553847";
        txt = `Attempts: ${this._attempts}`;
        display.ctx.fillText(txt, display.width - display.ctx.measureText(txt).width - padding, Y_position);
        
    }

    draw_live_scoreboard(display, game) {

        let txt_size = 60;
        let Y_position = (txt_size * display.draw_scaling) * 1.75;
        let txt = this._current_score;

        display.ctx.font = `${txt_size * display.draw_scaling}px 'Press Start 2P'`;
        if (this._new_highscore) {
            display.ctx.strokeStyle = game.GAME_MODE_COLOR(true, game.game_mode);
        } else {
             display.ctx.strokeStyle = "#553847";
        }

        display.ctx.lineWidth = 6 * display.draw_scaling;
        display.ctx.strokeText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);

        display.ctx.fillStyle = "#fefefe";

        display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);

    }

    draw_gameover_scoreboard(display, game) {
    
            let txt_size = 50 * display.draw_scaling;
            let txt = "";

            if (this._new_highscore) {
                txt = "High Score";
            } else {
                txt = "Game Over";
            }

            let padding = 50 * display.draw_scaling;
            display.ctx.font = `${txt_size}px 'Press Start 2P'`;

            while(display.ctx.measureText(txt).width > display.width * 0.85) {
                txt_size--;
                display.ctx.font = `${txt_size}px 'Press Start 2P'`;
            }

            let window_size = [350 * display.draw_scaling, 230 * display.draw_scaling];

            if (window_size[0] > display.width) {
                window_size[0] = display.width *.85;
            }
            let window_position = [(display.width / 2) - (window_size[0] / 2),
                                        (display.height / 2) - (window_size[1] / 2)];

            //draw window box
            display.ctx.globalAlpha = 0.5;
            //display.ctx.strokeStyle = "#4c3b46";
            display.ctx.fillStyle = "#4c3b46";
            display.ctx.lineWidth = 10;
            display.ctx.beginPath();
            display.ctx.roundRect(...window_position, ...window_size, 25);
            
            //display.ctx.stroke();
            display.ctx.fill();
            display.ctx.globalAlpha = 1.0;

            //draw gameover text
            let Y_position = window_position[1] - padding / 2;

            if (this._new_highscore) {
                display.ctx.strokeStyle = game.GAME_MODE_COLOR(true, game.game_mode);
            } else {
                display.ctx.strokeStyle = "#553847";
            }

            display.ctx.lineWidth = 5 * display.draw_scaling;
            display.ctx.strokeText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
            display.ctx.fillStyle = "#fefefe";
            display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);

            //drawing each stat
            
            txt_size = 18 * display.draw_scaling;
            Y_position = (padding * 1.25) * display.draw_scaling;
    
            display.ctx.font = `${txt_size}px 'Press Start 2P'`;
            
            let label = [
                `Score: ${this._current_score}`,
                `Best: ${this._display_high_score}`,
                `Attempts: ${this._attempts}`
                //`Mode: ${game.GAME_MODE_TEXT(game.game_mode)}`
            ];

            label.forEach((item, index) => {
                if (index === 1 && this._new_highscore) {
                    display.ctx.fillStyle = game.GAME_MODE_COLOR(true, game.game_mode);
                    item = "*New " + item + "*";
                } else {
                    display.ctx.fillStyle = "#fefefe";
                }
                display.ctx.fillText(item, window_position[0] + padding, window_position[1] + (padding * (index + 1)))
            });

            txt = "Mode: ";
            display.ctx.fillText(txt, window_position[0] + padding, window_position[1] + (padding * 4));
            display.ctx.fillStyle = game.GAME_MODE_COLOR(true, game.game_mode)
            display.ctx.fillText(game.GAME_MODE_TEXT(game.game_mode), window_position[0] + padding + display.ctx.measureText(txt).width, 
                    window_position[1] + (padding * 4));
       }

}

