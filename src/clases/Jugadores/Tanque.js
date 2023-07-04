const { enteroAleatorio, convertirAGrados } = require("../../utils");

class Tanque{
    constructor({
        mapa,
        id,
        nombre,
        color
    }){
        this.id = id;
        this.nombre = nombre;
        this.color = color;

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

        this.poderesActivos = [];
    }
    obtenerDireccionGiroOptima(anguloFinal){
        let anguloIzquierda = this.angulo;
        let anguloDerecha = this.angulo;

        let direccion = 0;
        while(!direccion){
            // Con estas funciones se pasa al rango de [0 - 359] circularmente
            anguloDerecha = convertirAGrados(anguloDerecha + this.velAngulo);
            anguloIzquierda = convertirAGrados(anguloIzquierda - this.velAngulo);

            // Si llegó primero por la derecha la dirección es 1
            if(convertirAGrados(anguloDerecha - anguloFinal) < this.velAngulo){
                direccion = 1;
                break;
            }

            // Si llegó primero por la derecha la dirección es -1
            if(convertirAGrados(anguloIzquierda - anguloFinal) < this.velAngulo){
                direccion = -1;
                break;
            }
        }

        return direccion;
    }
    obtenerDatosFrontend(){
        return {
            id: this.id,
            nombre: this.nombre,
            color: this.color,
            x: this.x,
            y: this.y,
            r: this.r,
            angulo: this.angulo,
            vida: this.vida,
            enemigosEliminados: this.enemigosEliminados
        }
    }
}

module.exports = Tanque;