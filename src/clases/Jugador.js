const { anguloARadianes } = require("../utils");
const Bala = require("./Bala");

class Jugador{
    constructor(id, nombre){
        this.id = id;
        this.nombre = nombre;
        this.x = Math.random() * 500;
        this.y = Math.random() * 500;
        this.r = 20;
        this.color = `hsl(${Math.floor(Math.random()*361)}, 100%, 50%)`;
        this.vel = 5;
        this.angulo = 0;
        this.velAngulo = 5;

        this.vida = 10;

        this.teclas = {
            iz: false,
            de: false,
            ad: false,
            at: false
        }
    }
    actualizarTeclas([direccion, estado]){
        this.teclas[direccion] = estado;
    }
    mover(){
        // Giros
        if(this.teclas.iz) this.angulo -= this.velAngulo;
        if(this.teclas.de) this.angulo += this.velAngulo;
        
        // Suponemos que siempre camina hacia adelante
        if(this.teclas.ad){
            this.x += Math.cos(anguloARadianes(this.angulo)) * this.vel;
            this.y += Math.sin(anguloARadianes(this.angulo)) * this.vel;
        }
        if(this.teclas.at){
            this.x -= Math.cos(anguloARadianes(this.angulo)) * this.vel;
            this.y -= Math.sin(anguloARadianes(this.angulo)) * this.vel;
        }
    }
    disparar(balas){
        // Crea balas
        if(!this.teclas.espacio){
            this.teclas.espacio = true;

            balas.push(new Bala({
                x: this.x + Math.cos(anguloARadianes(this.angulo)) * this.r,
                y: this.y + Math.sin(anguloARadianes(this.angulo)) * this.r,
                angulo: anguloARadianes(this.angulo),
                color: this.color,
                id_jugador: this.id
            }));
        }
    }
}

module.exports = Jugador;