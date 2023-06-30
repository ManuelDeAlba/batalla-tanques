class Bala{
    constructor({id_jugador, x, y, dano=1, angulo, color="gray"}){
        this.id_jugador = id_jugador;
        this.x = x;
        this.y = y;
        this.r = 10;
        this.color = color; 
        this.angulo = angulo;
        this.vel = 6;
        this.dano = dano;

        this.estado = 1;
    }
    mover(mapa){
        // Se mueve la bala
        this.x += Math.cos(this.angulo) * this.vel;
        this.y += Math.sin(this.angulo) * this.vel;

        // Si la bala está fuera del mapa, se borra
        if(mapa.estaFuera(this)) this.estado = 0;
    }
    comprobarColisiones(jugadores){
        // Colisión con jugadores o bots
        jugadores.forEach(jugador => {
            if(jugador.id == this.id_jugador) return;

            let distancia = Math.sqrt((jugador.x - this.x) ** 2 + (jugador.y - this.y) ** 2);

            if(distancia < jugador.r + this.r){
                // Desaparece la bala
                this.estado = 0;
                
                // Al jugador se le baja la vida por el disparo
                jugador.vida -= this.dano;
                
                // Si ya se murió el jugador
                if(jugador.vida <= 0){
                    jugador.vida = 0;

                    // Le suma un enemigo eliminado al dueño de la bala
                    let creador = jugadores.find(jugador => jugador.id == this.id_jugador);
                    if(creador) creador.enemigosEliminados++;
                }
            }
        })
    }
}

module.exports = Bala;