// Data set
var caribeanArray = [];
var latitudeArray = [];
var longitudeArray = [];
var levelTempArray = [];
var data = [];
var particleXCompArray = [];
var particleYCompArray = [];
var vectorXWindArray = [];
var vectorYWindArray = [];
var matrixVectorWindX;
var matrixVectorWindY;

// Data files
const dataCaribeanLines = 'data/caribean_lines.dat';
const dataLongitudes = 'data/lons.dat';
const dataLatitudes = 'data/lats.dat';
const dataTemp = 'data/T_280x287x40.dat';
const dataUlons = "data/ulons.dat";
const dataVlats = "data/vlats.dat";
const dataVectorUlons = "data/U_281x287x40.dat";
const dataVectorVlats = "data/V_280x288x40.dat";
var particleSystem;
var copyParticleSystem;
var vectorField;


function init () {
    //set time out for promises -> pending
    configureScene()
    .then (content => loadDataBinary(dataLongitudes, longitudeArray))
    .then (content => loadDataBinary(dataLatitudes, latitudeArray))
    .then (content => loadDataBinary(dataTemp, levelTempArray))
    .then (content => loadDataText (dataCaribeanLines, caribeanArray))
    .then (content => drawCaribeanLines(caribeanArray))
    //.then (content => drawTemperatureMap(longitudeArray, latitudeArray, 1))
    .then (content => loadDataBinary(dataUlons, particleXCompArray))
    .then (content => loadDataBinary(dataVlats, particleYCompArray))
    .then (content => loadDataBinary(dataVectorUlons, vectorXWindArray))
    .then (content => loadDataBinary(dataVectorVlats, vectorYWindArray))
    //.then (content => matrixVelocityXYParticles(vectorXWindArray, vectorYWindArray, 1))
    //.then (content => drawVectorField(particleXCompArray, particleYCompArray))
    .then (content => drawWindParticleSystem(longitudeArray,latitudeArray))
    .then (content => animate())
    //.then (content => render())
    .catch (err => console.log('check errors: ' + err));
    //loadData();       
}

function loadDataText(dataName, dataOut) {
    
    return new Promise (function (resolve, reject){

        let dataTypeText = 'text';
        var xhrData = new XMLHttpRequest();
        
        xhrData.open("GET", dataCaribeanLines, true);
        xhrData.responseType = dataTypeText;
        
        xhrData.onload = function (content) {
                            
            var arrayBuffer = xhrData.responseText;
            // reg exp with tabular
            //var byteArray = arrayBuffer.split(/\n|\r|\t/g);  
            // reg exp without tabular
            var byteArray = arrayBuffer.split(/\n|\r/g);
            
            if (xhrData.readyState == 4  && xhrData.status == 200){
                
                for (var i = 0; i < byteArray.length; i++) {

                    if (byteArray[i] !== undefined) {

                        dataOut.push(byteArray[i]);

                    }
                }

                resolve(content);
                console.log('success reading -> text file');
                
            } else {
                console.log('failed reading -> text file');
                return reject(xhrData.status);
            }
                        
        };

        xhrData.send();


    });
    
    
}

function loadDataBinary(dataName, dataOut) {
    
    

    return new Promise (function (resolve, reject) {

        let dataTypeBinary = 'arraybuffer'; 
        var xhrData = new XMLHttpRequest();

        xhrData.open("GET", dataName, true);
        xhrData.responseType = dataTypeBinary;
        
        xhrData.onload = function (content) {
            
            var arrayBuffer = xhrData.response; 
            var byteArray = new Float32Array(arrayBuffer);;
            if (xhrData.readyState == 4 && xhrData.status == 200){
                
                for (var i = 0; i < byteArray.byteLength; i++) {

                    if (byteArray[i] !== undefined) {

                        dataOut.push(byteArray[i]);
                    }
                }

                resolve(content);
                console.log('success reading -> binary file');
                  
            } else {

                console.log('failed reading -> binary file');
                return reject(xhrData.status);
            }
                        
        };
        xhrData.send();

    });
}




