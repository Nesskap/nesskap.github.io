/* import './style.css' */

// Initialize an object which will contain the main setup for the program
let three = { canvas: null, camera: null, scene: null, renderer: null, controls: null }
const clock = new THREE.Clock();
let cube = null;

//Resize the render
let sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize',() => 
    {
        //Update sizes
        sizes.width = innerWidth;
        sizes.height = innerHeight;

        //Update Camera
        three.camera.aspect = sizes.width / sizes.height;
        three.camera.updateProjectionMatrix()

        //Update Renderer
        three.renderer.setSize(sizes.width,sizes.height)
        three.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    })

// Function in which three's objects are initialized
// We create a camera, a scene and a renderer.
function initThree() {
    // -- START MINUMIN SETUP
    // Set up the camera values to be used
    let fov = 75, // This are degrees
        ratio = sizes.width / sizes.height, // The ratio is determined by the canvas size
        nearPlane = 0.01, // The minimum distance and object has to be at to be seen
        farPlane = 100; // The furthest distance an object can be at in order to be seen
    // Initialize the camera
    three.camera = new THREE.PerspectiveCamera(fov, ratio, nearPlane, farPlane);
    //Camera position
    three.camera.position.set(0,0,19)
    // Rotate the camera to be facing towards positive XYZ
    three.camera.rotation.set(0, 0 , 0)

    // Initialize the scene
    three.scene = new THREE.Scene();
    three.scene.fog = new THREE.Fog(0x000000,5,25)

    // Initialize the renderer and attatch our canvas to it
    three.renderer = new THREE.WebGLRenderer({ canvas: three.canvas, antialias: true });
    // Set the renderer's size, this means the canvas size on screen; this will resize the canvas to half the size of the screen
    three.renderer.setSize(window.innerWidth, window.innerHeight);

    // Add all objects to the scene
    // Everything that influences the scene has to be added to it in order to be rendered on screen
    three.scene.add(three.camera);

    // Add the first person controls to move the camera around
    three.controls = new THREE.PointerLockControls(three.camera, three.canvas);
    // Adds a listener to when the canvas element has been clicked.
    // Once clicked the controls are locked and can be used. To escape the controls just press ESC
    three.canvas.addEventListener('click', function () {
        three.controls.lock();
    })
    
    // -- END MINIMUM SETUP

    // Just display a cube and see it
    const mat = new THREE.MeshLambertMaterial()
    mat.roughness = 0

    cube = new THREE.Mesh(new THREE.BoxBufferGeometry(1,1,1), mat);

    cube.position.set(0, 0, 3);
    three.scene.add(cube);

    const rect = new THREE.Mesh(new THREE.BoxGeometry(1,3,1),
        mat)
    rect.position.set(0,0,-10)
    three.scene.add(rect)

    // Add a light to see the box
    let light = new THREE.AmbientLight(0xFFFFFF, 0.5);
    light.position.set(0,1,0)
    three.scene.add(light);

    // const pointLight = new THREE.PointLight(0xffffff, 2)
    // pointLight.position.set(2,3,4)
    // three.scene.add(pointLight)


}

// The code inside will run once the HTML's body has finished loading
$(document).ready(
    () => {
        // Get the canvas element
        three.canvas = document.querySelector('.myCanvas');

        // Check if the canvas element is not null, if it is then the current browser does not support HTML5
        if (three.canvas) {
            // Initialize three's object to a working state
            initThree();

            // Create the scene
            walkway();

            //Control Movement
            listen();

            // Call the update function to render every frame
            update();
        }
        else {
            // Just displays the message in the console
            console.log("Browser does not support HTML5");
        }
    }
)

// Function to create the walkway
function walkway() {
    let geo = new THREE.PlaneGeometry(10, 50),
        // A transparent floor with an opacity of 0.5
        // The transparent property must be set to true in order apply opacity
        mat = new THREE.MeshLambertMaterial({ color: 0x000000, side: THREE.DoubleSide, transparent: true, opacity: 0.5, emissive: 0xff0000}),
        mesh = new THREE.Mesh(geo, mat);
    // Planes are always positioned verticaly we have to rotate it 90 degrees on Z
    mesh.rotation.x = Math.PI / 2;
    mesh.position.y = -2;
    three.scene.add(mesh);

    // A new material must be created. If the current material is modified it will affect all other related geometries
    geo = new THREE.SphereGeometry(20, 20, 20);
    mat = new THREE.MeshLambertMaterial({ color: 0x0000ff, side: THREE.BackSide, transparent: true, opacity: 0.5 });
    mesh = new THREE.Mesh(geo, mat);
    three.scene.add(mesh);
}

