

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
        this._game_mode = this._load_game_mode();
        // 0 - classic mode
        // 1 - intermediate
        // 2 - expert

        this._game_over_timer = 0;
        this._game_over_timeout = 5; //after 5 seconds go back to start screen
        this._game_playable = true;
        
        this._logo_sprite = new Image();
        this._logo_sprite.src = "assets/fb-logo.png";
    }

    set set_scaling(display) {

        this._ground_collision = display.height - 150 * (display.draw_scaling / 1.5);

    }

    level_up(pipe) {

        switch (this._game_mode) {
            case 0: //classic mode - green pipes only
                return 0;
            case 1: //intermediate - blue pipes show up at 10+
                return pipe.get_total_pipes >= 10 ? Math.round(Math.random() * 1) : 0;
            case 2: //expert mode
                if (pipe.get_total_pipes > 5 && pipe.get_total_pipes < 10) {
                    return Math.round(Math.random() * 1);
                } else if (pipe.get_total_pipes >= 10) {
                    return Math.round(Math.random() * 2);
                } else {
                    return 0;
                }
        }       
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

    get game_mode() {
        return this._game_mode;
    }

    set game_mode(game_mode) {
        this._game_mode = game_mode > 2 ? 0 : game_mode;
        this._save_game_mode();
    }

    get ground_collision() {
        return this._ground_collision;
    }

    GAME_MODE_COLOR() {

        let color = "#4c3b46";

        switch (this._game_mode) {
            case 0:
                color = "lime";
                break;
            case 1:
                color = "blue";
                break;
            case 2:
                color = "red";
                break;
            default:
        }

        return color;
    }

    draw_start_screen(display, __touch_device__, _VERSION_) {

        let logoScaling = [600, 160];
        if(this._logo_sprite.width >= display.width * 0.8) { 
            logoScaling[0] = display.width * 0.8;
            logoScaling[1] *= logoScaling[0] / 600;
        }

        // drawing logo
        display.ctx.drawImage(this._logo_sprite, 0, 0, 600, 160,
            (display.width / 2) - (logoScaling[0] / 2), (140 * display.draw_scaling), ...logoScaling);

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
            if (delta.previousTime - this._game_over_timer >= (this._game_over_timeout * 1000)) {
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
        
        display.ctx.font = `bold ${28 * display.draw_scaling}px courier new`;
        display.ctx.fillStyle = "#4c3b46";
        display.ctx.fillText(txt, display.width / 2 - (display.ctx.measureText(txt).width / 2), (550 * display.draw_scaling));
        
        txt = `Version: ${_VERSION_}`;
        display.ctx.font = `bold ${18 * display.draw_scaling}px courier new`;
        display.ctx.fillText(txt, 10, this._ground_collision - 12)

    }

    game_logic(player, pipes, ufo, delta, scoreboard) {

        let check_ground = this._check_ground_collision(player); 
        let check_pipes = pipes.check_pipe_logic(player, scoreboard); 
        let check_ufo = ufo.check_collision(player);

        if(check_ground || check_pipes || check_ufo) {

            scoreboard.save_high_score(this._game_mode);
            this.game_state = 2; // draw game over
            this.game_playable = false;
            this._game_over_timer = delta.previousTime;

        }
    }

    _save_game_mode() {
        localStorage.setItem("game_mode", this._game_mode);
    }

    _load_game_mode() {

        let game_mode = localStorage.getItem("game_mode");
        //if game mode is null then localStorage variable has not been saved.
        //this variable will be saved on the first gameover screen.
        if (!game_mode) {
            game_mode = 0;   
        }

        return Number(game_mode);

    }

    _check_ground_collision(player) {
        return player.getflyHeight + player.getSize[1] >= this._ground_collision;
    }

    reset_game() {

        this._increased_speed = this._speed;
        this._game_state = 1;
    }
}