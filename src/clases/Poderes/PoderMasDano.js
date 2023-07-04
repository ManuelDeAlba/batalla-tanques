const Poder = require("./Poder");

class PoderMasDano extends Poder{
    constructor(mapa){
        super(mapa);
        this.color = "blue";

        this.danoPoder = 2;
        this.duracion = 5000; // Milisegundos duración poder
        this.temporizador;
    }
    accion(jugador){
        // Busca si ya tiene un poder activo de este tipo
        //? Como máximo tiene uno activo porque cada que se activa uno borra los demás para evitar que su temporizador quite el daño desde antes (reinicia el tiempo del poder)
        let indicePoder;
        let poderActivo = jugador.poderesActivos.find((poder, indice) => {
            indicePoder = indice;
            return poder instanceof PoderMasDano;
        });

        // Si tiene un poder activo de este tipo, se limpia el setTimeout
        if(poderActivo){
            clearTimeout(poderActivo.temporizador);
            // Se borra el poder del arreglo
            jugador.poderesActivos.splice(indicePoder, 1);
        }

        // Se aplica el poder
        jugador.dano = this.danoPoder;
        jugador.poderesActivos.push(this);

        // Se crea el setTimeout para quitar el efecto del poder
        this.temporizador = setTimeout(() => {
            // Reestablece el daño
            jugador.dano = jugador.danoOriginal;
            
            // Se le borran los poderes que ya se aplicaron
            this.temporizador = null;
            jugador.poderesActivos = jugador.poderesActivos.filter(poder => poder.temporizador != null);
        }, this.duracion);
    }
}

module.exports = PoderMasDano;