export default class Pipes {

    constructor(game, display) {
        
        this._sprites = {
        // sprite dimensions
            pipes : {

                green : { // classic pipe
                    top_pipe : [432,511],
                    btm_pipe : [510,108],
                    stem_pipe : [432,110]
                },
                
                blue : { // moving pipe
                    top_pipe : [588,511],
                    btm_pipe : [666,108],
                    stem_pipe : [588,110]
                },
                
                red : { // cannonball pipe
                    top_pipe : [744,511],
                    btm_pipe : [822,108],
                    stem_pipe : [744,110]
                },

                pipe_size : [78,77],
                stem_size : [78, 0],
                max_stem_size : 400,
    
                draw_size : [0, 0] // draw_scaling

            },

            cannon_ball : {

                sprite : [500, 0],
                size : [62, 62],
                draw_size : [0, 0],
                blast_speed: 15,
                max_blast_height: 0
            },
        }

        this._pipe_array_data = {

            x : 0, 
            y : 0, 

            gap_x : 0,
            gap_y : 0,

            scored : false, // flag to ensure score is only counted once per pipe
    
            type_index : 0, // 0 = "green", 1 = "blue", 3 = "red"
    
            up_or_down : false, 
            // blue pipes - true moves pipe up, false moves pipe down
            // red pipes - true for only showing top pipe, false for only showing bottom pipe.
            
            blasted : false, // check if the cannon has already been fired (red).
            reached_max_blast_height : false,
            cannon_Y : 0 // track trajectory of cannonball for collission

        }

        this._pipes_array = [];

        this._pipe_gap = [350, 220],//[270, 220]; //default gap
        this._minimum_gap = [150, 100]; //minimum gap constrants 
        
        this._pipe_gap[0] *= game.draw_scaling;
        this._pipe_gap[1] *= game.draw_scaling;
        this._minimum_gap[0] *= game.draw_scaling;
        this._minimum_gap[1] *= game.draw_scaling;
        
        this._sprites.pipes.draw_size[0] = this._sprites.pipes.pipe_size[0] * game.draw_scaling;
        this._sprites.pipes.draw_size[1] = this._sprites.pipes.pipe_size[1] * game.draw_scaling;

        this._sprites.cannon_ball.draw_size[0] = this._sprites.cannon_ball.size[0] * game.draw_scaling;
        this._sprites.cannon_ball.draw_size[1] = this._sprites.cannon_ball.size[1] * game.draw_scaling;

        this._sprites.cannon_ball.blast_speed *= game.draw_scaling;

        this._start_position = display.width + this._pipe_gap[0] + this._sprites.pipes.draw_size[0];
        this._max_pipes = Math.ceil(display.width / (this._sprites.pipes.pipe_size[0] + this._pipe_gap[0])) + 1;
        
        this._sprites.cannon_ball.max_blast_height = this._pipe_gap[1];

        this._total_pipes = 0;

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/flappy-bird-set.png";

        this._blast_fx = new Audio('assets/blast.ogg');
        this._blast_fx.load();

    } 

    reset(game) {
        this._total_pipes = 0;
        this._pipes_array = [];
        this._pipes_array = this._spawn_pipe(this._pipes_array, game);
    }

    _pipe_height(game) { 
        return ( this._sprites.pipes.draw_size[1] + (Math.random() * ((game.ground_collision / 2) - this._sprites.pipes.draw_size[1]))); 
    }

    get get_total_pipes() {
        return this._total_pipes;
    }

    _spawn_pipe(pipes_array, game) {

        let last_pipe = pipes_array.length - 1

        if (!this._total_pipes || pipes_array[last_pipe].x <= game.SCREEN_SIZE[0]) {
                      
            const new_pipes = pipes_array;
            
            // new pipe		
            const temp = {...this._pipe_array_data};

            if (this._total_pipes) {

                temp.x = pipes_array[last_pipe].x + pipes_array[last_pipe].gap_x + this._sprites.pipes.draw_size[0];
            
            } else { 

                temp.x = this._start_position;
            }
            
            temp.y = this._pipe_height(game);
            temp.type_index = game.level_up(this);
            temp.gap_x = Math.max(this._minimum_gap[0], Math.random() * this._pipe_gap[0]);
            temp.gap_y = this._pipe_gap[1];
            temp.up_or_down = this._up_or_down(temp, game);
            
            new_pipes.push(temp);
    
            this._total_pipes++;

            //console.log(`total pipes: ${this._total_pipes} | pipes array length ${new_pipes.length}`);
            
            return new_pipes;
        } 
            
        return pipes_array;   
    }

