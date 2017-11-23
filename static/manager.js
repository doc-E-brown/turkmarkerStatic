// Manage the data
//
//
// Retrieve GET parameters from address bar
function get_param (param, default_value) {
    "use strict";
    var res = new RegExp(param + "=([^&#]*)").exec(window.location.search);
    return res && decodeURIComponent(res[1]) || default_value || "";
}

function Manager() {
    this.canvas = new Canvas("#canvasbg");
    this.testRun = new TestRun();
    this.logger = new Logger();
}

function evt_canvas_mousedown(e, manager) {
    var appbox = $("#appbox");
    var x = e.pageX - appbox[0].offsetLeft;
    var y = e.pageY - appbox[0].offsetTop;

    // Store record
    var currSample = manager.testRun.getCurrSample();
    var currLandmark = currSample.getCurrLandmark();
    currLandmark.userSelection(x, y);

    // Draw point
    manager.canvas.drawPoint(x, y, currLandmark.id);
    var validMarks = currSample.validateLandmarks();
    manager.logger.addMsg("Point Select: " + 
        currLandmark.id + "(" + x + "," + y + ")");

    // Mark invalid landmarks
    var landmark = null;
    var msg = "";
    var warnString = [];

    // Clear out the message buffer
    $("#check-warning-message").empty();
    for (var x = 0; x < validMarks[0].length; x++){
        landmark = validMarks[0][x];
        manager.canvas.markInvalid(
            landmark.user_x, landmark.user_y, landmark.id);
        
        // Update the warning string
        msg = landmark.id + " is not in a valid position"
        warnString.push(msg);

        manager.logger.addMsg("Warning String Update: " + msg);
    }
    
    // If there are any invalid landmarks update the user message
    if (warnString.length != 0){
        for (var x = 0; x < warnString.length; x++){
            var para = $("<p/>");
            para.text(warnString[x]);
            $("#check-warning-message").append(para);
        }
        $("#check-warning-message").attr({
            style: "visibility: visible;"});
    }
    else{
        $("#check-warning-message").attr({
            style: "visibility: hidden;"});
    }

    // Mark valid landmarks
    for (var x = 0; x < validMarks[1].length; x++){
        landmark = validMarks[1][x];
        manager.canvas.markValid(
            landmark.user_x, landmark.user_y, landmark.id);
    }

    // Check for all valid landmarks
    if (currSample.validLandmarks){
        // Display next sample button
        $("#nextButton").attr({
            style: "visibility: visible;",
        });
    }
}

Manager.prototype = {

    changeTool: function(btn){
        var currSample = this.manager.testRun.getCurrSample();
        currSample.findLandmarkById(
            btn.currentTarget.innerText);
        currSample.setCurrLandmarkById(btn.currentTarget.innerText);
        this.manager.logger.addMsg("Change Tool: " + btn.currentTarget.innerText);

        // Update the example image
        $("#canvaseg").attr("src", "./static/lmrk_" + btn.currentTarget.innerText + ".jpg"); 
    },

    nextSample: function(){

        var sample = null;
        var msg = "Next Sample Selected: From " + this.testRun.currentSample;

        // Move to the next sample
        sample = this.testRun.nextSample();

        // If there is a next sample use it
        if (sample){

            // Update the canvas
            this.canvas.updateCanvasSet(sample, this);
            msg += " To: " + this.testRun.currentSample;

            // Log the message
            this.logger.addMsg(msg);
        }

        // All samples have been completed, time to submit
        else{
            var results = JSON.stringify(this.testRun);
            var activityLog = JSON.stringify(this.logger);

            $("#results").val(results);
            $("#activity_log").val(activityLog);
        }


    },

    init: function(config){
        this.config = config;
        loadConfigFromFile(this.config, this); // Load config

        // Enable canvas mouse clicks
        var manager = this;
        $("#canvasbox").on("mousedown", function(data){
            evt_canvas_mousedown(data, manager);
        });

        // Bind listener to next sample button
        $("#nextButton").on("mousedown", function(data){
            manager.nextSample();
        });

        this.toolbox = new Toolbox(this.changeTool);
    }
};
