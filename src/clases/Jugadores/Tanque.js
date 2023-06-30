const { enteroAleatorio } = require("../../utils");

class Tanque{
    constructor(mapa){
        this.r = 20;
        this.x = enteroAleatorio(mapa.x + this.r, mapa.x + mapa.w - this.r);
        this.y = enteroAleatorio(mapa.y + this.r, mapa.y + mapa.h - this.r);
        this.vel = 5;
        this.angulo = 0;
        this.velAngulo = 5;

        this.vida = 10;
        this.dano = 1;
        this.danoOriginal = this.dano; // Para regresar su daño después de un poder
        this.enemigosEliminados = 0;
    }
}

module.exports = Tanque;