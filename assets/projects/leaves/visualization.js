// import { changeRadius2 } from '/static/js/meanshift.js';
// global variables three.js visualization
var container, stats, camera, controls, scene,renderer, mouse, offset, light, light2, axes;

// global variables meanshift visualization
var pickingData = [];
var pickingTexture, pickingScene;

// global variables geometries visualization
var grLeaf, grSphere, grEdge;

// global variables categories and group categories
var dist, N, label, categ, categ2, cluster, convexHullGroup;

// auxiliar varibles to build visualization
var ngroups, ngroups1, eqRad, factor, gRad, leafScale;
var graph = [];
var graph1 = [];
var color123 = []
var ArchivoGeneral;

// init values for build visualization
factor = 0.1;
gRad = 0.1;
eqRad = 0;
leafScale = 0.5;

// global variables for html controls
var out, gra, up_rad, dw_rad, leaf, lx, gf;




function startVisualization () {

    getHTMLElements();
    configureHTMLControls();
    configureScene();
    mainProgram();
    animate();

}

function getHTMLElements () {

    container = document.getElementById("canvas");
    out = document.getElementById("h0");
    gra = document.getElementById("container2");
    up_rad = document.getElementById("up_rad");
    dw_rad = document.getElementById("dw_rad");
    leaf = document.getElementById("leaf");
    lx = document.getElementById("lx");
    gf = false;

}

function configureHTMLControls () {

    up_rad.addEventListener('click', function(){changeRadius(1);});
    dw_rad.addEventListener('click', function(){changeRadius(0);});
    leaf.addEventListener('click', function(){grLeaf.visible = !grLeaf.visible; gf=!gf;});
    lx.addEventListener('click', function(){grSphere.visible = !grSphere.visible; grEdge.visible = !grEdge.visible;});
    window.addEventListener('resize', onWindowResize, false );
    window.addEventListener('keydown', function(event) {
        switch (event.keyCode) {
            case 81: // Q
                grSphere.visible = !grSphere.visible;
                grEdge.visible = !grEdge.visible;
                break;
            case 17: // Ctrl
                //control.setTranslationSnap( 100 );
                //control.setRotationSnap( THREE.Math.degToRad( 15 ) );
                break;
            case 87: // W
                changeRadius(1);
                break;
            case 69: // E
                //factor /= 1.05;
                changeRadius(0);
                break;
            case 82: // R
                eqRad = !eqRad;
                break;
            case 72: // H
                grLeaf.visible = !grLeaf.visible;
                break;
            case 187:
            case 107: // +, =, num+
                //control.setSize( control.size + 0.1 );
                break;
            case 189:
            case 109: // -, _, num-
                //control.setSize( Math.max( control.size - 0.1, 0.1 ) );
                break;
        }
    });
}

function configureScene (){
   
    // camera configuration
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.z = 4;
    camera.position.x = 0;
    camera.position.y = 0;

    // controls configuration
    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;
    controls.noZoom = false;
    controls.noPan = false;
    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    // scene configuration
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    scene.add(new THREE.AmbientLight(0x555555));

    // light 1 configuration
    light = new THREE.SpotLight(0x448888, 1.5);
    light.position.set(2000, 500, 0);
    scene.add(light);

    // light 2 configuration
    light2 = new THREE.SpotLight(0xcc8844, 1.5);
    light2.position.set(-2000, -500, 0);
    scene.add(light2);

    // acxes configuration
    axes = new THREE.AxisHelper(0.2);
    scene.add(axes);

    // geometries configuration for interactive meanshift clustering
    grLeaf = new THREE.Group();
    grSphere = new THREE.Group();
    grEdge = new THREE.Group();
    scene.add(grLeaf);
    scene.add(grSphere);
    scene.add(grEdge);

    // ni idea pa que es esto
    mouse = new THREE.Vector2();
    offset = new THREE.Vector3(10, 10, 10);

	// configuration WebGL Rennder
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild(renderer.domElement);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
}

