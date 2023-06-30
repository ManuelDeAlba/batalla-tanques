const Poder = require("./Poder");

class PoderMasDano extends Poder{
    constructor(mapa){
        super(mapa);
        this.color = "blue";

        this.danoPoder = 2;
        this.duracion = 5000; // Milisegundos duración poder
    }
    accion(jugador){
        // Si no tiene aplicado el poder, entonces lo aplica
        // Esto hace que no se tengan 2 setTimeout y
        // evita problemas de que el primero quite el tiempo del segundo
        if(jugador.dano != this.danoPoder){
            jugador.dano = this.danoPoder;
    
            setTimeout(() => {
                jugador.dano = jugador.danoOriginal;
            }, this.duracion);
        }
    }
}

module.exports = PoderMasDano;