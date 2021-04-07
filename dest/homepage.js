"use strict";

let gl;
let theta = 0.0;
let thetaLoc;

let speed = 100;
let direction = true;

let vertices;
let bodyparts = [];

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

    vertices = [
        // torso
        vec2(0, 0.8),
        vec2(0, 0),

        // left leg
        vec2(-0.25, -1),
        vec2(0, 0),
        
        // right leg
        vec2(0.25, -1),
        vec2(0, 0),

        // left arm
        vec2(-0.5, 0.5),
        vec2(0, 0.5),

        // right arm
        vec2(0.5, 0.5),
        vec2(0, 0.5),

        // head
        vec2(-0.1, 0.8),
        vec2(0.1, 0.8),
        vec2(0.1, 1.0),
        vec2(-0.1, 1.0),
    ];

    canvas.addEventListener('mousedown', (event) => {
        const x = 2 * event.clientX / canvas.width - 1;
        const y = 2 * (canvas.height - event.clientY) / canvas.height - 1;

        const scalingFactor = document.getElementById('scaling-factor').value;
        const side = document.getElementById('side').value === 'Right' ? 1 : -1;

        switch (document.getElementById('bodypart').value) {
            case 'Arm':
                vertices.push(vec2(x, y));
                vertices.push(vec2(x+0.1*scalingFactor*side, y));
                vertices.push(vec2(x+0.1*scalingFactor*side, y+0.08*scalingFactor));
                vertices.push(vec2(x+0.11*scalingFactor*side, y+0.08*scalingFactor));
                vertices.push(vec2(x+0.11*scalingFactor*side, y+0.1*scalingFactor));
                vertices.push(vec2(x+0.09*scalingFactor*side, y+0.1*scalingFactor));
                vertices.push(vec2(x+0.09*scalingFactor*side, y+0.02*scalingFactor));
                vertices.push(vec2(x, y+0.02*scalingFactor));

                bodyparts.push([gl.LINE_LOOP, 8]);
                break;

            case 'Leg':
                vertices.push(vec2(x, y));
                vertices.push(vec2(x+0.1, y));
                vertices.push(vec2(x+0.1, y+0.2));
                vertices.push(vec2(x, y+0.2));

                bodyparts.push([gl.LINE_LOOP, 4]);
                break;
        }

        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    });

    // remove the last bodypart
    document.getElementById('undo').onclick = () => {
        if (bodyparts.length > 0) {
            const numberOfVertices = bodyparts[bodyparts.length-1][1];
            vertices.splice(vertices.length-numberOfVertices, numberOfVertices);
            bodyparts.pop();
        }
    };

    // load the data into the GPU
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'aPosition');
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);
    thetaLoc = gl.getUniformLocation(program, 'uTheta');

    render();
};

const render = () => {
    gl.clear(gl.COLOR_BUFFER_BIT);

    // render stick figure
    gl.drawArrays(gl.LINE_STRIP, 0, 2);
    gl.drawArrays(gl.LINE_STRIP, 2, 2);
    gl.drawArrays(gl.LINE_STRIP, 4, 2);
    gl.drawArrays(gl.LINE_STRIP, 6, 2);
    gl.drawArrays(gl.LINE_STRIP, 8, 2);
    gl.drawArrays(gl.LINE_LOOP, 10, 4);

    // render body parts
    if (bodyparts.length > 0) {
        let vertexIndex = 14;
        let bodypartIndex = 0;
        while (true) {
            try {
                gl.drawArrays(bodyparts[bodypartIndex][0], vertexIndex, bodyparts[bodypartIndex][1]);
                vertexIndex += bodyparts[bodypartIndex][1];
                bodypartIndex++;
            } catch (e) {
                break;
            }
        }
    }
    
    setTimeout(() => requestAnimationFrame(render), speed);
}
