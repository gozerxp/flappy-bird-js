

export default class Pipes {

    constructor(game) {
        
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
                blast_speed: 11.5,
                max_blast_height: 0
            },
        }

        this._pipe_array_data = {

            x : 0, 
            y : 0, 
            scored : false, // flag to ensure score is only counted once per pipe
    
            type_index : 0, // 0 = "green", 1 = "blue", 3 = "red"
    
            inverse_y : 0, // for movable pipes (blue)'
            
            red_top_or_btm : false, // true = top pipe, false = bottom pipe
            
            blasted : false, // check if the cannon has already been fired (red).
            reached_max_blast_height : false,
            cannon_Y : 0 // track trajectory of cannonball
        }

        this._pipes_array = [];

        this._pipe_gap = [270, 220];
        
        this._pipe_gap[0] *= game.draw_scaling;
        this._pipe_gap[1] *= game.draw_scaling;
        
        this._sprites.pipes.draw_size[0] = this._sprites.pipes.pipe_size[0] * game.draw_scaling;
        this._sprites.pipes.draw_size[1] = this._sprites.pipes.pipe_size[1] * game.draw_scaling;
        this._sprites.cannon_ball.draw_size[0] = this._sprites.cannon_ball.size[0] * game.draw_scaling;
        this._sprites.cannon_ball.draw_size[1] = this._sprites.cannon_ball.size[1] * game.draw_scaling;

        this._sprites.cannon_ball.blast_speed *= game.draw_scaling;

        this._start_position = game.SCREEN_SIZE[0] + this._pipe_gap[0] + this._sprites.pipes.draw_size[0];
        this._max_pipes = Math.ceil(game.SCREEN_SIZE[0] / (this._sprites.pipes.pipe_size[0] + this._pipe_gap[0])) + 1;
        
        this._sprites.cannon_ball.max_blast_height = this._pipe_gap[1];

        this._total_pipes = 0;

        this._sprite_sheet = new Image();
        this._sprite_sheet.src = "assets/flappy-bird-set.png";

        this.reset(game);
    } 

    reset(game) {
        this._total_pipes = 0;
        this._pipes_array = this.initialize_pipes(game);
    }

    pipeLoc(game) { 
        return ( this._sprites.pipes.draw_size[1] + (Math.random() * ((game.ground_collision / 2) - this._sprites.pipes.draw_size[1]))); 
    }

    initialize_pipes(game) {

        let pipes_array = [];
	
        for (let i = 0; i < this._max_pipes; i++) {
        
            const temp = {...this._pipe_array_data};
            
            temp.x = this._start_position + (i * (this._pipe_gap[0] + this._sprites.pipes.draw_size[0]));
            temp.y = this.pipeLoc(game);
            temp.type_index = 0; //level_up(); // start with green pipes
            
            //temp.inverse_y = moving_pipe_invert(temp.y);
            //temp.red_top_or_btm = Boolean(Math.round(Math.random()));
    
            // metric for movable pipe
            
            pipes_array.push(temp);
    
            this._total_pipes++;
        }
        
        return pipes_array;

    }

    _spawn_pipes(pipes_array, game) {

        // create new pipe when pipe[0].x goes offscreen
        
        if (pipes_array[0].x <= -this._sprites.pipes.draw_size[0]) {
                      
            const new_pipes = pipes_array;
            
            new_pipes.shift();
            
            // new pipe		
            const temp = {...this._pipe_array_data};
            temp.x = pipes_array[(pipes_array.length - 1)].x + (this._pipe_gap[0] + this._sprites.pipes.draw_size[0]);
            temp.y = this.pipeLoc(game);
            temp.type_index = 0; //level_up();
            // temp.inverse_y = moving_pipe_invert(temp.y);
            // temp.red_top_or_btm = Boolean(Math.round(Math.random())); //randomizes if the red pipe will be on the top of bottom of the screen
            
            new_pipes.push(temp);
    
            this._total_pipes++;
            
            return new_pipes;
            
        } 
            
        return pipes_array;
        
    }

    draw_pipes(ctx, game, delta) {
        this._pipes_array.forEach(pipe => this._draw_pipe(pipe, ctx, game, delta));
        this._pipes_array = this._spawn_pipes(this._pipes_array, game);
    }

    _load_pipe_components(pipe_components, pipe, game, delta) {

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
                if (pipe.x < (game.SCREEN_SIZE[0] + this._sprites.pipes.draw_size[0]) && !pipe.scored) {
                    if (pipe.inverse_y > pipe.y) {
                        pipe.y += (1 * game.draw_scaling) * delta.delta_time_multiplier;
                    } else {
                        pipe.y -= (1 * game.draw_scaling) * delta.delta_time_multiplier; 
                    }
                }
    
                break;
    
            case 2:  // red pipe

                temp.top_pipe = [this._sprites.pipes.red.top_pipe[0], this._sprites.pipes.red.top_pipe[1]];
                temp.btm_pipe = [this._sprites.pipes.red.btm_pipe[0], this._sprites.pipes.red.btm_pipe[1]];
                temp.stem_pipe = [this._sprites.pipes.red.stem_pipe[0], this._sprites.pipes.red.stem_pipe[1]];
    
                // check to see if cannon has been blasted
                // if (pipe.blasted) { 
                //     //draw_cannonball(pipe); 
                //     //cannonball_logic(pipe); 
                // } else {
                //     //code for checking why cannon hasn't been blasted yet.
                //     //check_for_blastoff(pipe);
                //}
                // write code for cannonball

                break;
        }

        return temp;

    }

    _draw_pipe(pipe, ctx, game, delta) {		
									
        // pipe moving	
        pipe.x -= game.increased_speed * delta.delta_time_multiplier;
        
        let pipe_components = {
             top_pipe : [0, 0],
             btm_pipe : [0, 0],
             stem_pipe : [0, 0]
        };
        
        pipe_components = this._load_pipe_components(pipe_components, pipe, game, delta);
   
        if (!(pipe.type_index === 2 && !pipe.red_top_or_btm)) { // checking red pipe logic
            // top pipe_stem
            let x = 0;
            let y = pipe.y - this._sprites.pipes.draw_size[1];
            this._draw_pipe_stems(ctx, x, y, pipe_components.stem_pipe, pipe);
                    
            // top_pipe
            ctx.drawImage(this._sprite_sheet, ...pipe_components.top_pipe, ...this._sprites.pipes.pipe_size, 
                pipe.x, pipe.y - this._sprites.pipes.draw_size[1] - 1, ...this._sprites.pipes.draw_size);
        }
    
        if (!(pipe.type_index === 2 && pipe.red_top_or_btm)) { // checking red pipe logic
            // bottom pipe_stem
            let y = pipe.y + this._pipe_gap[1] + this._sprites.pipes.draw_size[1];
            let x = game.ground_collision - y;
            this._draw_pipe_stems(ctx, y, x, pipe_components.stem_pipe, pipe);
                
            // bottom_pipe
            ctx.drawImage(this._sprite_sheet, ...pipe_components.btm_pipe, ...this._sprites.pipes.pipe_size, 
                pipe.x, pipe.y + this._pipe_gap[1] + 1, ...this._sprites.pipes.draw_size);
        }
    
        //pipe_logic(pipe); // collision and scoring detection
    
        
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
            let check_pipe_x1 = pipe.x <= player.getPosition + player.getSize[0];
            let check_pipe_x2 = pipe.x + this._sprites.pipes.draw_size[0] >= player.getPosition;

            // check if has hit the top or bottom pipe
            let check_top_pipe = pipe.y > player.getflyHeight && 
                (!(pipe.type_index === 2 && !pipe.red_top_or_btm)); // red pipe logic
            let check_btm_pipe = pipe.y + this._pipe_gap[1] < player.getflyHeight + player.getSize[1] &&
                (!(pipe.type_index === 2 && pipe.red_top_or_btm)); // red pipe logic
            
            if ([check_pipe_x1, check_pipe_x2, check_top_pipe || check_btm_pipe].every((elem) => elem)) {
                
                console.log("HIT PIPE!");
                game_over = true;
                
            } else if ((pipe.x + this._sprites.pipes.draw_size[0]) < player.getPosition && pipe.scored === false) { 
            // check to see if pipe moves past theshold for the first time.
                pipe.scored = true; // flag so we don't count the same pipe more than once
                game.increase_score();                
            }
        });

        return game_over;
        
    }



}