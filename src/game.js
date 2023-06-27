

export default class Game {

    constructor() {

        this._gravity = 0.5;// * this._draw_scaling;
        this._speed = 5.5;// * this._draw_scaling;
        this._increased_speed = this._speed;

        this._game_state = 0;
        // 0 = start screen
        // 1 = game playing
        // 2 = game over screen
        // 3 = ?
        this._game_over_timer = 0;
        this._game_playable = true;

        this.scoreboard = {
            currentScore : 0,
            bestScore : 0,
            attempts : 0
        }
        
        this._logo_sprite = new Image();
        this._logo_sprite.src = "assets/fb-logo.png";
    }

    set_scaling(display) {

        this.ground_collision = display.height - 150 * (display.draw_scaling / 1.5);

    }

    level_up(pipe) {
        
        if (pipe.get_total_pipes <= 5) {
            return 0;
        } else if (pipe.get_total_pipes > 5 && pipe.get_total_pipes < 10) {
            return Math.round(Math.random() * 1);	
        
        } else if (pipe.get_total_pipes >= 10) {
            return Math.round(Math.random() * 2);
        } 
    }

    draw_scoreboard(display) {

        let txt_size = 60;
        let Y_position = (txt_size * 2) * display.draw_scaling;
        let txt = this.scoreboard.currentScore;

        if (this.game_state > 0) { //only draw current score during gameplay.
            display.ctx.font = `${txt_size * display.draw_scaling}px 'Press Start 2P'`;
            display.ctx.strokeStyle = "#553847";
            display.ctx.lineWidth = 6 * display.draw_scaling;
            display.ctx.strokeText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
            display.ctx.fillStyle = "#fefefe";
            display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
        }

        let padding = 15;
        txt_size = 15;
        Y_position = padding * 1.75;

        display.ctx.font = `${txt_size}px 'Press Start 2P'`;
        display.ctx.fillStyle = "#553847";

        txt = `Best: ${this.scoreboard.bestScore}`;
        display.ctx.fillText(txt, padding, Y_position);

        txt = `Attempts: ${this.scoreboard.attempts}`;
        display.ctx.fillText(txt, display.width - display.ctx.measureText(txt).width - padding, Y_position);
        
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

    get game_state() {
        return this._game_state;
    }

    set game_state(game_state) {
        this._game_state = game_state;
    }

    get game_playable() {
        return this._game_playable;
    }

    set game_playable(game_playable) {
        this._game_playable = game_playable;
    }

    draw_start_screen(display, __touch_device__, _VERSION_) {

        let logoScaling = [600, 160];
        if(this._logo_sprite.width >= display.width * 0.8) { 
            logoScaling[0] = display.width * 0.8;
            logoScaling[1] *= logoScaling[0] / 600;
        }

        // drawing logo
        display.ctx.drawImage(this._logo_sprite, 0, 0, 600, 160,
            (display.width / 2) - (logoScaling[0] / 2), (160 * display.draw_scaling), logoScaling[0], logoScaling[1]);

        this._draw_tap_2_play_txt(display, __touch_device__, _VERSION_);
        
    }

    draw_game_over(display, delta, __touch_device__, _VERSION_) {

        display.ctx.globalAlpha = 0.6;
        display.ctx.fillStyle = "gray";
        display.ctx.fillRect(0, 0, display.width, display.height);
        display.ctx.globalAlpha = 1.0;

        let txt_size = 40;
        let Y_position = display.height / 3;
        let txt = "Game Over";

        display.ctx.font = `${txt_size * display.draw_scaling}px 'Press Start 2P'`;
        display.ctx.strokeStyle = "#553847";
        display.ctx.lineWidth = 6 * display.draw_scaling;
        display.ctx.strokeText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);
        display.ctx.fillStyle = "#fefefe";
        display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), Y_position);

        if (this.game_playable) {
            this._draw_tap_2_play_txt(display, __touch_device__, _VERSION_);

            //reset to start screen after 5 seconds.
            if (delta.previousTime - this._game_over_timer >= (5 * 1000)) {
                this.game_state = 0;
            } 
        }

    }

    _draw_tap_2_play_txt(display, __touch_device__, _VERSION_) {

        let txt = "";
        if (__touch_device__) { 
            txt = "Tap to play";
        } else { 
            txt = "Click to play";
        }
        
        display.ctx.font = `bold ${32 * display.draw_scaling}px courier new`;
        display.ctx.fillStyle = "#4c3b46";
        display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), (550 * display.draw_scaling));
        
        txt = `Version: ${_VERSION_}`;
        display.ctx.font = `bold ${18 * display.draw_scaling}px courier new`;
        display.ctx.fillText(txt, 10, this.ground_collision - 12)

    }

    game_logic(player, pipes, delta) {

        let check_ground = this._check_ground_collision(player); 
        let check_pipes = pipes.check_pipe_logic(player, this); 

        if(check_ground || check_pipes) {
            this.game_state = 2; // draw game over
            this.game_playable = false;
            this._game_over_timer = delta.previousTime;

        }
    }

    _check_ground_collision(player) {
        return player.getflyHeight + player.getSize[1] >= this.ground_collision;
    }

    increase_score() {
        this.scoreboard.currentScore++;
        this.scoreboard.bestScore = Math.max(this.scoreboard.bestScore, this.scoreboard.currentScore)
    }

    reset_game() {

        this.scoreboard.currentScore = 0;
        this.scoreboard.attempts++;

        this._increased_speed = this._speed;

        this._game_state = 1;
    }
}