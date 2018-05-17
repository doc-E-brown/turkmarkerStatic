// Javascript for loading and defining test information
// 
// Ben Johnston
// BSD 3-Clause 
// Wed Nov  8 14:34:51 AEDT 2017

function shuffle(array) {
    //Shuffle array using the Fisher-Yates method
    //https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
    return array;
}

function Landmark(id, x, y, dist){
    this.id = id; // Unique landmark identifier
    this.x = x; // x coordinate 
    this.y = y; // y coordinate
    this.distLim = dist; // distance limit

    // user selection  
    this.user_x = null;
    this.user_y = null;
    this.select_time = null;
}

Landmark.prototype = {

    userSelection: function(x, y){
        var d = new Date();
        this.user_x = x;
        this.user_y = y;
        this.select_time = d.getTime();
    },

    selectionDistance: function(){
        var dx = 0, dy = 0;
        if ((this.user_x != null) && (this.user_y != null)){
            dx = Math.pow(this.x - this.user_x, 2);
            dy = Math.pow(this.y - this.user_y, 2);

            return Math.sqrt(dx + dy);
        }
        return null;
    },

    deepCopy: function(newLandmark){
        for (var attr in this){
            newLandmark[attr] = this[attr];
        }
    }
}

function Sample(filename, width, height) {
    this.filename = filename;
    this.width = width;
    this.height = height;
    this.landmarks = [];
    this.currentLandmark = 0;
    this.validLandmarks = false;
}

Sample.prototype = {

    add: function(landmark){
        //Add landmark to set
        this.landmarks.push(landmark);
    },

    shuffle: function(){
        this.landmarks = shuffle(this.landmarks); 
    },

    findLandmarkById: function(id){
        var x = 0;

        for (x = 0; x < this.landmarks.length; x++){
            if (this.landmarks[x].id === id){
                return x;
            }
        }
        return -1;
    },

    getLandmarkById: function(id){
        var idx = this.findLandmarkById(id);
        if (idx >= 0){
            return this.landmarks[idx];}
        return null;
    },

    getCurrLandmark: function(){
        return this.landmarks[this.currentLandmark];
    },

    setCurrLandmarkById: function(id){
        this.currentLandmark = this.findLandmarkById(id);
    },

    validateLandmarks: function(){
        // The first list in result is a list of invalid landmarks
        // The second list in results is a list of valid landmarks
        var result = [[], []];
        var idx = 0, x = 0, dist = 0;
        for (x = 0; x < this.landmarks.length; x++){
            dist = this.landmarks[x].selectionDistance();

            if (!dist){continue;}

            // If distance is greater than limit add landmark to list
            // of invalid landmarks
            if (dist > this.landmarks[x].distLim){ idx = 0; }
            // else add to list of valid landmarks
            else { idx = 1; }

            result[idx].push(this.landmarks[x]);
        }
        // Update the sample tag
        this.validLandmarks = (result[1].length === this.landmarks.length);
        return result;
    },

    deepCopy: function(newSample){
        for (var attr in this){

            // Use the Landmark deep copy method to copy landmarks
            if (attr === 'landmarks'){
                for (var x = 0; x < this.landmarks.length; x++){
                    var lmrk = new Landmark();
                    this.landmarks[x].deepCopy(lmrk);
                    newSample.landmarks[x] = lmrk;
                }
            }
            else {
                newSample[attr] = this[attr];
            }
        }
    },
}

function TestRun(){
    this.replicates = null;
    this.currentSample = 0;
    this.samples = [];
}

TestRun.prototype = {

    add: function(sample){
        this.samples.push(sample);
    },

    prepare: function(){
        // Duplicate samples

        var tmp_samples = []; 
        var i = 0, j = 0, item = null;
        var samp = null;

        // # replicates is in addition to a single run
        for (i = 0; i < (Number(this.replicates) + 1); i++){
            for (j = 0; j < this.samples.length; j++){

                samp = new Sample();
                // Must use deep copy due to arrays being
                // references to initial objects
                this.samples[j].deepCopy(samp);
                tmp_samples.push(samp);
            }
        }
        //Shuffle samples
        this.samples = shuffle(tmp_samples);
        //for (j = 0; j < this.samples.length; j++){
        //    console.log(this.samples[j].filename);
        //}

    },

    getCurrSample: function(){
        return this.samples[this.currentSample];
    },

    nextSample: function(){
        if (this.currentSample < this.samples.length){
            this.currentSample += 1;
            return this.getCurrSample();
        }
        return null;
    },
}

function configCallBack(data, manager){
    var samp = null, action = null, sample = null, lmrk = null;
    var landmark = null;
    var currLandmarkId = null;

    // Parse the config data
    manager.assignmentType = data['assignmentType'];
    manager.action = data['form_action']

    // Parse the drawing configuration
    for (param in data['drawing']){
        manager.canvas[param] = data['drawing'][param];
    }
    manager.canvas.updateDrawParams();

    // Test configuration data
    manager.testRun.replicates = data['replicates'];

    for (samp in data['samples']){
        sample = new Sample(
            data['samples'][samp]['image'],
            data['samples'][samp]['width'],
            data['samples'][samp]['height']
        );

        for (lmrk in data['samples'][samp]['landmarks']){
            landmark = new Landmark(
                lmrk,
                data['samples'][samp]['landmarks'][lmrk]['x'],
                data['samples'][samp]['landmarks'][lmrk]['y'],
                data['samples'][samp]['landmarks'][lmrk]['distLim']
            );
            sample.add(landmark);
        }
        manager.testRun.samples.push(sample);
    }

    // Prepare the data
    manager.testRun.prepare()

    // Update the canvas
    manager.canvas.updateCanvasSet(
        manager.testRun.getCurrSample(),
        manager
    );

    // Assignment is SERVER based with id and submission info 
    var ass_id = get_param('assignmentId');
    if (ass_id && manager.action && (manager.assignmentType == ASSIGNMENT_TYPES.SERVER)){
        manager.logger.addMsg("Valid MTurk assignment");

        // Update form submission
        $("#mturk_form")[0].action = manager.action + "/mturk/externalSubmit";

        // Hide the warning message
        $(".alert").hide();
    }
    // This is a file download assignment
    else if (manager.assignmentType == ASSIGNMENT_TYPES.DOWNLOAD){

        manager.logger.addMsg("Valid assignment ID");

        // This is still a valid assignment
        // Hide the warning message
        $(".alert").hide();
    }

    // Invalid assignment configuration
    // The system will still work, but the warning message will appear
    else {
        manager.logger.addMsg("Invalid assignment ID and action");
    }


}

function loadConfigFromFile(config, manager){
    // Defer loading for speed
    manager.logger.addMsg("Loading config file: " + config);
    var load_config = $.getJSON(config)
        
    load_config.then(function () {
        configCallBack(arguments[0], manager);});
}
