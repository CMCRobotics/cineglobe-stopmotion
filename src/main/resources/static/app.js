import {PoppyRobot} from './poppy/PoppyRobot.js';
import {Camera} from './camera/Camera.js';

export default function(liveImgElement, onStepCallback, onAddSlideCallback, webmEncoder, config){
	
}

let slides = [];

let cameras = [];

let stepCount = 0;
let steps = 10;
let tween = null;

let currentCam = null;

let motionEnabled = true;

let movieUuid = null;

let  pad = "00000";

let axiosCli = axios.create({
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
  });
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    var blob = new Blob([ab], {type: mimeString});
    return blob;

  }
function snap(){
    console.log("Snap!");
    var c = document.createElement('canvas');
    var img = document.getElementById('view-finder');
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    slides.push(c.toDataURL('image/jpeg',0.95));
    
    $(".sp-slides").append("<div class='sp-slide'><img src='"+slides[slides.length-1]+"''></div>");      
    $('#my-slider' ).sliderPro( 'update' );
    $('#my-slider' ).sliderPro( 'gotoSlide', slides.length );
    
    
    currentCam.stepForward();
    /*

    if(motionEnabled){
        tween.update(stepCount);
        robot.set([robot.m1.goal_position,position.m1]
                 ,[robot.m2.goal_position,position.m2]
                 ,[robot.m3.goal_position,position.m3]
                 ,[robot.m4.goal_position,position.m4]
                 ,[robot.m5.goal_position,position.m5])
                 .then(function(response){
                         console.log("Step "+stepCount);
                 });
        if(stepCount < steps) stepCount++;
    }
    */
}

function setCurrentCamera(cam){
    // Switch to the given camera in the cameras list
    console.log("CAMERA : Switching to "+cam.name+ " "+cam.host);
    currentCam = cameras[cam.index];
    
    $("#view-finder").attr("src","http://"+cam.host+":"+cam.port+cam.path).prop("crossOrigin","anonymous");
    $("#motion-preview").attr("src","http://"+cam.host+":"+cam.port+cam.path).prop("crossOrigin","anonymous");
    $("#camera-label").text(cam.name);
    
    // TODO Set the enable motion flag
   // $("#enable-motion").
}

jQuery("#step").on("click", function(){
    snap();
});

jQuery("#steps-range").on("input", function(evt){
    jQuery("#steps-value").text(evt.target.value);
});

jQuery("#undo").on("click", function(){
         if(currentCam.motionEnabled){
             stepCount=stepCount-2;
             if (stepCount < 0) stepCount = 0;
             snap();
         }
});



jQuery("#model-motion-setup").on("show.bs.modal", function(){
    jQuery("#set-start-position").prop('disabled', true);
    jQuery("#set-end-position").prop('disabled', true);
});
jQuery("#model-motion-setup").on("hide.bs.modal", function(){
    jQuery("#release-motors").prop('disabled', false);
});

jQuery("#save").on("click", function(){
    if(movieUuid != null && slides.length > 0){
        console.log("Saving and downloading...");
        var data = new FormData();

        data.append("uuid",movieUuid);
        
        slides.forEach(function(slide, index){
            var str = "" + (index+1);
            data.append("files", dataURItoBlob(slide), "slide"+pad.substring(0, pad.length - str.length) + str+".jpg")
        });
        const config = {
            headers: { 'content-type': 'multipart/form-data' }
        }
        axios.post('/movie/upload', data, config).then(function(){
            // Show encoding progress modal
            // If error, hide the modal and toast the error
            // If success, update the model to indicate how many slides were uploaded
            
            // Query the encoding status in a loop and update the modal
            // If success, display a download link
            
            
            console.log("Movie upload successful");
        }).catch(function(error){
            console.log("Movie upload failed ",error);
        });
    }
    
    
});

jQuery("#release-motors").on("click", function(){
    currentCam.releaseMotors();
    jQuery("#set-start-position").prop('disabled', false);
    jQuery("#set-end-position").prop('disabled', false);
    jQuery("#release-motors").prop('disabled', true);
});

jQuery("#set-start-position").on("click", function(){
    currentCam.captureStartPosition();
});

jQuery("#set-end-position").on("click", function(){
    currentCam.activateMotors().then( function(){
        currentCam.captureEndPosition();
        jQuery("#set-start-position").prop('disabled', true);
        jQuery("#set-end-position").prop('disabled', true);
        jQuery("#preview-movement").prop('disabled', false);
        jQuery("#release-motors").prop('disabled', false);
    });
    
});

jQuery("#preview-movement").on("click", function(){
    currentCam.previewMovement();
    jQuery("#release-motors").prop('disabled', false);
});

jQuery( document ).ready(function( $ ) {
    var that = this;
    axiosCli.get("/config.json").then(function(response){
        // Setup the cameras and the robots
        response.data.cameras.forEach(function(cam, index){
            cameras.push(new Camera(cam.name, cam.host,cam.port, cam.robotPort, cam.path, index));
            // Setup camera motion dialog and select lists
            $("#camera-dropdown-menu").empty();
        });
        
        cameras.forEach(function(camObject){
            $("<a class='dropdown-item'  href='#'>"+camObject.name+"</a>")
            .appendTo("#camera-dropdown-menu")
            .data("camera", camObject)
            .on("click", function(evt){
                    evt.preventDefault();
                    var c = $(evt.target).data('camera');
                    setCurrentCamera(c);
                 });
            camObject.connect();
        });
        
        setCurrentCamera(cameras[0]);
        
        movieUuid = new Date().getTime();
    }).catch(function (error) {
        // We could not collect camera configurations !
        $("#error-toast-msg").text(error);
        $('#errorToast').toast('show');
    });

});




/*robot.connect().then(function(){
  console.log(robot);
  
  robot.setAll('compliant', false);
  
  tween = new TWEEN.Tween(position);
  tween.to(endPosition, steps);
  tween.start(0);
  
});
*/


