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

let juego = {
    jugadores: {},
    balas: []
}

function actualizarJugadores(){
    for(let i in juego.jugadores){
        juego.jugadores[i].mover();
        if(juego.jugadores[i].vida <= 0){
            delete juego.jugadores[i];
        }
    }
}

function actualizarBalas(){
    juego.balas.forEach(bala => bala.mover(juego.jugadores));
    juego.balas = juego.balas.filter(bala => bala.estado);
}

function loop(){
    // Mover objetos
    actualizarJugadores();
    actualizarBalas();

    // Enviar los datos
    io.emit("datosJuego", juego);
}

// Intervalo del juego
let intervalo = setInterval(loop, 1000/60);

io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    
    socket.on("entrar", (nombre) => {
        // Crear jugador
        juego.jugadores[socket.id] = new Jugador(socket.id, nombre);
    })

    // Movimiento de los jugadores
    socket.on("mover", movimiento => {
        juego.jugadores[socket.id].actualizarTeclas(movimiento);
    })

    // Disparo de jugadores
    socket.on("disparar", disparo => {
        // Si se presiona la tecla de disparo, intenta disparar pero primero comprueba si ya se soltó anteriormente
        // Para evitar que se deje presionada la tecla y registre muchos disparos
        // Si se suelta, se pone en false para poder volver a disparar
        if(disparo) juego.jugadores[socket.id].disparar(juego.balas);
        else juego.jugadores[socket.id].actualizarTeclas(["espacio", false]);
    })

    // Borrar jugador al desconectarse (disconnect)
    socket.on("disconnect", () => {
        console.log('Cliente desconectado:', socket.id);
        delete juego.jugadores[socket.id];
    })

    // Enviar datos en los diferentes eventos recibidos desde el cliente
});