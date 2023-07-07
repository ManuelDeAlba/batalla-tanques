const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const socket = io();

let iniciado = false; // Evita que salga el letrero de fin de juego al cargar la página
let fin = false;

let nombre;
let puntaje = 0;

let jugador;
let jugadores = [];
let balas = [];
let explosiones = [];
let bots = [];
let poderes = [];
let mapa;

let camara;

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

    let distanciaCoordenadas = 100;

    // Verticales
    for(let i = mapa.x + distanciaCoordenadas; i < mapa.x + mapa.w; i += distanciaCoordenadas){
        ctx.beginPath();
        ctx.moveTo(i - camara.x, mapa.y - camara.y);
        ctx.lineTo(i - camara.x, mapa.y + mapa.h - camara.y);
        ctx.stroke();
    }
    // Horizontales
    for(let i = mapa.y + distanciaCoordenadas; i < mapa.y + mapa.h; i += distanciaCoordenadas){
        ctx.beginPath();
        ctx.moveTo(mapa.x - camara.x, i - camara.y);
        ctx.lineTo(mapa.x + mapa.w - camara.x, i - camara.y);
        ctx.stroke();
    }
    ctx.restore();

    // Dibujar coordenadas
    ctx.save();
    ctx.font = "15px Arial";
    ctx.fillStyle = "#fff";
    // Coordenadas eje x
    for(let x = mapa.x; x <= mapa.x + mapa.w; x += distanciaCoordenadas){
        ctx.fillText(x, x - camara.x, 10);
    }
    // Coordenadas eje y
    ctx.textAlign = "left";
    for(let y = mapa.y; y <= mapa.y + mapa.h; y += distanciaCoordenadas){
        ctx.fillText(y, 0, y - camara.y);
    }
    ctx.restore();
}

function dibujarPoderes(){
    poderes.forEach(({x, y, r, color}) => {
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

function dibujarJugadores(){
    // Se crea la lista de jugadores juntando al actual y a los enemigos
    let listaJugadores = [...jugadores, ...bots];
    // Si ya se creó el jugador actual, lo agrega
    if(jugador) listaJugadores.push(jugador);

    listaJugadores.forEach(({x, y, r, color, angulo, vida, nombre}) => {
        ctx.save();
        // Circulo
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
    })
}

function dibujarExplosiones(){
    explosiones.forEach(({x, y, r, color}) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x - camara.x, y - camara.y, r, 0, 2 * Math.PI);
        ctx.fill();
    })
}

function dibujarPuntajes(){
    // Se actualiza el puntaje del jugador por si deja de existir, guardarlo y tener forma de mostrarlo
    if(jugador) puntaje = jugador.enemigosEliminados;

    ctx.save();
    // Lista de puntajes
    ctx.fillStyle = "rgba(0, 0, 0, .3)";
    ctx.fillRect(40, 20, 100, 165);

    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.font = "15px Arial";

    ctx.fillText(`${nombre.substr(0, 7)}: ${jugador?.enemigosEliminados || puntaje}`, 50, 35);

    // Nombres de los enemigos
    let enemigos = [...jugadores, ...bots];
    enemigos = enemigos.toSorted((a, b) => b.enemigosEliminados - a.enemigosEliminados)
    
    for(let i = 0; i < 9; i++){
        let enemigo = enemigos[i];
        if(enemigo) ctx.fillText(`${enemigo.nombre}: ${enemigo.enemigosEliminados}`, 50, 35 + 15 * (i+1));
    }
    ctx.restore();
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
        ctx.fillText("¡Perdiste!", canvas.width / 2, canvas.height / 2 - 35);
        ctx.fillText(`Enemigos eliminados: ${puntaje}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText("Click para reiniciar", canvas.width / 2, canvas.height / 2 + 35);
    }
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
        dibujarPoderes();
        dibujarBalas();
        dibujarJugadores();
        dibujarExplosiones();

        // Dibuja el puntaje del jugador
        dibujarPuntajes();
    
        // Revisa el estado del juego
        estadoJuego();
        
        requestAnimationFrame(loop);
    }
}

window.addEventListener('load', () => {
    camara = new Camara();

    // Pedir el nombre para el jugador
    nombre = prompt("Escribe tu nombre:") || "Anónimo";

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

window.addEventListener('mousemove', e => {
    if(!iniciado) return;

    let x = e.clientX - canvas.getBoundingClientRect().left + camara.x;
    let y = e.clientY - canvas.getBoundingClientRect().top + camara.y;
    
    socket.emit("apuntar", {x, y});
})
window.addEventListener("mousedown", e => {
    socket.emit("disparar", true);
})
window.addEventListener("mouseup", e => {
    socket.emit("disparar", false);
})

canvas.addEventListener('click', e => {
    if(fin) reiniciar();
})

//? Eventos socketio
function obtenerDatos(juego){
    mapa = juego.mapa;

    // Separar jugadores (actual y los enemigos)
    jugador = undefined;
    jugadores = [];

    juego.jugadores.forEach(j => {
        if(j.id == socket.id) jugador = j;
        else jugadores.push(j);
    })

    balas = juego.balas;
    explosiones = juego.explosiones;
    bots = juego.bots;
    poderes = juego.poderes;
}

socket.on("datosJuego", obtenerDatos);