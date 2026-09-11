//Cedric Santana Nabuco 163659
//Atividade feita com auxilio de inteligência artificial

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl2");

if (!gl) {
    throw new Error("WebGL 2 não é suportado.");
}

// --------------------------------------------------
// VERTICES E CORES
// --------------------------------------------------

function verticesBarra(){
    return new Float32Array([
        -0.05,  0.2,
        -0.05, -0.2,
         0.05,  0.2,
         0.05,  0.2,
        -0.05, -0.2,
         0.05, -0.2
    ]);
}

function verticesBola(){
    let vertices = [];
    let numSegments = 30;
    let radius = 0.05;

    for (let i = 0; i < numSegments; i++) {
        let theta1 = (i / numSegments) * 2 * Math.PI;
        let theta2 = ((i + 1) / numSegments) * 2 * Math.PI;

        vertices.push(0, 0); // Center of the circle
        vertices.push(radius * Math.cos(theta1), radius * Math.sin(theta1));
        vertices.push(radius * Math.cos(theta2), radius * Math.sin(theta2));
    }

    return new Float32Array(vertices);
}

let verticesBarraDireita = verticesBarra();

let corBarraDireita = new Float32Array([
    0.0, 0.0, 1.0,
]);

let verticesBarraEsquerda = verticesBarra();

let corBarraEsquerda = new Float32Array([
    0.0, 1.0, 0.0,
]);

let verticesBolaCentro = verticesBola();

let corBolaCentro = new Float32Array([
    1.0, 0.0, 0.0,
]);

// --------------------------------------------------
// TRANSFORMAÇÕES
// --------------------------------------------------

let MbarraEsquerda = m3.translation(-0.9, 0.0);

let MbarraDireita = m3.translation(0.9, 0.0);

let MbolaCentro = m3.identity();

// --------------------------------------------------
// BUFFER
// --------------------------------------------------

const verticesBuffer = gl.createBuffer();

// --------------------------------------------------
// VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource = `#version 300 es

in vec2 aPosition;

uniform mat3 u_transform;

out vec3 vColor;

