const { enteroAleatorio } = require("../../utils");

class Poder{
    constructor(mapa){
        this.r = 10;
        this.x = enteroAleatorio(mapa.x + this.r, mapa.x + mapa.w - this.r);
        this.y = enteroAleatorio(mapa.y + this.r, mapa.y + mapa.h - this.r);
        this.color = "gray";

        this.estado = 1;
    }
    comprobarColisiones(jugadores){
        // Colisión con jugadores o bots
        jugadores.forEach(jugador => {
            let distancia = Math.sqrt((jugador.x - this.x) ** 2 + (jugador.y - this.y) ** 2);

            if(distancia < jugador.r + this.r){
                // Desaparece el poder
                this.estado = 0;
                
                // Se ejecuta la acción del poder
                if(this.accion) this.accion(jugador);
            }
        })
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

module.exports = Poder;