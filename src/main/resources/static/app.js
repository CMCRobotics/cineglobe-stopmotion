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

let introSlideBlob = null;

let uploadPromise = null;

let downloadWait;

let axiosCli = axios.create({
    timeout: 5000,
    headers: {
        "Content-Type": "application/json"
    }
  });

let previewCam = null;

function delayedPromise(ms){
    return new Promise( function (resolve){
      console.log("set timeout at "+ms);  
      setTimeout(resolve, ms);
    });
}


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

function getJpegDataURLForImage(imgElement){
    var c = document.createElement('canvas');
    c.width = imgElement.width;
    c.height = imgElement.height;
    var ctx = c.getContext('2d');
    
    ctx.drawImage(imgElement, 0, 0);
    return c.toDataURL('image/jpeg',0.95)
}
function snap(){
    console.log("Snap!");
    var img = document.getElementById('view-finder');
    slides.push(getJpegDataURLForImage(img));
    
    $(".sp-slides").append("<div class='sp-slide'><img src='"+slides[slides.length-1]+"''></div>");      
    $('#my-slider' ).sliderPro( 'update' );
    $('#my-slider' ).sliderPro( 'gotoSlide', slides.length );
    currentCam.stepForward();
}

function setCurrentCamera(cam){
    // Switch to the given camera in the cameras list
    console.log("CAMERA : Switching to "+cam.name+ " "+cam.host);
    currentCam = cameras[cam.index];
    $("#steps-left").text(currentCam.stepCount - currentCam.currentStep);
    $("#view-finder").attr("src","http://"+cam.host+":"+cam.port+cam.path).prop("crossOrigin","anonymous");
    $("#camera-label").text(cam.name);
    
}

jQuery("#step").on("click", function(){
    snap();
    $("#steps-left").text(currentCam.stepCount - currentCam.currentStep);
});

jQuery("#steps-range").on("input", function(evt){
    jQuery("#steps-value").text(evt.target.value);
    previewCam.stepCount = evt.target.value;
});

//jQuery("#undo").on("click", function(){
//     if(currentCam.motionEnabled){
//         currentCam.stepBack();
//     }
//     $('#my-slider' ).sliderPro().find( '.sp-slide' ).eq( slides.length-1 ).remove();
//     slides.pop();
//     $('#my-slider' ).sliderPro( 'update' );
//  //        $('#my-slider' ).sliderPro( 'gotoSlide', slides.length );
//         
//});

jQuery("#show-slider").on("click",function(){
    $("#snap-action-bar").hide();
    $("#top-action-bar").hide();
    $("#history-action-bar").show();
    $("#slider-container").css("z-index",1000);
    $("#view-finder-div").hide();
});

jQuery("#show-live").on("click",function(){
    $("#snap-action-bar").show();
    $("#top-action-bar").show();
    $("#history-action-bar").hide();
    $("#slider-container").css("z-index",-100);
    $("#view-finder-div").show();
});


jQuery("#model-motion-setup").on("show.bs.modal", function(){
    // Update the steps to match the camera's
    jQuery("#steps-range").val(currentCam.stepCount);
    jQuery("#steps-value").text(currentCam.stepCount);
    
    //jQuery("#preview-movement").prop('disabled', true);
    jQuery("#apply-movement").prop('disabled', true);
    // Setup a preview camera
    previewCam = new Camera(currentCam.name, currentCam.host,currentCam.port, currentCam.robotPort, currentCam.path, -1);
    previewCam.connect().then(function(){
        $("#motion-preview").attr("src","http://"+previewCam.host+":"+previewCam.port+previewCam.path).prop("crossOrigin","anonymous");
        previewCam.releaseMotors();
    });
});

jQuery("#model-motion-setup").on("hidden.bs.modal", function(){
    currentCam.resume();
});

jQuery("#set-start-position").on("click", function(){
    previewCam.captureStartPosition();
});

jQuery("#set-end-position").on("click", function(){
    previewCam.captureEndPosition();
   // jQuery("#preview-movement").prop('disabled', false);
    jQuery("#apply-movement").prop('disabled', false);
    
});

jQuery("#apply-movement").on("click", function(){
    previewCam.activateMotors();
    // Update the currentCam with the contents of previewCam, reset motion steps
    currentCam.apply(previewCam);
    $("#steps-left").text(currentCam.stepCount - currentCam.currentStep);
    jQuery("#model-motion-setup").modal('hide');
});

//jQuery("#preview-movement").on("click", function(){
//    previewCam.previewMovement();
//});


jQuery("#save").on("click", function(){
    if(movieUuid != null && slides.length > 0){
        uploadPromise = new Promise(function(resolve, reject){
            var thatResolve = resolve;
            var thatReject = reject;
            console.log("Saving and uploading...");
            var data = new FormData();

            data.append("uuid",movieUuid);
            
            var offset = 0;
            // We include two seconds of intro slide (14 frames)
            for(var i = 0 ; i <=14 ; i++){
                var str = "" + (i+1);
                data.append("files", introSlideBlob, "slide"+pad.substring(0, pad.length - str.length) + str+".jpg");
                offset++;
            }
            
            // We include all further slides
            slides.forEach(function(slide, index){
                var str = "" + (offset+index+1);
                data.append("files", dataURItoBlob(slide), "slide"+pad.substring(0, pad.length - str.length) + str+".jpg")
            });
            const config = {
                headers: { 'content-type': 'multipart/form-data' }
            }
            axios.post('/movie/upload', data, config).then(function(){
                // Show encoding progress modal
                // If error, hide the modal and toast the error
                // If success, update the model to indicate how many slides were uploaded
                $("#download-modal-title").text("Encoding your video...");
                $("#download-link").hide();
                $("#download-spinner").show();
                $("#download-link").attr("href","/movie/get/"+movieUuid);
                
                delayedPromise(downloadWait).then(function(){
                    $("#download-modal-title").text("Your movie is ready !");
                    $("#download-spinner").hide();
                    $("#download-link").show();
                });
               
                
                $("#downloadModal").modal("show");
                // Query the encoding status in a loop and update the modal
                // If success, display a download link
                console.log("Movie upload successful");
                
                
            }.bind(this)).catch(function(error){
                console.log("Movie upload failed ",error);
                thatReject(error);
            });
            
        }.bind(this))
        ;
    }
});


jQuery( document ).ready(function( $ ) {
    var that = this;
    
    var introImage = $("#view-finder")[0];
    introSlideBlob = dataURItoBlob(getJpegDataURLForImage(introImage));
    
    axiosCli.get("/config.json").then(function(response){
        downloadWait = response.data.downloadwait;
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
            camObject.connect().then(function(){
                Promise.all([camObject.captureStartPosition(), camObject.captureEndPosition()]);
                $("#steps-left").text(currentCam.stepCount - currentCam.currentStep);
            });
        });
        
        setCurrentCamera(cameras[0]);
        
        movieUuid = new Date().getTime();
    }).catch(function (error) {
        // We could not collect camera configurations !
        $("#toast-body").innerHtml("Something went wrong, please try again or call for assistance.<br>"
                +"<small>( Details : <span id='toast-msg'>error</span> )</small>");
        $('#msgToast').toast('show');
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


