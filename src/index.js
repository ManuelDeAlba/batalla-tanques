const express = require("express");
const socketIO = require("socket.io");
const app = express();

app.set("PORT", process.env.PORT || 3000);

app.use(express.static("public"));

const servidor = app.listen(app.get("PORT"), () => {
    console.log("Servidor en el puerto " + app.get("PORT"));
})

//? Lógica del juego
const Jugador = require("./clases/Jugadores/Jugador");
const io = socketIO(servidor);

const Mapa = require("./clases/Mapa");
const Bot = require("./clases/Jugadores/Bot");
const PoderMasVida = require("./clases/Poderes/PoderMasVida");
const PoderMasDano = require("./clases/Poderes/PoderMasDano");

const limiteBots = 10;

// Datos que se envian al frontend
let juego = {
    mapa: new Mapa(),
    jugadores: [],
    bots: [],
    balas: [],
    poderes: []
}

// Mueve a los jugadores y borra a los muertos
function actualizarJugadores(){
    // Se le pasa el mapa para saber donde están los límites
    juego.jugadores.forEach(jugador => jugador.mover(juego.mapa));

    // Si un jugador está muerto, se borra
    juego.jugadores = juego.jugadores.filter(jugador => jugador.vida > 0);
}

// Mueve a los bots y borra a los muertos
function actualizarBots(){
    juego.bots.forEach(bot => {
        // Se le pasa el mapa para saber donde son los límites
        bot.mover(juego.mapa);
        // Se le pasa el arreglo de las balas para agregar cuando dispare y los jugadores para detectar y disparar
        bot.comprobarDisparos(juego.balas, [...juego.jugadores, ...juego.bots]);
    });

    // Si un bot está muerto, se bora
    juego.bots = juego.bots.filter(bot => bot.vida > 0);
}

// Mueve las balas y las borra
function actualizarBalas(){
    // Mueve la bala y busca si hay colisiones
    juego.balas.forEach(bala => {
        bala.mover(juego.mapa)
        bala.comprobarColisiones([...juego.jugadores, ...juego.bots]);
    });

    // Detecta las colisiones
    juego.balas = juego.balas.filter(bala => bala.estado);
}

// Comprueba las colisiones de los poderes y los borra si ya los agarraron
function actualizarPoderes(){
    juego.poderes.forEach(poder => poder.comprobarColisiones([...juego.jugadores, ...juego.bots]))
    juego.poderes = juego.poderes.filter(poder => poder.estado);
}

function crearBot(){
    // Se le pasa el mapa para elegir un lugar aleatorio para aparecer
    if(juego.bots.length < limiteBots) juego.bots.push(new Bot(juego.mapa));
}

let iPoderes = 0;
let tiempoPoderMasVida = 5 * 60; // 5 segundos
let tiempoPoderMasDano = 5 * 60;
function crearPoderes(){
    iPoderes++;
    // Crea el poder para tener más vida
    if(iPoderes % tiempoPoderMasVida == 0) juego.poderes.push(new PoderMasVida(juego.mapa));
    if(iPoderes % tiempoPoderMasDano == 0) juego.poderes.push(new PoderMasDano(juego.mapa));
}

function enviarDatosJuego(){
    // Solo mandamos los datos de renderizado para evitar problemas al enviar cierto tipo de datos con socket.io
    io.emit("datosJuego", {
        mapa: juego.mapa,
        jugadores: juego.jugadores.map(jugador => jugador.obtenerDatosFrontend()),
        bots: juego.bots.map(bot => bot.obtenerDatosFrontend()),
        balas: juego.balas.map(bala => bala.obtenerDatosFrontend()),
        poderes: juego.poderes.map(poder => poder.obtenerDatosFrontend())
    });
}

function loop(){
    // Mover objetos
    actualizarJugadores();
    actualizarBots();
    actualizarBalas();
    actualizarPoderes();

    // Crear bots si hacen falta
    crearBot();

    // Crear poderes cada cierto tiempo
    crearPoderes();

    // Enviar los datos constantemente
    enviarDatosJuego();
}

// Intervalo del juego
let intervalo = setInterval(loop, 1000/60);

//? Funciones de eventos de socketio
function crearJugador(socket, nombre){
    // Se le pasan los datos para crear y el mapa para aparecer en un lugar aleatorio
    juego.jugadores.push(new Jugador({
        id: socket.id,
        nombre,
        mapa: juego.mapa
    }));
}

function borrarJugador(socket){
    console.log('Cliente desconectado:', socket.id);
    juego.jugadores = juego.jugadores.filter(jugador => jugador.id != socket.id);
}

function moverJugador(socket, movimiento){
    // Si no existe el jugador, no se mueve (esto evita que se mueva exactamente en el momento que muere)
    let jugador = juego.jugadores.find(jugador => jugador.id == socket.id);
    if(!jugador) return;

    jugador.actualizarTecla(movimiento);
}

function apuntarJugador(socket, coordenadas){
    // Si no existe el jugador, no se mueve (esto evita que se mueva exactamente en el momento que muere)
    let jugador = juego.jugadores.find(jugador => jugador.id == socket.id);
    if(!jugador) return;

    jugador.apuntar(coordenadas);
}

function disparar(socket, disparo){
    // Si no existe el jugador, no hace nada (esto evita que se manden disparos exactamente en el momento que muere)
    let jugador = juego.jugadores.find(jugador => jugador.id == socket.id);
    if(!jugador) return;

    // Si se presiona la tecla de disparo, intenta disparar pero primero comprueba si ya se soltó anteriormente
    // Para evitar que se deje presionada la tecla y registre muchos disparos
    // Si se suelta, se pone en false para poder volver a disparar
    if(disparo) jugador.disparar(juego.balas);
    else jugador.actualizarTecla(["espacio", false]);
}

io.on('connection', (socket) => {   
    console.log('Cliente conectado:', socket.id);

    socket.on("entrar", nombre => crearJugador(socket, nombre));

    // Movimiento de los jugadores, recibe el movimiento y lo aplica
    socket.on("mover", movimiento => moverJugador(socket, movimiento));

    // Giro del jugador con el ratón
    socket.on("apuntar", coordenadas => apuntarJugador(socket, coordenadas));

    // Disparo de jugadores, recibe si se presionó o se soltó la tecla
    socket.on("disparar", disparo => disparar(socket, disparo));

    // Borrar jugador al desconectarse (disconnect)
    socket.on("disconnect", () => borrarJugador(socket));
});