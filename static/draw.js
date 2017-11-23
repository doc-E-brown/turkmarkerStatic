/* Javascript functions to draw on canvas */
"use strict";

function Canvas(){
    this.canvasbox = $("#canvasbox");
    this.canvasbg = $("#canvasbg");

    // Drawing parameters
    this.drawParams = {
        "strokeStyle" : "white",
        "fillStyle" : "white",
        "textAlign" : "alphabetic",
        "textBaseline" : "right",
        "font" : "10pt sans-serif",
        "lineWidth" : 2,
    };

    this.validColour = "green";
    this.neutralColour = "white";
    this.invalidColour = "red";

    this.radius = 3;
    this.pinHeight = 2;
}

Canvas.prototype = {

    setImage: function(image){
        this.canvasbg.attr("src", "./static/" + image);
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
                    manager.toolbox.addTool(sample.landmarks[lmrk].id);

                    if (firstSample){
                        $("#canvaseg").attr("src", "./static/lmrk_" + id + ".jpg"); 
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

    drawPoint: function(x, y, landmark){
        // Get the current tool
        var canvas = document.getElementById(landmark + "_canvas");
        if (canvas.getContext){
            var ctx = canvas.getContext('2d');
            this.configureCanvas(ctx);

            // Clear existing points
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw new points
            // Need begin and end path to ensure lines
            // are being cleared
            ctx.beginPath()
            ctx.arc(x, y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            ctx.fillText(landmark, x, y);
        }
    },

    markValid: function(x, y, landmark){
        // Set the color 
        this.drawParams["strokeStyle"] = this.validColour;
        this.drawParams["fillStyle"] = this.validColour;
        this.drawPoint(x, y, landmark);
        this.drawParams["strokeStyle"] = this.neutralColour;
        this.drawParams["fillStyle"] = this.neutralColour;
    },

    markInvalid: function(x, y, landmark){
        // Set the color 
        this.drawParams["strokeStyle"] = this.invalidColour;
        this.drawParams["fillStyle"] = this.invalidColour;
        this.drawPoint(x, y, landmark);
        this.drawParams["strokeStyle"] = this.neutralColour;
        this.drawParams["fillStyle"] = this.neutralColour;
    },

}