//Controls
moveSpeed = 0.07;
isMoving = false;
isForward = false;
isBackward = false;
isLeft = false;
isRight = false;
distanceBounds = [ 0.01, 0.5 ];

function onKeyDown(event) {
    switch ((String.fromCharCode(event.which)).toUpperCase()) {
        case 'W':
        case 'ArrowUp':
            isMoving = true;
            isForward = true;
            break;
        case 'S':
        case 'ArrowDown':
            isMoving = true;
            isBackward = true;
            break;
        case 'A':
        case 'ArrowLeft':
            isMoving = true;
            isLeft = true;
            break
        case 'D':
        case 'ArrowRight':
            isMoving = true;
            isRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch ((String.fromCharCode(event.which)).toUpperCase()) {
        case 'W':
        case 'ArrowUp':
            isForward = false;
            break;
        case 'S':
        case 'ArrowDown':
            isBackward = false;
            break;
        case 'A':
        case 'ArrowLeft':
            isLeft = false;
            break;
        case 'D':
        case 'ArrowRight':
            isRight = false;
            break;
    }
    if (!isForward && !isBackward && !isLeft && !isRight)
        isMoving = false;
}

function listen() {
    window.addEventListener('keydown', (event) => onKeyDown(event), false);
    window.addEventListener('keyup', (event) => onKeyUp(event), false);
}

function move() {  

    let rays = [];
    let pos = three.controls.getObject().position,
        dir = three.controls.getDirection(new THREE.Vector3).clone();

    //Create rays around player
    for (let i = 0; i < 8; i++) {
        rays.push(
            new THREE.Raycaster(new THREE.Vector3(pos.x, 0, pos.z),
                new THREE.Vector3(
                    dir.x * Math.cos(-Math.PI / 4 * i) - dir.z * Math.sin(-Math.PI / 4 * i),
                    0,
                    dir.x * Math.sin(-Math.PI / 4 * i) + dir.z * Math.cos(-Math.PI / 4 * i)
                ), //BACK/FRONT WORK others don't
                distanceBounds[0],
                distanceBounds[1])
        );
    }

    //Check for intersection
    for (let i = 0; i < rays.length; i++) {
        let intersects = rays[i].intersectObjects(three.scene.children, true);
            
        //Check direction
        if (intersects.length > 0) {

            if (intersects[0].distance <= 0.3)
                if (isMoving) {
                    //Front
                    if (i == 0) {
                        //console.log(rays);
                        console.log('front');
                        isForward = false;
                    }
                    //Front-Left
                    if (i == 1) {
                        console.log('front-left');
                        isForward = false;
                        isLeft = false;
                    }
                    //Left
                    if (i == 2) {
                        console.log('left');
                        isLeft = false;
                    }
                    //Back-Left
                    if (i == 3) {
                        console.log('back-left');
                        isBackward = false;
                        isLeft = false;
                    }
                    //Back
                    if (i == 4) {
                        console.log('back');
                        isBackward = false;
                    }
                    //Back-Right
                    if (i == 5) {
                        console.log('back-left');
                        isBackward = false;
                        isRight = false;
                    }
                    //Right
                    if (i == 6) {
                        console.log('right');
                        isRight = false;
                    }
                    ////Front-right
                    if (i == 7) {
                        console.log('front-right');
                        isForward = false;
                        isRight = false;
                    }
                }
        }
    }

    if (isMoving) {
        if (isForward) {
            three.controls.moveForward(moveSpeed);
        }
        if (isBackward) {
            three.controls.moveForward(-moveSpeed);
        }
        if (isRight) {
            three.controls.moveRight(moveSpeed / 2);
        }
        if (isLeft) {
            three.controls.moveRight(-moveSpeed / 2);
        }
        three.camera.position.set = pos;
    }
}

// Driver function that updates the render every frame
function update() {

    const elapsedTime = clock.getElapsedTime()

    requestAnimationFrame(() => { update() });

    move();

    // All animations go before the scene is rendered or the animation will be delayed by a frame
    cube.rotation.y = elapsedTime;

    // Render every frame
    three.renderer.render(three.scene, three.camera);
}


