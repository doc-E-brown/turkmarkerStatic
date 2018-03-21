// Manage the data
//
var ASSIGNMENT_TYPES = {
    SERVER: 'SERVER',
    DOWNLOAD: 'DOWNLOAD',
    OTHER:' OTHER' 
}

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
    this.assignmentId = "noAssId";
    this.assignmentType = null;
    this.showAllLandmarks = true;
}

function validate_landmarks(currSample, showAllLandmarks){

    $("#check-warning-message").attr({
        style: "margin-top: 20px; display: none; visibility: hidden;"});

    // Get landmarks validation status
    $("#check-warning-message").empty();
    var validMarks = currSample.validateLandmarks();
    var currLandmark = currSample.getCurrLandmark();

    // Mark invalid landmarks
    var landmark = null;
    var msg = "";
    var warnString = [];

    // Clear out the message buffer
    for (var x = 0; x < validMarks[0].length; x++){
        landmark = validMarks[0][x];

        if (showAllLandmarks || (landmark.id == currLandmark.id)) { 
            manager.canvas.markInvalid(
                landmark.user_x, landmark.user_y, landmark.id);
        }
        
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

    // Mark all valid landmarks
    for (var x = 0; x < validMarks[1].length; x++){
        landmark = validMarks[1][x];
        if (showAllLandmarks || (landmark.id == currLandmark.id)) { 
            manager.canvas.markValid(
                landmark.user_x, landmark.user_y, landmark.id);
        }
    }

    // Check for all valid landmarks
    if (currSample.validLandmarks){
        // Display next sample button
        $("#nextButton").attr({
            style: "visibility: visible;",
        });
    }
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
    manager.logger.addMsg("Point Select: " + 
        currLandmark.id + "(" + x + "," + y + ")");

    validate_landmarks(currSample, manager.showAllLandmarks);
}

function evt_toggle_landmarks(e, manager){
    if (manager.showAllLandmarks){
        manager.showAllLandmarks = false;
        $("#toggleLandmarks").text("Show All Landmarks");
        manager.clearAllCanvases();
    }
    else {
        manager.showAllLandmarks = true;
        $("#toggleLandmarks").text("Hide All Landmarks");
        manager.showAllCanvases();
    }
}

Manager.prototype = {

    changeTool: function(btn){
        var currSample = this.manager.testRun.getCurrSample();
        currSample.setCurrLandmarkById(btn.currentTarget.innerText);
        this.manager.logger.addMsg("Change Tool: " + btn.currentTarget.innerText);

        // Update the example image
        $("#canvaseg").attr("src", "./static/lmrk_" + btn.currentTarget.innerText + ".jpg"); 

        // Clear landmark if required
        if (!this.manager.showAllLandmarks){
            this.manager.clearAllCanvases();
        }

    },

    clearAllCanvases: function(){
        var currSample = this.testRun.getCurrSample();
        for (var i = 0; i < currSample.landmarks.length; i++){
            this.canvas.clearCanvas(currSample.landmarks[i].id);
        }
    },

    showAllCanvases: function(){
        var currSample = this.testRun.getCurrSample();
        validate_landmarks(currSample, this.showAllLandmarks);
    },


    nextTool: function(){
        var currSample = this.testRun.getCurrSample();
        var currLandmarkId = currSample.getCurrLandmark().id;

        // Only execute if valid landmarks
        if ((currSample.currentLandmark + 1) < currSample.landmarks.length){

            // Clear landmark if required
            if (!this.showAllLandmarks){
                this.clearAllCanvases();
            }

            // Disable the current landmark button
            $("#label_" + currLandmarkId).attr({
                class: "btn btn-default"});

            var nextLandmarkId = currSample.landmarks[currSample.currentLandmark + 1].id;
            currSample.setCurrLandmarkById(nextLandmarkId);

            $("#label_" + nextLandmarkId).attr({
                class: "btn btn-default active"});

            this.logger.addMsg("Change Tool: " + nextLandmarkId);

            // Update the example image
            $("#canvaseg").attr("src", "./static/lmrk_" + nextLandmarkId + ".jpg"); 
        }
    },

    prevTool: function(){
        var currSample = this.testRun.getCurrSample();
        var currLandmarkId = currSample.getCurrLandmark().id;

        // Only execute if valid landmarks
        if ((currSample.currentLandmark - 1) >= 0){
            
            // Clear landmark if required
            if (!this.showAllLandmarks){
                this.clearAllCanvases();
            }

            // Disable the current landmark button
            $("#label_" + currLandmarkId).attr({
                class: "btn btn-default"});

            var nextLandmarkId = currSample.landmarks[currSample.currentLandmark - 1].id;
            currSample.setCurrLandmarkById(nextLandmarkId);

            $("#label_" + nextLandmarkId).attr({
                class: "btn btn-default active"});

            this.logger.addMsg("Change Tool: " + nextLandmarkId);

            // Update the example image
            $("#canvaseg").attr("src", "./static/lmrk_" + nextLandmarkId + ".jpg"); 
        }
    },


    updateProgressBar: function() {
        // Update the progress bar
        currSamp = parseFloat(this.testRun.currentSample);
        progress = 100 * (currSamp) / parseFloat(this.testRun.samples.length);

        $(".progress-bar").css('width', progress + "%").attr('aria-valuenow',progress);
    },

    nextSample: function(){

        var sample = null;
        var msg = "Next Sample Selected: From " + this.testRun.currentSample;

        // Move to the next sample
        sample = this.testRun.nextSample();
        this.updateProgressBar();

        $("#nextButton").attr({
            style: "visibility: hidden;"});

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

            $("#check-warning-message").attr({
                class: "alert alert-success", 
                style: "margin-top: 20px; visibility: visible;"});

            // Make the submit button visible to allow submission.
            // if this is a SERVER based task 
            if (this.assignmentType == ASSIGNMENT_TYPES.SERVER){
                $("#results").val(results);
                $("#activity_log").val(activityLog);
                $("#submitButton").attr({
                    style: "visibility: visible;"});
                $("#nextButton").attr({
                    style: "visibility: hidden;"});

                $("#check-warning-message").empty();
                $("#check-warning-message").append(
                    "Press Submit to complete the task.  Thank you!");

                this.logger.addMsg("Ready to submit");
            }
            // Not a mechanical turk task, download the data
            else {

                var textFile = null,
                //this.logger.addMsg("Data ready for download");

                makeTextFile = function (text) {
                    var data = new Blob([text], {type: 'text/json'});

                    // If we are replacing a previously generated file we need to
                    // manually revoke the object URL to avoid memory leaks.
                    if (textFile !== null) {
                      window.URL.revokeObjectURL(textFile);
                    }

                    textFile = window.URL.createObjectURL(data);

                    // returns a URL you can use as a href
                    return textFile;
                };

                var data = {
                    results: this.testRun,
                    activityLog: this.logger,
                }
                // Create download file
                $("#no_turk_data").attr({
                    download: this.assignmentId + ".json",
                    href: makeTextFile(JSON.stringify(data)),
                    style: "visiblity: visible;"});
                $("#check-warning-message").empty();
                $("#check-warning-message").append(
                    "The data is ready for downloading! Please click on the link.  Thank you!");
            }
        }
    },

    init: function(config){
        var assId = null, action = null, manager = null;
        var currSample = null, currLandmarkId = null;
        var form = $("#mturk_form")[0];
        this.config = config;
        loadConfigFromFile(this.config, this); // Load config


        // Enable canvas mouse clicks
        manager = this;
        $("#canvasbox").on("mousedown", function(data){
            evt_canvas_mousedown(data, manager);
        });

        // Bind listener to next sample button
        $("#nextButton").on("mousedown", function(data){
            manager.nextSample();
        });

        $("#toggleLandmarks").on("mousedown", function(data){
            evt_toggle_landmarks(data, manager);
        });

        // Bind keypress events
        $(document).keypress(function (evt){
            if (document.activeElement.nodeName === "INPUT") {
                return; // don't interrupt form typing
            }
            var key = String.fromCharCode(evt.keyCode || evt.which);

            // Forward and back
            if (key == "f") {
                manager.nextTool();
            }
            else if (key == "b"){
                manager.prevTool();
            }
            else if (key == "h"){
                if (manager.showAllLandmarks){
                    manager.showAllLandmarks = false;
                $("#toggleLandmarks").text("Show All Landmarks");
                    manager.clearAllCanvases();
                }
                else {
                    manager.showAllLandmarks = true;
                $("#toggleLandmarks").text("Hide All Landmarks");
                    manager.showAllCanvases();
                }
            }
        });

        this.toolbox = new Toolbox(this.changeTool);
    }
};
