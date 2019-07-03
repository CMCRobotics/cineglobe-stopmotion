import {PoppyRobot} from './poppy/PoppyRobot.js';
import {Camera} from './camera/Camera.js';



export default function(liveImgElement, onStepCallback, onAddSlideCallback, webmEncoder, config){
	
}

const robot = new PoppyRobot("http://192.168.1.44:8080");

let slides = [];

let webpFrames = [];

let cameras = [];

let stepCount = 0;
let steps = 10;
let tween = null;

let motionEnabled = true;

let axiosCli = axios.create({
    timeout: 5,
    headers: {
        "Content-Type": "application/json"
    }
  });

var startPosition = {m1:10, m2:-30, m3:-30, m4:50,m5:30};
var position = Object.assign({}, startPosition);
var endPosition = { m1: 10, m2:-18, m3:-40, m4:20,m5:50 };

function encode(title) {
    if (!this.audioBlob)
      return webm.encode(title, this.w, this.h, this.frameTimeout(), this.frameWebps, null);
    let fr = new FileReader();
    let an = this;
    let promise = new Promise((resolve, reject) => {
      fr.addEventListener("loadend", evt => {
        webm.encode(title, an.w, an.h, an.frameTimeout(), an.frameWebps, fr.result)
            .then(resolve);
      });
      fr.readAsArrayBuffer(an.audioBlob);
    });
    return promise;
  }


function stepPosition(){
    var c = document.createElement('canvas');
    var img = document.getElementById('myImage');
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    slides.push(c.toDataURL('image/jpeg',0.95));
    
    let promise = new Promise(((resolve, reject) => {
        if (self.requestIdleCallback) {
          requestIdleCallback(() => {
            c.toBlob(blob => { resolve(blob) }, 'image/webp');
          });
        } else {
          c.toBlob(blob => { resolve(blob) }, 'image/webp');
        }
      }));
    webpFrames.push(promise);
      
    $(".sp-slides").append("<div class='sp-slide'><img src='"+slides[slides.length-1]+"''></div>");      
    $('#my-slider' ).sliderPro( 'update' );
    $('#my-slider' ).sliderPro( 'gotoSlide', slides.length );
    
    

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
}
jQuery("#step").on("click", function(){
        stepPosition();
});

jQuery("#reset").on("click", function(){
        stepCount = 0;
        stepPosition();
});
jQuery("#undo").on("click", function(){
         if(motionEnabled){
             stepCount=stepCount-2;
             if (stepCount < 0) stepCount = 0;
             stepPosition();
         }
});

jQuery("#release").on("click", function(){
        robot.setAll('compliant' , true);
  
});

jQuery("#save").on("click", function(){
    console.log("Saving and downloading...");
//    webm.encode("My video", 800, 480, 1000.0/7, webpFrames, null)
//      .then(blob => {
//        this.exported = blob;
//        let url = URL.createObjectURL(blob);
//        let downloadLink = document.createElement('a');
//        downloadLink.download = filename;
//        downloadLink.href = url;
//        downloadLink.click();
//        URL.revokeObjectURL(url);
//        return blob;
//      });

});

jQuery( document ).ready(function( $ ) {
    
    axiosCli.get("/config.json").then(function(response){
        // Setup the cameras and the robots
        response.data.cameras.forEach(function(cam){
            cameras.push(new Camera(cam.name, cam.host,cam.port, cam.robotPort, cam.path));
            // Setup camera motion dialog and select lists
            $("#camera-dropdown-menu").empty();
            cameras.forEach(function(cam){
                $("<a class='dropdown-item'  href='#'>"+cam.name+"</a>")
                   .appendTo("#camera-dropdown-menu")
                   .data("camera", cam)
                   .on("click", function(evt){
                           evt.preventDefault();
                           var el= $(evt.target).data('camera');
                           console.log("Switching to "+el.name+ " "+el.host);
                        });
            });
        });
    }).catch(function (error) {
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


