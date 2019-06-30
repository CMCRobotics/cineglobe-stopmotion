import {PoppyRobot} from './poppy/PoppyRobot.js';
import {$,jQuery} from 'https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js';

export const robot = new PoppyRobot("http://192.168.43.198:8080");

//export const robot = new PoppyRobot("http://ergo-nine.cern.ch:8080");

//export const robot = new PoppyRobot("http://localhost:8080");

let stepCount = 0;
let steps = 10;
let tween = null;

let motionEnabled = true;

var startPosition = {m1:10, m2:-30, m3:-30, m4:50,m5:30};
var position = Object.assign({}, startPosition);
var endPosition = { m1: 10, m2:-18, m3:-40, m4:20,m5:50 };

jQuery( document ).ready(function( $ ) {
		$( '#my-slider' ).sliderPro({
		height:480,
		width:800,
		responsive: false,
		touchSwipe:false,
		arrows:true, 
		buttons:false,
		autoplay:false,
		loop:false});
	
	});
	

function stepPosition(){
    var c = document.createElement('canvas');
    var img = document.getElementById('myImage');
    c.width = img.width;
    c.height = img.height;
    var ctx = c.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    slides.push(c.toDataURL('image/jpeg',0.95));
    
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
$("#step").on("click", function(){
        stepPosition();
});

$("#reset").on("click", function(){
        stepCount = 0;
        stepPosition();
});
$("#undo").on("click", function(){
         if(motionEnabled){
             stepCount=stepCount-2;
             if (stepCount < 0) stepCount = 0;
             stepPosition();
         }
});

$("#release").on("click", function(){
        robot.set([robot.m1.compliant , true],
                  [robot.m2.compliant , true],
                  [robot.m3.compliant , true],
                  [robot.m4.compliant , true],
                  [robot.m5.compliant , true],
                  [robot.m6.compliant , true]);
  
});

robot.connect().then(function(){
  console.log(robot);
  
  robot.set([robot.m1.compliant , false],
            [robot.m2.compliant , false],
            [robot.m3.compliant , false],
            [robot.m4.compliant , false],
            [robot.m5.compliant , false],
            [robot.m6.compliant , false]);
  
  tween = new TWEEN.Tween(position);
  tween.to(endPosition, steps);
  tween.start(0);
  
});

