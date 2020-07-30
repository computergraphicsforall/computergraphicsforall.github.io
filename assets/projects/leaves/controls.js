/* controls and events on visualization*/

var previusRadio = 0;
var previusSheetSize = 0;
var sliderSphere = document.getElementById('slider-sphere-radius');
var currentValue = parseFloat(sliderSphere.value);
var div = document.getElementById('select-value');

var fileFeatures;

// sphere slider to change ratio
div.innerText = sliderSphere.value;
sliderSphere.addEventListener ('input', function(e) {

    let div = document.getElementById('select-value');
    div.innerText = sliderSphere.value;
    factor = parseFloat(sliderSphere.value);
    console.log(parseFloat(sliderSphere.value));
    changeRadius();

});
sliderSphere.addEventListener('mousedown', function () {
    controls.enabled = false;
});
sliderSphere.addEventListener('mouseup', function () {
    controls.enabled = true;
});

// active or inactive lines 
var lineCheck = document.getElementById('lines-check');
lineCheck.addEventListener('click', function () {

    if (this.checked) {
        
        grEdge.visible = true;
        console.log('Lineas activadas');
    } else {
        
        grEdge.visible = false;
        console.log('Lineas desactivadas');
    }
});

// active or inactive contours 
var leafCheck = document.getElementById('leafs-check');
leafCheck.addEventListener('click', function () {

    if (this.checked) {

        grLeaf.visible = true;
        console.log('Hojas activadas');
    } else {

        grLeaf.visible = false;
        console.log('Hojas desactivadas');
    }
});

// active or inactive spheres
var sphereCheck = document.getElementById('sphere-check');
sphereCheck.addEventListener('click', function () {

    if (this.checked) {
        
        grSphere.visible = true;
        console.log('esferas activadas');
    } else {
        
        grSphere.visible = false;
        console.log('esferas desactivadas');
    }
});

var convexCheck = document.getElementById('convex-check');
var infoLegend = document.getElementById('info-legend');
convexCheck.addEventListener('click', function () {

    if (this.checked) {
        
        convexHullGroup.visible = true;
        infoLegend.style.display = 'block';
        console.log('convexhull activado');
    } else {
        
        convexHullGroup.visible = false;
        infoLegend.style.display = 'none';
        console.log('convexhull desactivado');
    }
});

// sheet slider to change the size
var sliderSheetSize = document.getElementById('slider-sheet-size');
sliderSheetSize.addEventListener('input', function() {

    leafScale = sliderSheetSize.value;

});
    
sliderSheetSize.addEventListener('mousedown', function () {
    controls.enabled = false;
});
sliderSheetSize.addEventListener('mouseup', function () {
    controls.enabled = true;
});

// active or inactive confusion matrix
var confusionCheck = document.getElementById('confusion-check');
confusionCheck.addEventListener('click', function () {

    if (this.checked) {
        console.log('Matriz de confusion activada');
    } else {
        console.log('Matriz de confusion desactivada');
    }
});

// active or inactive homological persistence
var persistenceCheck = document.getElementById('persistance-check');
persistenceCheck.addEventListener('click', function () {

    if (this.checked) {
        console.log('Persistencia activada');
    } else {
        console.log('Persistencia desactivada');
    }
});

// active or inactive homological persistence
var dotsCheck = document.getElementById('dots-check');
dotsCheck.addEventListener('click', function () {

    if (this.checked) {
        console.log('Puntos activados');
    } else {
        console.log('Puntos desactivados');
    }
});

var containerControl = document.getElementById('containerOptions');
/*
window.onresize = function () {
    containerControl.style.position = 'fixed';
    containerControl.style.top = '120px';
}*/

if (convexFeatures != undefined || convexFeatures != null) {
    
    if (convexFeatures.features.length > 0)  {

        let mainDiv = document.getElementById('div-features');
        mainDiv.style.display = 'block';

        let select = document.getElementById('features');
        
        for (var i = 0; i < convexFeatures.features.length; i++) {
        
            let option = document.createElement('option');
            option.innerText = convexFeatures.features[i].name;
            option.value = i;
            select.appendChild(option);
            
        }

        select.addEventListener('mouseover', function (){
            controls.enabled = false; 
        });
        select.addEventListener('mouseleave', function (){
            controls.enabled = true;   
        });
        select.addEventListener('change', function (){
            
            renderConvexFeatures(this.value);
        });

    }

}
