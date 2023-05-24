
// delta time
export default class Delta_Time {
    constructor() {
        this._frames_per_second = 60;
        this._previousTime = performance.now();
        this._frame_interval = 1000 / this._frames_per_second;
        this._delta_time_multiplier = 1;
    }

    get delta_time_multiplier() {
        return this._delta_time_multiplier;
    }

    set delta_time_multiplier(new_time) {
        this._delta_time_multiplier = new_time;
    }

    get previousTime() {
        return this._previousTime;
    }

    set previousTime(previous_time) {
        this._previousTime = previous_time;
    }

    get frame_interval() {
        return this._frame_interval;
    }


}