    _up_or_down(temp, game) {

        switch (temp.type_index) {
            case 1: //check where blue pipe's starting position, if its less than 1/3 of ground collission then move down
                if (temp.y >= game.ground_collision / 3) {
                    return true;
                } else { //otherwise move up
                    return false;
                }
                break;
            case 2: //randomize red pipe
                return Boolean(Math.round(Math.random()));
                break;
            default:
                return false;
        }
        
    }

    _shift_pipes(pipes_array) {

        // remove pipe when pipe[0].x goes offscreen
        if (pipes_array.length > 0 && pipes_array[0].x <= -this._sprites.pipes.draw_size[0]) {
                      
            const new_pipes = pipes_array;
            new_pipes.shift();

            return new_pipes;
        }

        return pipes_array;

    }

    draw_pipes(ctx, player, game, delta) {

        this._pipes_array.forEach(pipe => this._draw_pipe(ctx, pipe, player, game, delta));
        this._pipes_array = this._shift_pipes(this._pipes_array);
        this._pipes_array = this._spawn_pipe(this._pipes_array, game);
    }

    _load_pipe_components(pipe_components, ctx, pipe, player, game, delta) {

        const temp = {...pipe_components}

        switch (pipe.type_index) {
            
            case 0: // green pipe

                temp.top_pipe = [this._sprites.pipes.green.top_pipe[0], this._sprites.pipes.green.top_pipe[1]];
                temp.btm_pipe = [this._sprites.pipes.green.btm_pipe[0], this._sprites.pipes.green.btm_pipe[1]];
                temp.stem_pipe = [this._sprites.pipes.green.stem_pipe[0], this._sprites.pipes.green.stem_pipe[1]];
    
                break;
    
            case 1: // blue pipe

                temp.top_pipe = [this._sprites.pipes.blue.top_pipe[0], this._sprites.pipes.blue.top_pipe[1]];
                temp.btm_pipe = [this._sprites.pipes.blue.btm_pipe[0], this._sprites.pipes.blue.btm_pipe[1]];
                temp.stem_pipe = [this._sprites.pipes.blue.stem_pipe[0], this._sprites.pipes.blue.stem_pipe[1]];
    
                // movable pipes - pipe index 1 - blue pipe
                if (game.game_state === 1) {
                    if (pipe.x < (game.SCREEN_SIZE[0] + this._sprites.pipes.draw_size[0]) && !pipe.scored) {
                        if (pipe.up_or_down) { //if true, move blue pipes upward
                            pipe.y -= (1 * game.draw_scaling) * delta.delta_time_multiplier;
                        } else { 
                            pipe.y += (1 * game.draw_scaling) * delta.delta_time_multiplier; 
                        }
                    }
                }
    
                break;
    
            case 2:  // red pipe

                temp.top_pipe = [this._sprites.pipes.red.top_pipe[0], this._sprites.pipes.red.top_pipe[1]];
                temp.btm_pipe = [this._sprites.pipes.red.btm_pipe[0], this._sprites.pipes.red.btm_pipe[1]];
                temp.stem_pipe = [this._sprites.pipes.red.stem_pipe[0], this._sprites.pipes.red.stem_pipe[1]];
    
                // check to see if cannon has been blasted
                if (game.game_state === 1) {
                    if (pipe.blasted) { 
                        this._draw_cannonball(ctx, pipe, delta); 
                    } else {
                        //code for checking why cannon hasn't been blasted yet.
                        this._check_4_blastoff(pipe, player);
                    }
                }

                break;

            default:

                break;
        }

        return temp;

    }

    _draw_cannonball(ctx, pipe, delta) {

        if (pipe.up_or_down) { //top pipe
            pipe.cannon_Y += this._sprites.cannon_ball.blast_speed * delta.delta_time_multiplier;
        } else {
            pipe.cannon_Y -= this._sprites.cannon_ball.blast_speed * delta.delta_time_multiplier;
        }
    
        let x = pipe.x + (this._sprites.pipes.draw_size[0] / 2) - (this._sprites.cannon_ball.draw_size[0] / 2);
    
        // cannon ball	
        ctx.drawImage(this._sprite_sheet, ...this._sprites.cannon_ball.sprite, ...this._sprites.cannon_ball.size,
            x, pipe.cannon_Y, ...this._sprites.cannon_ball.draw_size);

    }

    _check_4_blastoff(pipe, player) {

        if (pipe.x - player.getPosition < (pipe.gap_x / 1.25)) {
		
            if (pipe.up_or_down) {
                pipe.cannon_Y = pipe.y - this._sprites.cannon_ball.draw_size[1]; // top pipe cannonball starting position
            } else {
                pipe.cannon_Y = pipe.y + pipe.gap_y + this._sprites.cannon_ball.draw_size[1]; // bottom pipe cannonball starting position
            }
            
            pipe.blasted = true;
            this._blast_fx.play();
        }
    }