// vars objects three.js
var axes, camera, scene, webGLRenderer, stats, controls;
var caribeanGeometry, groupCaribeanGeometry;

function configureScene () {

    return new Promise (function (resolve, reject){

        scene = new THREE.Scene();
        axes = new THREE.AxesHelper(20);
        //camera = new THREE.PerspectiveCamera(50, 1280 / 978, 1, 1000);
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 1000);
        webGLRenderer = new THREE.WebGLRenderer({antialias: true});
        stats = new Stats();
        
        if (scene != null && axes != null && camera != null && webGLRenderer != null) {

            webGLRenderer.setPixelRatio(window.devicePixelRatio);
            webGLRenderer.setClearColor(0x000000);
            webGLRenderer.setSize(window.innerWidth, window.innerHeight);
            
            document.body.appendChild(webGLRenderer.domElement);
            document.body.appendChild(stats.dom);

            camera.position.x = -74;
            camera.position.y = 4;
            camera.position.z = 27;
            //camera.lookAt(0, 0, 0);

            controls = new THREE.TrackballControls(camera, webGLRenderer.domElement);
            controls.minDistance = 1;
            controls.maxDistance = 500;
            //translate scene off
            //controls.enablePan = true;
            controls.target.set(-74,4,0);
            controls.rotateSpeed = 1.0;
            controls.zoomSpeed = 1.2;
            controls.panSpeed = 0.8;

            controls.noZoom = false;
            controls.noPan = false;


            controls.staticMoving = true;
            controls.dynamicDampingFactor = 0.3;
            
            controls.addEventListener('change', render);
            window.addEventListener('resize', onWindowResize, false);
            scene.add(axes);
            
            resolve();

        } else {

            var message = 'fail to configure scene';
             return reject(message);
        }        

    });

}

function drawCaribeanLines (dataCaribeanArray) {

     
    return new Promise (function (resolve, reject){

        var polilinesArray = [];
        groupCaribeanGeometry = new THREE.Group();
        caribeanGeometry = new THREE.Geometry();
        if (dataCaribeanArray.length > 0) {
        
            for (var i = 0; i < dataCaribeanArray.length; i++) {
                
                if (dataCaribeanArray[i] === '>' && caribeanGeometry.vertices.length > 0) {
                    
                    var lineMesh = new THREE.Line(caribeanGeometry, new THREE.LineBasicMaterial({ color: 0xBCBABA, linewidth: 1}));
                    //lineMesh.position.set(62,-5,0);
                    //lineMesh.lookAt(camera.position);
                    groupCaribeanGeometry.add(lineMesh);
                    //console.log(caribeanGeometry.vertices);
                   
                } else if (dataCaribeanArray[i] != '>') {

                    var point = dataCaribeanArray[i].split(/\t/);
                    caribeanGeometry.vertices.push(new THREE.Vector3(parseFloat(point[0]), parseFloat(point[1]), 0));
                }
                if (dataCaribeanArray[i] === '>') {
                    caribeanGeometry = new THREE.Geometry();
                    
                }
            }

            if(groupCaribeanGeometry.children.length > 0) {

                //groupCaribeanGeometry.scale.set(4, 4, 0);
                scene.add(groupCaribeanGeometry);                
            } else {

                var message = 'fail to build group polilines to scene';
                return reject(message);
            }
            //set time out for promises
            resolve();

        } else {

            let message = 'No data to draw';
            return reject(message);
        }

    });
}

