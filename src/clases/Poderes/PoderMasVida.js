const { enteroAleatorio } = require("../../utils");
const Poder = require("./Poder");

class PoderMasVida extends Poder{
    constructor(mapa){
        super(mapa);
        this.color = "green";

        // Rango: [1 - 10]
        // 70% - 1
        // 30% - 2
        this.vidaExtra = enteroAleatorio(1, 10) <= 7 ? 1 : 2;
    }
    accion(jugador){
        jugador.vida += this.vidaExtra;
    }
}

module.exports = PoderMasVida;