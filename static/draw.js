/* Javascript functions to draw on canvas */
"use strict";

function Canvas(){
    this.canvasbox = $("#canvasbox");
    this.canvasbg = $("#canvasbg");

    // Drawing parameters
    this.lineWidth = "4";
    this.textAlign = "alphabetic";
    this.textBaseline = "right";
    this.font = "10pt sans-serif";

    this.drawParams = {
        'lineWidth': this.linewidth,
        'textAlign': this.textAlign,
        'textBaseline': this.textBaseline,
        'font': this.font
    }

    this.validFillColour = "green";
    this.validStrokeColour = "green";
    this.validTextColour = "green";
    this.invalidFillColour = "red";
    this.invalidStrokeColour = "red";
    this.invalidTextColour = "red";

    this.radius = 3;
    this.pinHeight = 3;

}

Canvas.prototype = {

    updateDrawParams: function(){
        for (var param in this.drawParams){
            this.drawParams[param] = this[param];
        }
    },

    setImage: function(image){
        this.canvasbg.attr("src", "./static" + image);
    },

    // Update the canvas for a particular sample
    updateCanvasSet: function(sample, manager) { 
        $.when(this.setImage(sample.filename)).then(
            function()
            {
                // Shuffle the order of the landmarks
                var tmp_landmarks = shuffle(sample.landmarks);

                // Empty the canvas box
                manager.canvas.canvasbox.empty();

                var firstSample = true;

                // Initialise the toolbox
                manager.toolbox.init();

                var firstLandmark = true;
                for (var lmrk in tmp_landmarks){
                    // Create a canvas for each of the landmarks
                    var canvas = $("<canvas/>");
                    var id = sample.landmarks[lmrk].id;
                    var width = sample.width;
                    var height = sample.height;
                    canvas.attr({
                        id: id + "_canvas",
                        width: width,
                        height: height 
                    });
                    manager.canvas.canvasbox.append(canvas);

                    // Create a point selection tool for each landmark
                    manager.toolbox.addTool(sample.landmarks[lmrk].id, firstLandmark);
                    firstLandmark = false;

                    if (firstSample){
                        $("#canvaseg").attr("src", "./static/lmrk_" + id + ".jpg"); 
                        $("#canvaseg").attr("style", "position: absolute; left: " + (width + 10) + "px; top: 0px"); 
                        firstSample = false;
                    }
                }
            });
    },

    configureCanvas: function(ctx){
        for (var param in this.drawParams){
            ctx[param] = this.drawParams[param];
        }
    },

    clearCanvas: function(landmark){
        var canvas = document.getElementById(landmark + "_canvas");
        var ctx = canvas.getContext('2d');

        // Clear everything
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    },

    drawPoint: function(x, y, landmark, fillColour, strokeColour, textColour){
        // Get the current tool
        var canvas = document.getElementById(landmark + "_canvas");
        if (canvas.getContext){
            var ctx = canvas.getContext('2d');
            this.configureCanvas(ctx);

            ctx['fillStyle'] = fillColour;
            ctx['strokeStyle'] = strokeColour;

            // Clear existing points
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw new points
            // Need begin and end path to ensure lines
            // are being cleared
            ctx.beginPath()
            ctx.arc(x, y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            ctx['fillStyle'] = textColour;
            ctx.fillText(landmark, x, y - parseInt(this.pinHeight));
        }
    },

    markValid: function(x, y, landmark){
        // Set the color 
        this.drawPoint(x, y, landmark, 
            this.validFillColour,
            this.validStrokeColour,
            this.validTextColour,
        );
    },

    markInvalid: function(x, y, landmark){

        this.drawPoint(x, y, landmark, 
            this.invalidFillColour,
            this.invalidStrokeColour,
            this.invalidTextColour,
        );
    },

}


