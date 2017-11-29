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
    this.turkAssignment = false;
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
        currSample.setCurrLandmarkById(btn.currentTarget.innerText);
        this.manager.logger.addMsg("Change Tool: " + btn.currentTarget.innerText);

        // Update the example image
        $("#canvaseg").attr("src", "./static/lmrk_" + btn.currentTarget.innerText + ".jpg"); 
    },

    nextTool: function(){
        var currSample = this.testRun.getCurrSample();
        var currLandmarkId = currSample.getCurrLandmark().id;

        // Only execute if valid landmarks
        if ((currSample.currentLandmark + 1) < currSample.landmarks.length){

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
        if ((currSample.currentLandmark -1) <= 0){

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
                style: "visibility: visible;"});

            // Make the submit button visible to allow submission.
            // if this is a mechanical turk task
            if (this.turkAssignment){
                $("#results").val(results);
                $("#activity_log").val(activityLog);
                $("#submitButton").attr({
                    style: "visibility: visible;"});
                $("#nextButton").attr({
                    style: "visibility: hidden;"});

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
                    download: "data.json",
                    href: makeTextFile(JSON.stringify(data)),
                    style: "visiblity: visible;"});
                $("#check-warning-message").append(
                    "The data is ready for downloading! Please click on the link.  Thank you");
            }
        }
    },

    init: function(config){
        var assId = null, action = null, manager = null;
        var currSample = null, currLandmarkId = null;
        var form = $("#mturk_form")[0];
        this.config = config;
        loadConfigFromFile(this.config, this); // Load config

        // Get the mechanical turk details
        assId = get_param("assignmentId");
        action = get_param("turkSubmitTo");
        
        // If an id is available
        if (assId && action){
            this.turkAssignment = true;
            this.logger.addMsg("Valid MTurk assignment");

            // Update form submission
            form.action = action + "/mturk/externalSubmit";

            // Hide the warning message
            $(".alert").hide();
        }
        else {
            this.turkAssignment = false;
            this.logger.addMsg("NOT Valid MTurk assignment");
        }

        // Enable canvas mouse clicks
        manager = this;
        $("#canvasbox").on("mousedown", function(data){
            evt_canvas_mousedown(data, manager);
        });

        // Bind listener to next sample button
        $("#nextButton").on("mousedown", function(data){
            manager.nextSample();
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
        });

        this.toolbox = new Toolbox(this.changeTool);
    }
};