function mainProgram() {

    
    N = rad.length - 1;
    dist = new Array(N*N);
    label = new Array(N*N);
    categ = new Array(N);
    categ2 = new Array(N);
    cluster = new Array(N);
    ngroups = N;
    ngroups1 = N;
    graph.push([factor, ngroups]);
    graph1.push([factor*0.25, ngroups1]);
    
    
    coef = normalizeData(coef);
    
    

    for(var i=0; i<N; i++)                                  //To calculate euclidean distance matrix
        for(var j=0; j<N; j++)
            dist[i*N+j] = Math.sqrt((coef[i*3+0]-coef[j*3+0])*(coef[i*3+0]-coef[j*3+0]) +
                               (coef[i*3+1]-coef[j*3+1])*(coef[i*3+1]-coef[j*3+1]) +
                               (coef[i*3+2]-coef[j*3+2])*(coef[i*3+2]-coef[j*3+2]));


    for(var i=0; i<N; i++){

        color123.push(Math.random() * 0xbcbcbc);
        categ[i] = i;
        categ2[i] = i;
        cluster[i] = i;
    }

    for(var i=0; i<N; i++){

        var geometrySp = new THREE.SphereGeometry(rad[i], 32, 32);
        var materialSp = new THREE.MeshPhongMaterial({color: color123[i]});
        var sphere = new THREE.Mesh(geometrySp, materialSp);
        sphere.position.set(coef[i*3], coef[i*3+1], coef[i*3+2]);
        grSphere.add(sphere);

        var leafPoints = [];
        for(var j = i*pts; j < (i+1)*pts; j=j+2){
            leafPoints.push( new THREE.Vector2(contour[j], contour[j+1]));
        }

        leafPoints.push(new THREE.Vector2(contour[i*pts], contour[i*pts+1]));
        for(var k = 0; k < leafPoints.length; k++)
            leafPoints[k].multiplyScalar(0.15);

        var geometryPoints = new THREE.BufferGeometry().setFromPoints(leafPoints);
        var line = new THREE.Line(geometryPoints, new THREE.LineBasicMaterial({color: color123[i], linewidth: 3}));
        line.position.set(coef[i*3], coef[i*3+1], coef[i*3+2]);
        line.lookAt(camera.position);
        grLeaf.add(line);  //----> temporal

        for(var j=0; j<N; j++){

            var geometryEdge = new THREE.Geometry();
            geometryEdge.vertices.push(new THREE.Vector3(coef[i*3], coef[i*3+1], coef[i*3+2]));
            geometryEdge.vertices.push(new THREE.Vector3(coef[j*3], coef[j*3+1], coef[j*3+2]));
            var materialEdge = new THREE.LineBasicMaterial({color: color123[i], linewidth: 3});
            var edges = new THREE.Line(geometryEdge, materialEdge);
            edges.visible = false;
            grEdge.add(edges);
        }
    }
    
    
    grEdge.visible = false;
    renderConvexFeatures(0);
    
    
        

}
function normalizeData(data) {

    let minX = 0; let minY = 0; let minZ = 0; let maxX = 0; let maxY = 0; let maxZ = 0;

    try {

        if (data.length > 0){

            for (var i = 0; i < N; i++) {

                (minX > data[i*3]) ?  minX = data[i*3]: minX = minX;
                (minY > data[i*3+1]) ? minY = data[i*3+1]: minY = minY;
                (minZ > data[i*3+2]) ? minZ = data[i*3+2]: minZ = minZ; 
                
                (maxX < data[i*3]) ?  maxX = data[i*3]: maxX = maxX;
                (maxY < data[i*3+1]) ? maxY = data[i*3+1]: maxY = maxY;
                (maxZ < data[i*3+2]) ? maxZ = data[i*3+2]: maxZ = maxZ; 

            }

            for (var i = 0; i < N; i++) {

                data[i*3] = 2 * ((data[i*3] - minX) / (maxX - minX)) - 1;
                data[i*3+1] = 2 * ((data[i*3+1] - minY) / (maxY - minY)) - 1;
                data[i*3+2] = 2 * ((data[i*3+2] - minZ) / (maxZ - minZ)) - 1;
            }
           return data;
        }
    } catch (error) {
        
        console.log(error);
        return null;
    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(){

    controls.update();
    renderer.render(scene, camera);

}

function animate(){

    requestAnimationFrame(animate);
    var rt = 0.01, j=0;
    for(var i=0; i<N; i++){
	    grLeaf.children[i].lookAt(camera.position);
	    grLeaf.children[i].rotation.copy(camera.rotation);
        grSphere.children[i].scale.set(factor, factor, factor);
        grLeaf.children[i].scale.set(leafScale, leafScale, leafScale);
	    grLeaf.children[i].material.color = new THREE.Color(color123[categ2[i]]);

	    grSphere.children[i].material.color = new THREE.Color(color123[categ2[i]]);
	    j++;
	    if(j>=10){rt=0.01; j=0;}
    }
    j=0;
    out.innerText  = "H0 " + ngroups;
    
    //out.value += "Radius factor: " + factor + "\n";
    //if(gf)
    gra.style.visibility = "hidden";
    //else
    //gra.style.visibility = "visible";

    render();
}

function onMouseMove(e){

    mouse.x = e.clientX;
    mouse.y = e.clientY;
}

function renderLines(){

    for(var i=0; i<N; i++)
        for(var j=i+1; j<N; j++)

            if(label[i*N+j]){

                grEdge.children[i*N+j].material.color = new THREE.Color(color123[categ2[i]]);
                grEdge.children[i*N+j].visible = true;
            }
            else
                grEdge.children[i*N+j].visible = false;
                        
}

function renderConvexFeatures(item){
    
    let categories;
    let categoryColors = [];
    try {

        if (convexFeatures != undefined & convexFeatures != null) {

            if (convexHullGroup == undefined || convexHullGroup == null) {
                
                convexHullGroup = new THREE.Group();
            } else {
                scene.dispose ();
                scene.remove(convexHullGroup);       
                convexHullGroup.remove(...convexHullGroup.children);
                convexHullGroup = new THREE.Group();
                scene.dispose ();
            }

            if (convexFeatures.features.length > 0) {
                
                categories = convexFeatures.features[item].categories;
                
                for (var i = 0; i < categories.length; i++) {
                    
                    let convexHullName = categories[i].cat_nom;
                    let convexPoints = new THREE.Geometry();
                    let category = categories[i];

                    for (var j = 0; j < category.coef.length; j++){

                        let point = category.coef[j];
                        convexPoints.vertices.push(new THREE.Vector3(coef[point], coef[point + 1], coef[point + 2]));

                    }

                    let convexGeometry = new THREE.ConvexBufferGeometry(convexPoints.vertices);
                    let convexMaterial = new THREE.MeshPhongMaterial({color: color123[i], opacity: 0.5, transparent: true});
                    let meshConvex = new THREE.Mesh(convexGeometry, convexMaterial);
                    categoryColors.push(convexMaterial.color.getHexString());
                    convexGeometry.name = convexHullName;
                    convexHullGroup.add(meshConvex);
                }
                renderLegendConvexHull(categories, categoryColors);
                scene.add(convexHullGroup);

                let convexCheck = document.getElementById('convex-check');
                let infoLegend = document.getElementById('info-legend');
                
                if (convexCheck.checked) {
                    infoLegend.style.display = 'block';
                    convexHullGroup.visible = true;

                } else {
                    infoLegend.style.display = 'none';
                    convexHullGroup.visible = false;
                }
                
            } else {
                console.log('The file has no features');
            }

        
        } else {
            console.log('Data not found to create Convexhull');
        }
        
    } catch (error) {
        console.log(error);
    }

}

function renderLegendConvexHull (categories, colors) {

    let divInfoLegend = document.getElementById('info-legend');

    while (divInfoLegend.firstChild) {
        divInfoLegend.removeChild(divInfoLegend.lastChild);
    }

    try {
        
        if (categories.length > 0 && categories != null && categories != undefined) {

            let title = document.createElement('span');
            title.innerHTML = '<strong> Convexhull categories </strong>';
            divInfoLegend.appendChild(title);

            for (var i = 0; i < categories.length; i++) {

                let item = document.createElement('div');
                let key = document.createElement('span');
                key.className = 'legend-key';
            
                key.style.backgroundColor = '#' + colors[i];
                var value = document.createElement('span');
                value.innerHTML = categories[i].cat_nom;
                item.appendChild(key);
                item.appendChild(value);
                divInfoLegend.appendChild(item);
                
            }

        }
        
    } catch (error) {
        console.log(error);
    }

}

function renderConvex(){

    var cPoints = new THREE.Geometry();
    for(var i=0; i<20; i++)
        cPoints.vertices.push(new THREE.Vector3(coef[i*3], coef[i*3+1], coef[i*3+2]));

    var geometry = new THREE.ConvexBufferGeometry(cPoints.vertices);
    var material = new THREE.MeshPhongMaterial({color: color123[0], opacity: 0.5, transparent: true});
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

}

function changeRadius(){
    //console.log('factor antes: ', factor);
    var  i, j;
    //var  f, i, j;
    //if(up==1) f = 1.05;
    //else f = 1.0/1.05;
    //factor *= f;
    //console.log('factor despues: ', factor);
    for(i=0; i<N; i++)
        for(j=0; j<N; j++){
            label[i*N+j] = 0;
            if(i==j || factor*(rad[i]+rad[j])>=dist[i*N+j])
                    label[i*N+j] = i+1;
        }

    for(j=0; j<N; j++){
        var val=N;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < val) val=label[i*N+j];
        categ2[j] = val;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0)
                    for(k=0; k<N; k++)
                        if(label[i*N+k] != 0)
                            label[i*N+k] = val;
    }
    for(j=0; j<N; j++){
        var val=N;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < val) val=label[i*N+j];
        categ2[j] = val;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0)
                    for(k=0; k<N; k++)
                        if(label[i*N+k] != 0)
                            label[i*N+k] = val;
    }
    for(j=0; j<N; j++)
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < categ2[j]) categ2[j]=label[i*N+j];

    var aux=1; // u: vector unique categories
    cluster[0] = categ2[0];
    for(var i=1; i<N; i++){
        var b=1;
        for(var k=0; k<aux; k++)
            if(categ2[i]==cluster[k]){
                    b=0;
                    break;
            }
        if(b){
            cluster[aux] = categ2[i];
            aux++;
        }
    }
    ngroups = aux;
    renderLines();
    changeRadius2();
}

