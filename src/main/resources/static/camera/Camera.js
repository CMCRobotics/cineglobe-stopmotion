import {PoppyRobot} from '../poppy/PoppyRobot.js';

class Camera{
    constructor(name, host, port, robotPort, path, index){
        this.name = name;
        this.host = host;
        this.port = port;
        this.robotPort = robotPort;
        this.path = path;
        this.index = index;
        this.stepCount = 1;
        this.currentStep = 0;
        this.motionEnabled = true;
        
        this.startPosition = null;
        this.position = null;
        this.endPosition = null;
        this.currentTween = null;

        this.robot = new PoppyRobot("http://"+this.host+":"+this.robotPort);
    }
    
    connect(){
        return Promise.all([this.robot.connect(),this.robot.setAll("present_speed",10.0)]);
    }
    
    /**
     * Adopt the settings of the given cam and reset steps
     */
    apply(cam){
        this.motionEnabled = cam.motionEnabled;
        this.stepCount = cam.stepCount;
        this.currentStep = 0;
        this.startPosition = cam.startPosition;
        this.position = cam.position;
        this.endPosition = cam.endPosition;
        this.currentTween = cam.currentTween;
    }
    
    captureStartPosition(){
        Promise.all(this.robot.getAll("present_position")).then(axios.spread(function(v1,v2,v3,v4,v5,v6){
            this.startPosition = { m1:v1.data,m2:v2.data,m3:v3.data,m4:v4.data,m5:v5.data,m6:v6.data };
        }.bind(this))).catch(function(error){
            throw error;
        });
    }
    captureEndPosition(){
        return Promise.all(this.robot.getAll("present_position")).then(axios.spread(function(v1,v2,v3,v4,v5,v6){
            this.endPosition = { m1:v1.data,m2:v2.data,m3:v3.data,m4:v4.data,m5:v5.data,m6:v6.data };
            this.position = Object.assign({}, this.startPosition);
            this.currentTween = new TWEEN.Tween(this.position);
            this.currentTween.to(this.endPosition, this.stepCount);
            this.currentTween.start(0);
        }.bind(this))).catch(function(error){
            throw error;
        });
    }
    
    stepForward(){
        if(this.motionEnabled){
            this.currentTween.update(this.currentStep);
            var robot = this.robot;
            robot.set([robot.m1.goal_position,this.position.m1]
                     ,[robot.m2.goal_position,this.position.m2]
                     ,[robot.m3.goal_position,this.position.m3]
                     ,[robot.m4.goal_position,this.position.m4]
                     ,[robot.m5.goal_position,this.position.m5]
                     ,[robot.m6.goal_position,this.position.m6])
                     .then(function(response){
                             console.log("Step! "+this.currentStep+"/"+this.stepCount);
                     }.bind(this));
            if(this.currentStep < this.stepCount){
                this.currentStep++;
            }
        }
    }
    
    stepBack(){
        if(this.motionEnabled){
            this.currentStep = this.currentStep -2;
            if(this.currentStep < 0){
                this.currentStep = 0;
            }
            this.stepForward();
        }
        
    }
    
    
    releaseMotors(){
        return Promise.all(this.robot.setAll('compliant' , true).concat(this.robot.setAll('led' , '\"green\"')));
    }
    activateMotors(){
        // Activate a timeout for the motors to release if they don't move in a while (release / step / undo
        return Promise.all(this.robot.setAll('compliant' , false).concat(this.robot.setAll('led' , '\"off\"')));
    }
    

    resume(){
        this.activateMotors().then(function(){
           if(this.motionEnabled){
               this.currentStep --;
               this.stepForward();
           }
        }.bind(this));
    }
    
    previewMovement(){
        try{
            // Perform all steps, then reset the step counter
            // then release the motors (using the release motors);
                var robot = this.robot;
                Promise.all(this.robot.setAll('compliant' , false)).then( function(){
                    robot.set([robot.m1.goal_position,this.startPosition.m1]
                            ,[robot.m2.goal_position,this.startPosition.m2]
                            ,[robot.m3.goal_position,this.startPosition.m3]
                            ,[robot.m4.goal_position,this.startPosition.m4]
                            ,[robot.m5.goal_position,this.startPosition.m5]
                            ,[robot.m6.goal_position,this.startPosition.m6])
                    .then(function(response){
                          setTimeout(function(){
                              this.robot.set([this.robot.m1.goal_position,this.endPosition.m1]
                                       ,[this.robot.m2.goal_position,this.endPosition.m2]
                                       ,[this.robot.m3.goal_position,this.endPosition.m3]
                                       ,[this.robot.m4.goal_position,this.endPosition.m4]
                                       ,[this.robot.m5.goal_position,this.endPosition.m5]
                                       ,[this.robot.m6.goal_position,this.endPosition.m6]).then( 
                                               function(){
                                                setTimeout(function(){this.robot.setAll('compliant' , true)}, 1000);
                                               }.bind(this));
                          }.bind(this)
                          , 2000);
                      }.bind(this));
                }.bind(this));
        }catch(error){
            console.log("Preview error");
            throw error;
        }
    }
    
}

export{
    Camera
}