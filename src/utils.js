function degToRad(deg){
    return deg * Math.PI / 180;
}

function radToDeg(rad){
    return rad * 180 / Math.PI;
}

function convertirAGrados(num){
    let numero = num % 360;
    if(numero >= 0) return Math.abs(numero); // Math abs para evitar el -0 (arreglo visual)
    if(numero < 0) return 360 + numero;
}

// Los dos límites están incluidos
function enteroAleatorio(min, max){
    return min + Math.floor(Math.random() * (max - min + 1));
}

module.exports = {
    degToRad,
    radToDeg,
    convertirAGrados,
    enteroAleatorio
}