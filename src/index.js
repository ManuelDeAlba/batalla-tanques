const express = require("express");
const socketIO = require("socket.io");
const app = express();

app.set("PORT", process.env.PORT || 3000);

app.use(express.static("public"));

const servidor = app.listen(app.get("PORT"), () => {
    console.log("Servidor en el puerto " + app.get("PORT"));
})

//? Lógica del juego
const Jugador = require("./clases/Jugador");
const io = socketIO(servidor);

const Mapa = require("./clases/Mapa");

// Datos que se envian al frontend
let juego = {
    mapa: new Mapa(),
    jugadores: {},
    balas: []
}

// Mueve a los jugadores y borra a los muertos
function actualizarJugadores(){
    for(let i in juego.jugadores){
        juego.jugadores[i].mover(juego.mapa);

        // Si un jugador está muerto se borra
        if(juego.jugadores[i].vida <= 0){
            delete juego.jugadores[i];
        }
    }
}

// Mueve las balas y las borra
function actualizarBalas(){
    juego.balas.forEach(bala => bala.mover(juego.jugadores, juego.mapa));
    juego.balas = juego.balas.filter(bala => bala.estado);
}

function loop(){
    // Mover objetos
    actualizarJugadores();
    actualizarBalas();

    // Enviar los datos constantemente
    io.emit("datosJuego", juego);
}

// Intervalo del juego
let intervalo = setInterval(loop, 1000/60);

function crearJugador(socket, nombre){
    juego.jugadores[socket.id] = new Jugador(socket.id, nombre, juego.mapa);
}

function borrarJugador(socket){
    console.log('Cliente desconectado:', socket.id);
    delete juego.jugadores[socket.id];
}

function moverJugador(socket, movimiento){
    juego.jugadores[socket.id].actualizarTecla(movimiento);
}

function disparar(socket, disparo){
    // Si no existe el jugador, no hace nada (esto evita que se manden disparos exactamente en el momento que muere)
    if(!juego.jugadores[socket.id]) return;

    // Si se presiona la tecla de disparo, intenta disparar pero primero comprueba si ya se soltó anteriormente
    // Para evitar que se deje presionada la tecla y registre muchos disparos
    // Si se suelta, se pone en false para poder volver a disparar

    if(disparo) juego.jugadores[socket.id].disparar(juego.balas);
    else juego.jugadores[socket.id].actualizarTecla(["espacio", false]);
}

io.on('connection', (socket) => {   
    console.log('Cliente conectado:', socket.id);

    socket.on("entrar", nombre => crearJugador(socket, nombre));

    // Movimiento de los jugadores, recibe el movimiento y lo aplica
    socket.on("mover", movimiento => moverJugador(socket, movimiento));

    // Disparo de jugadores, recibe si se presionó o se soltó la tecla
    socket.on("disparar", disparo => disparar(socket, disparo));

    // Borrar jugador al desconectarse (disconnect)
    socket.on("disconnect", () => borrarJugador(socket));
});