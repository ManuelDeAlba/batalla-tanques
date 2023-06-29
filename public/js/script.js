const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const socket = io();

let iniciado = false; // Evita que salga el letrero de fin de juego al cargar la página
let fin = false;

let nombre;

let jugador;
let jugadores = {};
let balas = [];
let mapa;

let camara;

function dibujarJugadores(){
    // Se crea la lista de jugadores juntando al actual y a los enemigos
    let listaJugadores = {...jugadores};
    // Si ya se creó el jugador actual, lo agrega
    if(jugador) listaJugadores[socket.id] = jugador;

    for(let i in listaJugadores){
        let {x, y, r, color, angulo, vida, nombre} = listaJugadores[i];
        
        // Circulo
        ctx.save();
        ctx.beginPath();
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.fillStyle = color;
        ctx.arc(x - camara.x, y - camara.y, r, 0, 2 * Math.PI);
        ctx.fill();
        
        // Cañon
        ctx.translate(x - camara.x, y - camara.y);
        ctx.rotate((angulo + 90) * Math.PI / 180);
        ctx.fillRect(-10, -25, 20, 10);
        ctx.restore();

        // Vida
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial"
        ctx.fillText(vida, x - camara.x, y - camara.y - r*2 - 10);

        // Nombre
        ctx.fillText(nombre, x - camara.x, y - camara.y - r*2 + 10);
    }
}

function dibujarBalas(){
    balas.forEach(({x, y, r, color}) => {
        // Circulo
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 15;
        ctx.arc(x - camara.x, y - camara.y, r, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
    })
}

function estadoJuego(){
    // Cuando ya se creó el jugador, ahora sí puede perder
    // Esto es para evitar que salga el letrero de fin de juego al abrir la página
    if(jugador) iniciado = true;

    // Si el juego ya inició y nuestro jugador no existe, perdió la partida
    if(iniciado && !jugador){
        iniciado = false;
        fin = true;

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "30px Arial";
        ctx.fillStyle = "white";
        ctx.fillText("¡Perdiste!", canvas.width / 2, canvas.height / 2);
        ctx.fillText("Click para reiniciar", canvas.width / 2, canvas.height / 2 + 30);
    }
}

function dibujarMapa(){
    // Fondo negro
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Si no ha llegado el objeto mapa desde el backend, solo deja el fondo negro
    // Si ya llegó, lo dibuja
    if(!mapa) return;

    ctx.fillStyle = mapa.color;
    ctx.fillRect(mapa.x - camara.x, mapa.y - camara.y, mapa.w, mapa.h);

    // Dibujar lineas
    ctx.save();
    ctx.shadowColor = mapa.colorLineas;
    ctx.shadowBlur = 10;
    ctx.strokeStyle = mapa.colorLineas;
    ctx.lineWidth = 2;

    // Verticales
    for(let i = mapa.x + mapa.w/10; i < mapa.x + mapa.w; i += mapa.w / 10){
        ctx.beginPath();
        ctx.moveTo(i - camara.x, mapa.y - camara.y);
        ctx.lineTo(i - camara.x, mapa.y + mapa.h - camara.y);
        ctx.stroke();
    }
    // Horizontales
    for(let i = mapa.y + mapa.h/10; i < mapa.y + mapa.h; i += mapa.h / 10){
        ctx.beginPath();
        ctx.moveTo(mapa.x - camara.x, i - camara.y);
        ctx.lineTo(mapa.x + mapa.w - camara.x, i - camara.y);
        ctx.stroke();
    }
    ctx.restore();
}

function reiniciar(){
    fin = false;
    // Aquí no se pone iniciado = true porque eso se hace hasta que se crea el jugador

    // Pedir un nuevo jugador (nueva posición, y datos)
    socket.emit("entrar", nombre);

    loop();
}

function loop(){
    if(!fin){
        // Seguir al jugador
        if(jugador) camara.seguir(jugador);

        // Dibujar fondo y el suelo del mapa
        dibujarMapa();
    
        // Dibujar a todos los objetos
        dibujarBalas();
        dibujarJugadores();
    
        // Revisa el estado del juego
        estadoJuego();
        
        requestAnimationFrame(loop);
    }
}

window.addEventListener('load', () => {
    camara = new Camara();

    // Pedir el nombre para el jugador
    nombre = prompt("Escribe tu nombre:");

    // Pedir un nuevo jugador
    socket.emit("entrar", nombre);
    
    loop();
})

//? Eventos
window.addEventListener('keydown', e => {
    // Evitar que se sigan enviando datos si ya perdió el jugador
    if(fin) return;

    if(e.code == "KeyA" || e.code == "ArrowLeft"){
        socket.emit("mover", ["iz", true]);
    }
    if(e.code == "KeyD" || e.code == "ArrowRight"){
        socket.emit("mover", ["de", true]);
    }
    if(e.code == "KeyW" || e.code == "ArrowUp"){
        socket.emit("mover", ["ad", true]);
    }
    if(e.code == "KeyS" || e.code == "ArrowDown"){
        socket.emit("mover", ["at", true]);
    }
    if(e.code == "Space"){
        socket.emit("disparar", true);
    }
})

window.addEventListener('keyup', e => {
    // Evitar que se sigan enviando datos si ya perdió el jugador
    if(fin) return;

    if(e.code == "KeyA" || e.code == "ArrowLeft"){
        socket.emit("mover", ["iz", false]);
    }
    if(e.code == "KeyD" || e.code == "ArrowRight"){
        socket.emit("mover", ["de", false]);
    }
    if(e.code == "KeyW" || e.code == "ArrowUp"){
        socket.emit("mover", ["ad", false]);
    }
    if(e.code == "KeyS" || e.code == "ArrowDown"){
        socket.emit("mover", ["at", false]);
    }
    if(e.code == "Space"){
        socket.emit("disparar", false);
    }
})

canvas.addEventListener('click', e => {
    if(fin) reiniciar();
})

//? Eventos socketio
function obtenerDatos(juego){
    mapa = juego.mapa;

    // Separar jugadores (actual y los enemigos)
    jugador = undefined;
    jugadores = {}

    for(let i in juego.jugadores){
        if(i == socket.id) jugador = juego.jugadores[i];
        else jugadores[i] = juego.jugadores[i];
    }

    balas = juego.balas;
}

socket.on("datosJuego", obtenerDatos);