function changeRadius2(){
    var  f, i, j;

    for(i=0; i<N; i++)
        for(j=0; j<N; j++){
            label[i*N+j] = 0;
            if(i==j || 0.25*factor>=dist[i*N+j])
                    label[i*N+j] = i+1;
        }

    for(j=0; j<N; j++){
        var val=N;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < val) val=label[i*N+j];
        categ[j] = val;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0)
                    for(k=0; k<N; k++)
                        if(label[i*N+k] != 0)
                            label[i*N+k] = val;
    }
    for(j=0; j<N; j++){
        var val=N;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < val) val=label[i*N+j];
        categ[j] = val;
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0)
                    for(k=0; k<N; k++)
                        if(label[i*N+k] != 0)
                            label[i*N+k] = val;
    }
    for(j=0; j<N; j++)
        for(i=0; i<N; i++)
            if(label[i*N+j] != 0 && label[i*N+j] < categ[j]) categ[j]=label[i*N+j];

    var aux=1; // u: vector unique categories
    cluster[0] = categ[0];
    for(var i=1; i<N; i++){
        var b=1;
        for(var k=0; k<aux; k++)
            if(categ[i]==cluster[k]){
                    b=0;
                    break;
            }
        if(b){
            cluster[aux] = categ[i];
            aux++;
        }
    }
    ngroups1 = aux;
}

