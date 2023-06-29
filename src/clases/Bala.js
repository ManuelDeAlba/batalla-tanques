class Bala{
    constructor({id_jugador, x, y, angulo, color}){
        this.id_jugador = id_jugador;
        this.x = x;
        this.y = y;
        this.r = 10;
        this.color = color; 
        this.angulo = angulo;
        this.vel = 6;
        this.dano = 1;

        this.estado = 1;
    }
    mover(jugadores, mapa){
        // Se mueve la bala
        this.x += Math.cos(this.angulo) * this.vel;
        this.y += Math.sin(this.angulo) * this.vel;

        // Si la bala está fuera del mapa, se borra
        if(mapa.estaFuera(this)) this.estado = 0;

        // Colisión con jugadores
        for(let i in jugadores){
            // Si el jugador es el creador, no cuenta la colisión
            if(i == this.id_jugador) continue;
            
            let jugador = jugadores[i];
            let distancia = Math.sqrt((jugador.x - this.x) ** 2 + (jugador.y - this.y) ** 2);

            if(distancia < jugador.r + this.r){
                // Desaparece la bala
                this.estado = 0;
                
                // Al jugador se le baja la vida por el disparo
                jugador.vida -= this.dano;
                if(jugador.vida < 0) jugador.vida = 0;
            }
        }
    }
}

module.exports = Bala;