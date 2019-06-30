import {PoppyRobot} from './poppy/PoppyRobot.js';

export const robot = new PoppyRobot("http://ergo-twelve.home:8080");

//export const robot = new PoppyRobot("http://ergo-nine.cern.ch:8080");

//export const robot = new PoppyRobot("http://localhost:8080");

let stepCount = 0;
let steps = 10;
let tween = null;

var startPosition = {m1:10, m2:-30, m3:-30, m4:50,m5:30};
var position = Object.assign({}, startPosition);
var endPosition = { m1: 10, m2:-18, m3:-40, m4:20,m5:50 };

function stepPosition(){
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
$("#step").on("click", function(){
        stepPosition();
});

$("#reset").on("click", function(){
        stepCount = 0;
        stepPosition();
});
$("#undo").on("click", function(){
        stepCount=stepCount-2;
        if (stepCount < 0) stepCount = 0;
        stepPosition();
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

