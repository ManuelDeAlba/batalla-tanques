const { degToRad } = require("../utils");
const Bala = require("./Bala");

class Jugador{
    constructor(id, nombre, mapa){
        this.id = id;
        this.nombre = nombre;

        this.x = mapa.x + Math.random() * mapa.w;
        this.y = mapa.y + Math.random() * mapa.h;
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
    actualizarTecla([direccion, estado]){
        this.teclas[direccion] = estado;
    }
    mover(){
        // Giros
        if(this.teclas.iz) this.angulo -= this.velAngulo;
        if(this.teclas.de) this.angulo += this.velAngulo;
        
        // Movimiento hacia adelante o atrás
        if(this.teclas.ad){
            this.x += Math.cos(degToRad(this.angulo)) * this.vel;
            this.y += Math.sin(degToRad(this.angulo)) * this.vel;
        }
        if(this.teclas.at){
            this.x -= Math.cos(degToRad(this.angulo)) * this.vel;
            this.y -= Math.sin(degToRad(this.angulo)) * this.vel;
        }
    }
    disparar(balas){
        // Crea una bala solo si acaba de presionar el boton (evita que salgan muchas si deja apretada la tecla)
        if(!this.teclas.espacio){
            // Se bloquea el disparo hasta que se suelte la tecla
            this.teclas.espacio = true;

            // Crea la bala en la posición del jugador
            balas.push(new Bala({
                id_jugador: this.id, // Para no contar la colisión con el que disparó
                x: this.x + Math.cos(degToRad(this.angulo)) * this.r * 1.5,
                y: this.y + Math.sin(degToRad(this.angulo)) * this.r * 1.5,
                angulo: degToRad(this.angulo),
                color: this.color
            }));
        }
    }
}

module.exports = Jugador;