const { degToRad, enteroAleatorio } = require("../../utils");
const Tanque = require("./Tanque");
const Bala = require("./Bala");

class Jugador extends Tanque{
    constructor(id, nombre, mapa){
        super(mapa);
        this.id = id;
        this.nombre = nombre;

        this.color = `hsl(${enteroAleatorio(0, 360)}, 100%, 50%)`;

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
    mover(mapa){
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

        // Evitar que se salga por los bordes del mapa
        if(this.x - this.r < mapa.x) this.x = mapa.x + this.r;
        if(this.x + this.r > mapa.x + mapa.w) this.x = mapa.x + mapa.w - this.r;
        if(this.y - this.r < mapa.y) this.y = mapa.y + this.r;
        if(this.y + this.r > mapa.y + mapa.h) this.y = mapa.y + mapa.h - this.r;
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
                dano: this.dano,
                angulo: degToRad(this.angulo),
                color: this.color
            }));
        }
    }
}

module.exports = Jugador;