void main() {
    vec3 position = u_transform * vec3(aPosition, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
}

`;


// --------------------------------------------------
// FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource = `#version 300 es

precision mediump float;

uniform vec3 uColor;

out vec4 outColor;

void main() {
    outColor = vec4(uColor, 1.0);
}

`;


// --------------------------------------------------
// COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    vertexShaderSource
);

const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);


// --------------------------------------------------
// CRIAR PROGRAMA
// --------------------------------------------------

const program = gl.createProgram();

gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);

gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {

    throw new Error(
        gl.getProgramInfoLog(program)
    );
}


// --------------------------------------------------
// LOCAL DOS ATRIBUTOS E DO UNIFORM
// --------------------------------------------------

const positionLocation =
    gl.getAttribLocation(
        program,
        "aPosition"
    );

const colorLocation =
    gl.getUniformLocation(
        program,
        "uColor"
    );

const transformLocation =
    gl.getUniformLocation(
        program,
        "u_transform"
    );

// --------------------------------------------------
// LIMPAR TELA
// --------------------------------------------------

gl.clearColor(0.1, 0.1, 0.1, 1.0);

gl.clear(gl.COLOR_BUFFER_BIT);


// --------------------------------------------------
// DESENHAR
// --------------------------------------------------

const numComponents = 2;

function drawScene(){
    
    atualizaAnimacao();

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    drawBarraEsquerda();
    drawBarraDireita();
    drawBolaCentro();
    
    requestAnimationFrame(drawScene);
}

function drawBarraEsquerda(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraEsquerda,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraEsquerda
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraEsquerda
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraEsquerda.length / numComponents
    );

}

function drawBarraDireita(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBarraDireita,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBarraDireita
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbarraDireita
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBarraDireita.length / numComponents
    );

}

function drawBolaCentro(){

    gl.bindBuffer(gl.ARRAY_BUFFER, verticesBuffer);

    gl.bufferData(
        gl.ARRAY_BUFFER,
        verticesBolaCentro,
        gl.STATIC_DRAW
    );

    gl.enableVertexAttribArray(positionLocation);

    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform3fv(
        colorLocation,
        corBolaCentro
    );

    gl.uniformMatrix3fv(
        transformLocation,
        false,
        MbolaCentro
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        verticesBolaCentro.length / numComponents
    );

}

// --------------------------------------------------
// CONTROLE DO TECLADO
// --------------------------------------------------

let teclas = {};

window.addEventListener("keydown", (e) => {
    teclas[e.key] = true;
});

window.addEventListener("keyup", (e) => {
    teclas[e.key] = false;
});


// --------------------------------------------------
// PLACAR
// --------------------------------------------------

const placarElement = document.getElementById("placar");

function atualizaPlacar(){
    placarElement.textContent = `${pontosEsquerda} - ${pontosDireita}`;
}

// --------------------------------------------------
// PARÂMETROS ANIMAÇÃO
// --------------------------------------------------

let tyBE = 0.0;
let tyBD = 0.0;
let txBE_offset = 0.01;
let txBD_offset = 0.01;
let txBola = 0.0;
let tyBola = 0.0;
let txBola_offset = 0.005;
let tyBola_offset = 0.005;
let velocidadeBarra = 0.02;
let limiteBarra = 0.8; // metade da altura do canvas (1.0) menos metade da barra (0.2)

const raioBola = 0.05;
const meiaAlturaBarra = 0.2;
const meiaLarguraBarra = 0.05;

let pontosEsquerda = 0;
let pontosDireita = 0;

function resetBola(direcao){
    txBola = 0.0;
    tyBola = 0.0;
    txBola_offset = 0.005 * direcao;
    tyBola_offset = (Math.random() < 0.5 ? 1 : -1) * 0.005;
}


function atualizaAnimacao(){

    // Barra esquerda: W (cima) / S (baixo)
    if (teclas["w"] || teclas["W"])
        tyBE += velocidadeBarra;
    if (teclas["s"] || teclas["S"])
        tyBE -= velocidadeBarra;

    // Barra direita: setas
    if (teclas["ArrowUp"])
        tyBD += velocidadeBarra;
    if (teclas["ArrowDown"])
        tyBD -= velocidadeBarra;

    // Limita para não sair da tela
    tyBE = Math.min(limiteBarra, Math.max(-limiteBarra, tyBE));
    tyBD = Math.min(limiteBarra, Math.max(-limiteBarra, tyBD));

    MbarraEsquerda = m3.translation(-0.9, tyBE);
    MbarraDireita = m3.translation(0.9, tyBD);


    txBola += txBola_offset;

      // Colisão com a barra esquerda
    if (
        txBola - raioBola <= -0.9 + meiaLarguraBarra &&
        txBola > -0.9 &&
        tyBola > tyBE - meiaAlturaBarra &&
        tyBola < tyBE + meiaAlturaBarra
    ) {
        txBola_offset = Math.abs(txBola_offset);
    }

    if (
        txBola + raioBola >= 0.9 - meiaLarguraBarra &&
        txBola < 0.9 &&
        tyBola > tyBD - meiaAlturaBarra &&
        tyBola < tyBD + meiaAlturaBarra
    ) {
        txBola_offset = -Math.abs(txBola_offset);
    }

    tyBola += tyBola_offset;
    if(tyBola > 1.0 || tyBola<-1.0)
        tyBola_offset = -tyBola_offset;

    MbolaCentro = m3.translation(txBola,tyBola);

       // Ponto para a direita (bola saiu pela esquerda)
    if (txBola < -1.0) {
        pontosDireita++;
        resetBola(1);
        atualizaPlacar();
    }

    // Ponto para a esquerda (bola saiu pela direita)
    if (txBola > 1.0) {
        pontosEsquerda++;
        resetBola(-1);
        atualizaPlacar();
    }

}



// --------------------------------------------------
// INÍCIO DO DESENHO
// --------------------------------------------------

drawScene();