function drawTemperatureMapParticleSystem (dataLong
    , dataLat, level) {

    return new Promise (function (resolve, reject) {
        
        
        let geometryTemperature = new THREE.Geometry();
        let materialPoint = new THREE.PointsMaterial({vertexColors: THREE.VertexColors, size: 0.15});
        console.log(dataLong.length);
        //points for level in the grid (longs 280 - lats 287)
        let levelTemp = 80360 * level;
        for (var i = 0; i < dataLat.length; i++) {
            
            for (var j = 0; j < dataLong.length; j++) {

                var pointTemperature = new THREE.Vector3(dataLong[j], dataLat[i], 0);
                geometryTemperature.vertices.push(pointTemperature);
                
                var color = new THREE.Color();
                var tempPoint = (1 - levelTempArray[levelTemp] / 35) * 0.8;
                //color.setRGB(0.975,0.025, 0.025);
                color.setHSL(tempPoint,1,0.5);
                geometryTemperature.colors.push(color);
                levelTemp++;

            }
 

        }
        
        console.log(geometryTemperature.vertices.length);
        let cloudPointsTemperature = new THREE.Points(geometryTemperature, materialPoint);
        scene.add(cloudPointsTemperature);
        resolve();
    });
}

function drawTemperatureMap (dataLong, dataLat, level) {

    return new Promise (function (resolve, reject) {
        
        
        let geometryTemperature = new THREE.Geometry();
        let materialPoint = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors, wireframe: false});
        //materialPoint.vertexColorSpace = THREE.ColorSpaceHSL;
        let sizeGrid = dataLong.length * dataLat.length;
        console.log(dataLong.length);
        //points for level in the grid (longs 280 - lats 287)
        let levelTemp = 80360 * level;
        let vertexColorsTemp = [];
        for (var i = 0; i < dataLat.length; i++) {
            
            for (var j = 0; j < dataLong.length; j++) {

                var pointTemperature = new THREE.Vector3(dataLong[j], dataLat[i], 0);
                geometryTemperature.vertices.push(pointTemperature);
                
                var color = new THREE.Color();
                var tempPoint = (1 - levelTempArray[levelTemp] / 35) * 0.8;

                color.setHSL(tempPoint,1,0.5);
                vertexColorsTemp.push(color)
                levelTemp++;

            }
 
        }

        geometryTemperature.vertexColors = vertexColorsTemp;

        for (var t = 0; t < sizeGrid; t++) {
            
            //validation for overflow
            if ((t < sizeGrid) && ((t + 1) < sizeGrid) && (((t + dataLong.length) + 1) < sizeGrid)) {
                
                geometryTemperature.faces.push(new THREE.Face3(t, t + 1, t + 280));
                geometryTemperature.faces.push(new THREE.Face3(t + 280, t + 1, t + 280 + 1));
            }   

        }

        geometryTemperature.computeFaceNormals();
        computeFaceColors(geometryTemperature);

        let cloudPointsTemperature = new THREE.Mesh(geometryTemperature, materialPoint);
        cloudPointsTemperature.position.set(0,0,-0.5);
        scene.add(cloudPointsTemperature);
        resolve();
    });
}

function computeFaceColors(geometry) {

    if(!(geometry instanceof THREE.Geometry) ) {
        throw "computeFaceColors needs a geometry object";
    }
    var colors = geometry.vertexColors;
    var i, faces = geometry.faces, len = faces.length;

    for(i = 0 ; i < len; ++i ) {
        
        var face = faces[i];
        var facecolors = [];
        
        facecolors[0] = colors[face.a];
        facecolors[1] = colors[face.b];
        facecolors[2] = colors[face.c];
        face.vertexColors = facecolors;
    }
}


function findParticlePositionXY (particle, dataArrayXY) {

    // max and min values vector field
    let maxValue = dataArrayXY[dataArrayXY.length - 1];
    let minValue = dataArrayXY[0];
    let resultPosition = [0.0, 0.0];

    let distancePositions = Math.abs(dataArrayXY.length / (maxValue - minValue));
    let partialPosition = Math.floor((particle - minValue) * distancePositions);
    

    if (particle > dataArrayXY[partialPosition]) {

        resultPosition [0] = partialPosition;
        if ((partialPosition + 1) < dataArrayXY.length) {
            resultPosition [1] = partialPosition + 1;

        } else {
            resultPosition [1] = dataArrayXY.length;
        }
    }

    if (particle < dataArrayXY[partialPosition]) {

        partialPosition = partialPosition - 1;
        resultPosition [0] = partialPosition;
        if ((partialPosition + 1) < dataArrayXY.length) {
            resultPosition [1] = partialPosition + 1;

        } else {
            resultPosition [1] = dataArrayXY.length;
        }

    }

    return resultPosition;
}