    _draw_pipe(ctx, pipe, player, game, delta) {		
									
        // pipe moving
        if (game.game_state === 1) {
            pipe.x -= game.increased_speed * delta.delta_time_multiplier;
        }

        let pipe_components = {
             top_pipe : [0, 0],
             btm_pipe : [0, 0],
             stem_pipe : [0, 0]
        };
        
        pipe_components = this._load_pipe_components(pipe_components, ctx, pipe, player, game, delta);
   
        if (!(pipe.type_index === 2 && !pipe.up_or_down)) { // checking red pipe logic
            // top pipe_stem
            let x = 0;
            let y = pipe.y - this._sprites.pipes.draw_size[1];
            this._draw_pipe_stems(ctx, x, y, pipe_components.stem_pipe, pipe);
                    
            // top_pipe
            ctx.drawImage(this._sprite_sheet, ...pipe_components.top_pipe, ...this._sprites.pipes.pipe_size, 
                pipe.x, pipe.y - this._sprites.pipes.draw_size[1] - 1, ...this._sprites.pipes.draw_size);
        }
    
        if (!(pipe.type_index === 2 && pipe.up_or_down)) { // checking red pipe logic
            // bottom pipe_stem
            let y = pipe.y + this._pipe_gap[1] + this._sprites.pipes.draw_size[1];
            let x = game.ground_collision - y;
            this._draw_pipe_stems(ctx, y, x, pipe_components.stem_pipe, pipe);
                
            // bottom_pipe
            ctx.drawImage(this._sprite_sheet, ...pipe_components.btm_pipe, ...this._sprites.pipes.pipe_size, 
                pipe.x, pipe.y + this._pipe_gap[1] + 1, ...this._sprites.pipes.draw_size);
        }
   
    }

    _draw_pipe_stems(ctx, y, stem_size, stem_pipe, pipe) {
	
        let x, z;
        
        while (stem_size > 0) {
            if (stem_size > this._sprites.pipes.max_stem_size) { 
                x = this._sprites.pipes.max_stem_size;
            } else {
                x = stem_size;
            }
            ctx.drawImage(this._sprite_sheet, ...stem_pipe, this._sprites.pipes.stem_size[0], x, 
                pipe.x, y, this._sprites.pipes.draw_size[0], stem_size); 
    
            y += x;
            stem_size -= this._sprites.pipes.max_stem_size;
        }
    
    }

    check_pipe_logic(player, game) {

        let game_over = false;

        this._pipes_array.forEach(pipe => {

            // if hit the pipe, end

            // check if player has entered into x-axis of oncoming pipe
            let check_pipe_x1 = pipe.x < player.getPosition + player.getSize[0];
            let check_pipe_x2 = pipe.x + this._sprites.pipes.draw_size[0] > player.getPosition;

            // check if has hit the top or bottom pipe
            let check_top_pipe = pipe.y > player.getflyHeight && 
                (!(pipe.type_index === 2 && !pipe.up_or_down)); // red pipe logic
            let check_btm_pipe = pipe.y + pipe.gap_y < player.getflyHeight + player.getSize[1] &&
                (!(pipe.type_index === 2 && pipe.up_or_down)); // red pipe logic
            
            if ([check_pipe_x1, check_pipe_x2, check_top_pipe || check_btm_pipe].every((elem) => elem)) {
                
                console.log("HIT PIPE!");
                game_over = true;
            
            } else if (this._check_cannonball_logic(pipe, player)) {

                console.log("HIT CANNONBALL!");
                game_over = true;

            } else if (pipe.scored === false && (pipe.x + this._sprites.pipes.draw_size[0]) < player.getPosition) { 
            // check to see if pipe moves past theshold for the first time.
                pipe.scored = true; // flag so we don't count the same pipe more than once
                game.increase_score();                
            }
        });

        return game_over;
        
    }

    _check_cannonball_logic(pipe, player) {

        let cannon_x = pipe.x + (this._sprites.pipes.draw_size[0] / 2) - (this._sprites.cannon_ball.draw_size[0] / 2);

        let check_x1 = cannon_x < player.getPosition + player.getSize[0];
        let check_x2 = cannon_x + this._sprites.cannon_ball.draw_size[0] > player.getPosition;
    
        let check_y1 = pipe.cannon_Y < player.getflyHeight;
        let check_y2 = pipe.cannon_Y + this._sprites.cannon_ball.draw_size[1] > player.getflyHeight + player.getSize[1];
    
        if ([check_x1, check_x2, check_y1, check_y2].every((elem) => elem)) {
            return true;
        } else {
            return false;
        }

    }



}