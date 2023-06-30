function degToRad(deg){
    return deg * Math.PI / 180;
}

function radToDeg(rad){
    return rad * 180 / Math.PI;
}

module.exports = {
    degToRad,
    radToDeg
}