function matrixVelocityXYParticles (vectorXWindArray, vectorYWindArray, level) {

    let ux = 281 * level;
    let uy = 287 * level;
    let vx = 280 * level;
    let vy = 288 * level;
    let cnt = 0;

    matrixVectorWindX = new Array(uy);
    matrixVectorWindY = new Array(vy);

    for (var i = 0; i < matrixVectorWindX.length; i++)
      matrixVectorWindX[i] = new Array(ux);
    for (var i = 0; i < matrixVectorWindY.length; i++)
      matrixVectorWindY[i] = new Array(vx);
    //console.log(matrixVectorWindX);
    //console.log(matrixVectorWindY);
    return new Promise (function (resolve, reject) {

       for (var x = 0; x < ux; x++) {        
            for (var y = 0; y < uy; y++) {
                matrixVectorWindX[x][y] =  vectorXWindArray[cnt];
                cnt++;
            }

        }
        cnt = 0;
       
        for (var x = 0; x < ux; x++) {
            matrixVectorWindY[x] = [];
            for (var y = 0; y < uy; y++) {

                matrixVectorWindY[x][y] =  vectorYWindArray[cnt];
                cnt++;
            }

        }
        
        resolve();

    });
}

function findVelocityScalars (a_1, a_2, particle, dataArrayXY) {

    let scalars = [0.0, 0.0];
    let maxValue = dataArrayXY[dataArrayXY.length - 1];
    let minValue = dataArrayXY[0];
    let relativeDistance = maxValue - minValue;
    //interpolation
    
    let a_comp = (a_2 - particle) / Math.abs(a_2 - a_1);
    let b_comp = (particle - a_1) / Math.abs(a_2 - a_1);
    scalars[0] = a_comp;
    scalars[1] = b_comp;

    return scalars;

}


function drawVectorField (dataX, dataY) {

    return new Promise (function (resolve, reject){

        let particles = new THREE.Geometry();
        let particlesMaterial = new THREE.PointsMaterial({color:0xFF000F, size: 0.02});

        for (var py = 0; py < dataY.length; py++) {

            for (var px = 0; px < dataX.length; px++) {
                let x = dataX[px];
                let y = dataY[py];
                let particle = new THREE.Vector3(x, y, 0);
                particle.velocityX = 0;
                particle.velocityY = 0;
                particles.vertices.push(particle);

            }  
        }

        vectorField = new THREE.Points(particles, particlesMaterial);
        scene.add(vectorField);
        resolve();
    });
}

//ok 
function drawWindParticleSystem (dataX, dataY) {

    return new Promise (function (resolve, reject){
        var texture = new THREE.TextureLoader().load("bolitadeformadita.png");
        let particles = new THREE.Geometry();
        let particlesMaterial = new THREE.PointsMaterial({color:0x2697F6, size: 0.18, map: texture, opacity: 1, sizeAttenuation: true, blending: THREE.AdditiveBlending, depthWrite: false});

        for (var py = 0; py < dataY.length; py++) {

            for (var px = 0; px < dataX.length; px++) {

                let x = Math.random() * 0.1 + dataX[px];
                let y = Math.random() * 0.02 + dataY[py];

                let particle = new THREE.Vector3(x, y, 0);
                particle.velocityX = 0;
                particle.velocityY = 0;
                particles.vertices.push(particle);

            }  
        }
        
        particleSystem = new THREE.Points(particles, particlesMaterial);
        particleSystem.name = 'particlesWind';
        copyParticleSystem = new THREE.Points(new THREE.Geometry(), new THREE.PointsMaterial({color:0xFFFFFF, size: 0.05}))
        copyParticleSystem = particleSystem.clone();
        scene.add(particleSystem);
        resolve();
    });
}


