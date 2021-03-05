"use strict";

let gl;
let theta = 0.0;
let thetaLoc;

let speed = 100;
let direction = true;

const init = window.onload = () => {
    const canvas = document.getElementById('gl-canvas');

    gl = canvas.getContext('webgl2');
    if (!gl) {
        alert("WebGL 2.0 isn't available");
    }

    // configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);  // set default colour to white

    const program = initShaders(gl, 'vertex-shader', 'fragment-shader');
    gl.useProgram(program);

    const vertices = [
        vec2(0, 1),
        vec2(-1, 0),
        vec2(1, 0),
        vec2(0, -1)
    ];

    // load the data into the GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    thetaLoc = gl.getUniformLocation(program, 'uTheta');

    document.getElementById('slider').onchange = (event) => speed = 100 - event.target.value;
    document.getElementById('Direction').onclick = (event) => direction = !direction;

    document.getElementById('Controls').onclick = (event) => {
        switch(event.target.index) {
            case 0:
                direction = !direction;
                break;

            case 1:
                speed /= 2.0;
                break;

            case 2:
                speed *= 2.0;
                break;
        }
    };

    window.onkeydown = (event) => {
        const key = String.fromCharCode(event.keyCode);

        switch (key) {
            case '1':
                direction = !direction;
                break;

            case '2':
                speed /= 2.0;
                break;

            case '3':
                speed *= 2.0;
                break;
        }
    };

    render();
};

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    theta += direction ? 0.1 : -0.1;
    gl.uniform1f(thetaLoc, theta);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    setTimeout(() => requestAnimationFrame(render), speed);
};
