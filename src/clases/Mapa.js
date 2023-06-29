class Mapa{
    constructor(){
        this.w = 500 * 4;
        this.h = 500 * 4;
        this.x = -this.w / 2;
        this.y = -this.h / 2;
        this.color = "#804000";
        this.colorLineas = "gray";
    }
    estaFuera(objeto){
        return objeto.x + objeto.r < this.x || objeto.x - objeto.r > this.x + this.w ||
                objeto.y + objeto.r < this.y || objeto.y - objeto.r > this.y + this.h;
    }
}

module.exports = Mapa;