function animate() {
    
    return new Promise (function (resolve, reject) {

        let ulonsT = 281;
        let vlatsT = 280;
        var vertices = particleSystem.geometry.vertices;
        
        let uParticlePosition = [0.0, 0.0];
        let vParticlePosition = [0.0, 0.0];
        let uScalarsX = [0.0, 0.0];
        let vScalarsY = [0.0, 0.0];

        let particleXComp = 0;
        let particleYComp = 0;
        let x0, x1, y0, y1, u_zero, u_one, u_two, u_three, v_zero, v_one, v_two, v_three = 0;

        vertices.forEach (function (p, i){

            let copyVertices;
            uParticlePosition = findParticlePositionXY(p.x, particleXCompArray);
            x0 = uParticlePosition[0];
            x1 = uParticlePosition[1];

            
            vParticlePosition = findParticlePositionXY(p.y, particleYCompArray);
            y0 = vParticlePosition[0];
            y1 = vParticlePosition[1];
            
            uScalarsX = findVelocityScalars(particleXCompArray[x0], particleXCompArray[x1], p.x, particleXCompArray);
            vScalarsY = findVelocityScalars(particleYCompArray[y0], particleYCompArray[y1], p.y, particleYCompArray);


            u_zero = vectorXWindArray[x0 + y0 * ulonsT];
            u_one = vectorXWindArray[x1 + y0 * ulonsT];
            u_two = vectorXWindArray[x0 + y1 * ulonsT];
            u_three = vectorXWindArray[x1 + y1 * ulonsT]; 
            
            v_zero = vectorYWindArray[x0 + y0 * vlatsT];
            v_one = vectorYWindArray[x1 + y0 * vlatsT];
            v_two = vectorYWindArray[x0 + y1 * vlatsT];
            v_three = vectorYWindArray[x1 + y1 * vlatsT];


            w_one = uScalarsX[0];
            w_two = uScalarsX[1];

            t_one = vScalarsY[0];
            t_two = vScalarsY[1];


            
            p.velocityX = ((u_zero * w_one + u_one * w_two) * t_one) + ((u_two * w_one + u_three * w_two) * t_two);
            p.velocityY = ((v_zero * t_one + v_two * t_two) * w_one) + ((v_one * t_one + v_three * t_two) * w_two);

            
            var x = p.x;
            var y = p.y;
            p.x = p.x + p.velocityX * 0.01;
            p.y = p.y + p.velocityY * 0.01;

        
            if (p.x < longitudeArray[0] || p.x > longitudeArray[longitudeArray.length -1] || p.y < latitudeArray[0] || p.y > latitudeArray[latitudeArray.length -1] || (Math.abs(p.x - x) < 0.0001 && Math.abs(p.y - y) < 0.0001) || (x == 0 ||  y ==  0)) {

                p.x = Math.random() * 0.1 + longitudeArray[Math.floor(Math.random() * longitudeArray.length)];
                p.y = Math.random() * 0.02 + latitudeArray[Math.floor(Math.random() * latitudeArray.length)];

            }
                


                


        });

        particleSystem.geometry.verticesNeedUpdate = true;

        requestAnimationFrame(animate);
        controls.update();
        stats.update();
        webGLRenderer.render(scene, camera);
        resolve();
    });
    
}

function render() {

    return new Promise (function (resolve, reject) {
        webGLRenderer.render(scene, camera);
        resolve();

    });
    
}

function onWindowResize () {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    webGLRenderer.setSize(window.innerWidth, window.innerHeight);
    webGLRenderer.setClearColor(0x000000);
    render();
}

