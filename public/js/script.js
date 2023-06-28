const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const socket = io();

let iniciado = false; // Evita que salga el letrero de fin de juego
let fin = false;

let jugadores = {};
let balas = [];

function dibujarJugadores(){
    for(let i in jugadores){
        let {x, y, r, color, angulo, vida, nombre} = jugadores[i];
        
        // Circulo
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();

        // Cañon
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate((angulo + 90) * Math.PI / 180);
        ctx.fillRect(-10, -25, 20, 10);
        ctx.restore();

        // Vida
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.font = "20px Arial"
        ctx.fillText(vida, x, y - r*2 - 10);

        // Nombre
        ctx.fillText(nombre, x, y - r*2 + 10);
    }
}

function dibujarBalas(){
    balas.forEach(({x, y, r, color}) => {
        // Circulo
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fill();
    })
}

function estadoJuego(){
    // Cuando ya se creó el jugador, ahora sí puede perder
    // Esto es para evitar que salga el letrero de fin de juego al abrir la página
    if(jugadores[socket.id]){
        iniciado = true;
    }

    // Si el juego ya inició y nuestro jugador no existe, perdió la partida
    if(iniciado && !jugadores[socket.id]){
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

function reiniciar(){
    fin = false;
    // Aquí no se inicia el juego porque es hasta que se cree el jugador

    // Pedir un nuevo jugador (nueva posición, y datos)
    socket.emit("entrar", prompt("Escribe tu nombre:"));

    loop();
}

function loop(){
    if(!fin){
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    
        // Dibujar a todos los objetos
        dibujarJugadores();
        dibujarBalas();
    
        // Revisa el estado del juego
        estadoJuego();
        
        requestAnimationFrame(loop);
    }
}

window.addEventListener('load', () => {
    // Pedir un nuevo jugador
    socket.emit("entrar", prompt("Escribe tu nombre:"));
    
    loop();
})

// Eventos
window.addEventListener('keydown', e => {
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

// Eventos socketio
socket.on("datosJuego", juego => {
    jugadores = juego.jugadores;
    balas = juego.balas;
})