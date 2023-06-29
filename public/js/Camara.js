class Camara{
    constructor(){
        this.x = 0;
        this.y = 0;
        this.w = canvas.width;
        this.h = canvas.height;
    }
    seguir(objeto){
        this.x = objeto.x - this.w / 2;
        this.y = objeto.y - this.h / 2;
    }
}