class Bala{
    constructor({x, y, angulo, color, id_jugador}){
        this.id_jugador = id_jugador;
        this.x = x;
        this.y = y;
        this.r = 10;
        this.color = color; 
        this.angulo = angulo;
        this.vel = 5;
        this.dano = 1;

        this.estado = 1;
    }
    mover(jugadores){
        this.x += Math.cos(this.angulo) * this.vel;
        this.y += Math.sin(this.angulo) * this.vel;

        if(this.x + this.r < 0 || this.x - this.r > 500 || this.y + this.r < 0 || this.y - this.r > 500){
            this.estado = 0;
        }

        // Colisión con jugadores
        for(let i in jugadores){
            if(i != this.id_jugador){
                let jugador = jugadores[i];
                let distancia = Math.sqrt((jugador.x - this.x)**2 + (jugador.y - this.y)**2);
                if(distancia < jugador.r + this.r){
                    this.estado = 0;
                    
                    jugador.vida -= this.dano;
                    if(jugador.vida < 0) jugador.vida = 0;
                }
            }
        }
    }
}

module.exports = Bala;