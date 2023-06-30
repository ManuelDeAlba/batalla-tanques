function degToRad(deg){
    return deg * Math.PI / 180;
}

function radToDeg(rad){
    return rad * 180 / Math.PI;
}

// Los dos límites están incluidos
function enteroAleatorio(min, max){
    return min + Math.floor(Math.random() * (max - min + 1));
}

module.exports = {
    degToRad,
    radToDeg,
    enteroAleatorio
}