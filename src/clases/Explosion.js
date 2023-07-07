class Explosion{
    constructor({x, y, r}){
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = "orangered";
        this.estado = 2;

        this.rMax = this.r * 2;
        this.aumentoRadio = 2;
        this.disminucionRadio = 1;
    }
    mover(){
        if(this.estado == 2){
            this.r += this.aumentoRadio;

            if(this.r >= this.rMax){
                this.r = this.rMax;
                this.estado = 1;
            }
        } else if(this.estado == 1){
            this.r -= this.disminucionRadio;

            if(this.r <= 0){
                this.r = 0;
                this.estado = 0;
            }
        }

    }
    obtenerDatosFrontend(){
        return {
            x: this.x,
            y: this.y,
            r: this.r,
            color: this.color
        }
    }
}

module.exports = Explosion;