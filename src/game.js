
const background_height = 768;

// delta time
export default class Game {

    constructor(ctx) {

        this._draw_scaling = 1;
        this._setup_canvas(ctx);

        this._gravity = 0.5 * this._draw_scaling;
        this._speed = 5.5 * this._draw_scaling;
        this._increased_speed = this._speed;

        this._game_state = 0;
        // 0 = start screen
        // 1 = game playing
        // 2 = game over screen
        // 3 = ?
        this._game_over_timer = 0;
        this._game_playable = true;

        this.ground_collision = this.SCREEN_SIZE[1] - 150 * (this._draw_scaling / 1.5);

        this.scoreboard = {
            currentScore : 0,
            bestScore : 0,
            attempts : 0
        }

        this._logo_sprite = new Image();
        this._logo_sprite.src = "assets/fb-logo.png";
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

    _setup_canvas(ctx) {

        this.SCREEN_SIZE = [window.innerWidth, background_height];

        if (window.innerHeight !== this.SCREEN_SIZE[1]) {
            this.SCREEN_SIZE[1] = window.innerHeight;
            this._draw_scaling = this.SCREEN_SIZE[1] / background_height;
        }
        
        console.log(`res: ${this.SCREEN_SIZE[0]}x${this.SCREEN_SIZE[1]}`);

        ctx.canvas.width = this.SCREEN_SIZE[0];
        ctx.canvas.height = this.SCREEN_SIZE[1];
    }

    draw_scoreboard(ctx) {

        let txt_size = 60;
        let Y_position = (txt_size * 2) * this._draw_scaling;
        let txt = this.scoreboard.currentScore;

        if (this.game_state > 0) { //only draw current score during gameplay.
            ctx.font = `${txt_size * this._draw_scaling}px 'Press Start 2P'`;
            ctx.strokeStyle = "#553847";
            ctx.lineWidth = 6 * this._draw_scaling;
            ctx.strokeText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);
            ctx.fillStyle = "#fefefe";
            ctx.fillText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);
        }

        let padding = 25;
        txt_size = 15;
        Y_position = padding * 1.75;//this.ground_collision + ((this.SCREEN_SIZE[1] - this.ground_collision) /  2) + txt_size;

        ctx.font = `${txt_size}px 'Press Start 2P'`;
        ctx.fillStyle = "#553847";

        txt = `Best: ${this.scoreboard.bestScore}`;
        ctx.fillText(txt, padding, Y_position);

        txt = `Attempts: ${this.scoreboard.attempts}`;
        ctx.fillText(txt, this.SCREEN_SIZE[0] - ctx.measureText(txt).width - padding, Y_position);
        
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

    draw_start_screen(ctx, __touch_device__, _VERSION_) {

        let logoScaling = 1;
        if(this._logo_sprite.width >= this.SCREEN_SIZE[0]) { 
            logoScaling = 0.75; 
        }

        // drawing logo
        ctx.drawImage(this._logo_sprite, 0, 0, 600, 160,
            (this.SCREEN_SIZE[0] / 2) - ((600 / 2) * logoScaling), (100 * this.draw_scaling), (600 * logoScaling), (160 * logoScaling));

        this._draw_tap_2_play_txt(ctx, __touch_device__, _VERSION_);
        

    }

    draw_game_over(ctx, delta, __touch_device__, _VERSION_) {

        ctx.globalAlpha = 0.6;
        ctx.fillStyle = "gray";
        ctx.fillRect(0, 0, ...this.SCREEN_SIZE);
        ctx.globalAlpha = 1.0;

        let txt_size = 40;
        let Y_position = this.SCREEN_SIZE[1] / 3;
        let txt = "Game Over";

        ctx.font = `${txt_size * this._draw_scaling}px 'Press Start 2P'`;
        ctx.strokeStyle = "#553847";
        ctx.lineWidth = 6 * this._draw_scaling;
        ctx.strokeText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);
        ctx.fillStyle = "#fefefe";
        ctx.fillText(txt, this.SCREEN_SIZE[0] / 2 - (ctx.measureText(txt).width / 2), Y_position);

        let delta_time = delta.previousTime - this._game_over_timer;

        if(this.game_playable) {
            this._draw_tap_2_play_txt(ctx, __touch_device__, _VERSION_);
        }
        if (delta_time >= 10000) { this.game_state = 0; } //reset to start screen after 10 seconds.
    }

    _draw_tap_2_play_txt(ctx, __touch_device__, _VERSION_) {

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