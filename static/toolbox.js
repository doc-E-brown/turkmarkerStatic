// Javascript for managing toolbox and tool selection 
// Ben Johnston
// BSD 3-Clause 
// Wed Nov 15 09:51:00 AEDT 2017
//
function Toolbox(landmarkCallback) {
    this.toolbox = $("#toolbox");
    this.currentTool = null;
    this.landmarkCallback = landmarkCallback;
}

Toolbox.prototype = {

    init: function(){
        this.toolbox.empty();
    },

    addTool: function(id, firstLandmark){
        var labelCallback = this.landmarkCallback;
        var label = $("<label/>");
        if (firstLandmark){
            label.attr({
                class:"btn btn-default active",
                id: "label_" + id
            });
        }
        else{
            label.attr({
                class:"btn btn-default",
                id: "label_" + id
            });
        }

        label.text(id);

        // Manage click behaviour
        label.on('click', function(btn){
            labelCallback(btn);
        });

        //Remove the button?  Only label needed?
        var button = $("<input/>");
        button.attr({
            id: id,
            name: "tools",
            value: id,
            type: "radio",
        });
        label.append(button);
        this.toolbox.append(label);
    },

}
