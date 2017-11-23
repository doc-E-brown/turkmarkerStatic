// Test data.js
// Ben Johnston
// BSD 3-Clause 
// Thu Nov  9 13:51:29 AEDT 2017
"use strict";

// Test shuffling method
QUnit.test("test shuffle", function(assert){

    //Generate 100 numbers to shuffle
    var arr = [], arr2 = []
    for (var x = 0; x < 100; x++){
        arr.push(x);
        arr2.push(x);
    }
    arr = shuffle(arr);

    assert.notDeepEqual(arr, arr2);
});

// Test landmark definition
QUnit.test("test landmarks defaults", function (assert) {
    var lmrk = new Landmark();
    assert.equal(null, lmrk.x);
    assert.equal(null, lmrk.y);
    assert.equal(null, lmrk.id);
});

QUnit.test("test landmarks non-defaults", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    assert.equal(1, lmrk.x);
    assert.equal(2, lmrk.y);
    assert.equal("P1", lmrk.id);
});

// Test deep copy works
QUnit.test("test deep copy landmarks", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    lmrk.user_x = 3;
    lmrk.user_y = 4;
    lmrk.select_time = 12345;

    var lmrk2 = new Landmark();
    // Deep copy
    lmrk.deepCopy(lmrk2);

    // Change a value of lmrk and ensure lmrk2 doesn't have that value
    lmrk.user_x = 7;
    lmrk.user_y = 8;

    assert.notEqual(lmrk.user_x, lmrk2.user_x);
    assert.notEqual(lmrk.user_y, lmrk2.user_y);
});

// Test adding landmarks to set
QUnit.test("test add to sample", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    var samp = new Sample("test.png");
    samp.add(lmrk);
    samp.add(lmrk);

    assert.equal(samp.landmarks.length, 2);
    assert.equal(samp.filename, "test.png");
    assert.equal(lmrk.x, samp.landmarks[0].x);
    assert.equal(lmrk.y, samp.landmarks[0].y);
    assert.equal(lmrk.id, samp.landmarks[0].id);
});

// Test finding landmark by id in sample
QUnit.test("test find landmarks by id", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    var samp = new Sample("test.png");
    samp.add(lmrk);
    lmrk = new Landmark("P2", 3, 4);
    samp.add(lmrk);
    lmrk = new Landmark("P3", 5, 6);
    samp.add(lmrk);

    // Test able to find landmark
    var id = samp.findLandmarkById("P2");
    assert.equal(id, 1);

    // Test unable to find landmark
    id = samp.findLandmarkById("P4");
    assert.equal(id, -1);
});

QUnit.test("get landmark by id", function(assert){
    var samp = new Sample("test.png");
    var lmrk = new Landmark("P1", 1, 2);
    samp.add(lmrk);
    var lmrk_ref = new Landmark("P2", 3, 4);
    lmrk = new Landmark("P3", 5, 6);
    samp.add(lmrk_ref);
    samp.add(lmrk);

    // Test landmark is in set
    lmrk = samp.getLandmarkById("P2");
    assert.deepEqual(lmrk, lmrk_ref);

    // Test landmark is not in set
    lmrk = samp.getLandmarkById("P4");
    assert.equal(lmrk, null);

});

// test distance between user selected and estimated points
QUnit.test("test distance user and estimated points", function (assert){
    var lmrk = new Landmark("p1", 1, 2);
    lmrk.user_x = 3;
    lmrk.user_y = 4;
    var dist = lmrk.selectionDistance();
    dist = dist.toFixed(1);
    assert.equal(dist, 2.8);
});

// Test adding data
QUnit.test("test add sample", function(assert){
    var testRun = new TestRun(); // use locally scoped object
    testRun.replicates = 2; // 2 replicates
    testRun.add(1);
    testRun.add(2);

    assert.deepEqual([1, 2], testRun.samples);
});

// Test adding data
QUnit.test("test get current sample & landmark", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    var samp = new Sample("test.png");
    samp.add(lmrk);
    samp.add(lmrk);
    var testRun = new TestRun(); // use locally scoped object
    testRun.add(samp);
    testRun.add(samp);

    assert.deepEqual(testRun.getCurrSample(), samp)
    assert.deepEqual(testRun.getCurrSample().getCurrLandmark(), lmrk)
});

// Test setting the current landmark
QUnit.test("test setting current landmark by id", function(assert){
    var lmrk = new Landmark("P1", 1, 2);
    var samp = new Sample("test.png");
    samp.add(lmrk);
    var lmrk2 = new Landmark("P2", 3, 4);
    samp.add(lmrk2);

    // Change the current landmark
    samp.setCurrLandmarkById("P2");
    assert.equal(samp.currentLandmark, 1);
});

// Test validating the landmarks (all landmark valid)
QUnit.test("test validation of all correct landmarks", function(assert){
    var lmrk = new Landmark("P1", 1, 2, 1000);
    lmrk.user_x = 3;
    lmrk.user_y = 4;
    var samp = new Sample("test.png");
    samp.add(lmrk);
    var lmrk2 = new Landmark("P2", 3, 4, 1000);
    lmrk2.user_x = 5;
    lmrk2.user_y = 6;
    samp.add(lmrk2);

    var result = samp.validateLandmarks();

    assert.ok(samp.validLandmarks);
    assert.deepEqual(result[0], []);
    assert.deepEqual(result[1], [lmrk, lmrk2]);
});

// Test validating the landmarks (all landmark valid)
QUnit.test("test validation of one incorrect landmarks", function(assert){
    var lmrk = new Landmark("P1", 1, 2, 1000);
    lmrk.user_x = 3;
    lmrk.user_y = 4;
    var samp = new Sample("test.png");
    samp.add(lmrk);

    // Invalid landmark
    var lmrk2 = new Landmark("P2", 3, 4, 0);
    lmrk2.user_x = 5;
    lmrk2.user_y = 6;
    samp.add(lmrk2);

    var invalidLmrk = samp.validateLandmarks();

    assert.notOk(samp.validLandmarks);
    assert.deepEqual(invalidLmrk[0], [lmrk2]);
    assert.deepEqual(invalidLmrk[1], [lmrk]);
});


// Test duplicating and shuffling data
QUnit.test("test duplicate & shuffle", function(assert){
    var samples = 20;

    for (var replicate in [0, 1, 2, 3, 10]){
        var testRun = new TestRun(); // use locally scoped object
        testRun.replicates = replicate; 

        var template = []
        for(var x=0; x < samples; x++){
            testRun.add(new Sample(x));
            template.push(new Sample(x));
        }
        testRun.prepare();

        // Check the correct number of samples
        assert.equal(testRun.samples.length,
            samples * (Number(replicate) + 1),
            replicate + " replicates");

        // Ensure they are shuffled
        assert.notDeepEqual(template, testRun.samples);
    }
});


// Test select next sample
QUnit.test("test correct next sample update", function(assert){
    var lmrk = new Landmark("P1", 1, 2, 1000);
    var samp = new Sample("test.png");
    var samp2 = new Sample("test2.png");
    samp.add(lmrk);
    samp2.add(lmrk);

    lmrk = new Landmark("P2", 3, 4, 0);
    samp.add(lmrk);
    samp2.add(lmrk);

    var testRun = new TestRun(); 
    testRun.add(samp);
    testRun.add(samp2);

    var nextSamp = testRun.nextSample();
    assert.equal(testRun.currentSample, 1);
    assert.deepEqual(nextSamp, samp2);
});

// Test deep copying of sample
QUnit.test("test deep copy sample", function(assert){
    
    var lmrk = new Landmark("P1", 1, 2, 1000);
    var samp = new Sample("test.png");
    var samp2 = new Sample();
    samp.add(lmrk);

    // Execute deep copy
    samp.deepCopy(samp2);

    // Change some of the original values
    samp.filename = "new_filename.png";
    samp.landmarks[0].x = 5;
    samp.landmarks[0].y = 6;

    // Check the values have not copied across
    assert.notEqual(samp.filename, samp2.filename);
    assert.notEqual(samp.landmarks[0].x, samp2.landmarks[0].x);
    assert.notEqual(samp.landmarks[0].y, samp2.landmarks[0].y);
});


// Test loading the config file
QUnit.test("load configfile", function(assert){
    //Need to use global scope testRun object
    var mock_object = {
        "replicates": "1",
        "samples": {
            "1" : {
                "image": "image1.jpg",
                "landmarks": {
                    "P1" : {
                        "x" : "11",
                        "y" : "41",
                        "distLim": "1"
                    },
                    "P2" : {
                        "x" : "111",
                        "y" : "141",
                        "distLim": "2"
                    }
                }
            },
            "2": {
                "image": "image2.jpg",
                "landmarks": {
                    "P1" : {
                        "x" : "12",
                        "y" : "42",
                        "distLim": "3"
                    },
                    "P2" : {
                        "x" : "112",
                        "y" : "142",
                        "distLim": "4"
                    }
                }
            }
        }
    }
    var manager = new Manager();
    configCallBack(mock_object, manager); 
    assert.equal(manager.testRun.samples.length, 4);
    // Sample information
    assert.ok(manager.testRun.samples[0].filename === 'image1.jpg' ||
        manager.testRun.samples[0].filename === 'image2.jpg'
    );

    // Landmark information
    assert.ok(manager.testRun.samples[0].landmarks[0].id === 'P1' ||
        manager.testRun.samples[0].landmarks[1].id === 'P2'
    );
    assert.ok(manager.testRun.samples[0].landmarks[0].x === '11'||
        manager.testRun.samples[0].landmarks[0].x === '12'
    );
    assert.ok(manager.testRun.samples[0].landmarks[0].y === '41' ||
        manager.testRun.samples[0].landmarks[0].y === '42'
    );
    assert.ok(manager.testRun.samples[0].landmarks[0].distLim === '1' ||
        manager.testRun.samples[0].landmarks[0].distLim === '3'
    );
});

// Test landmark values are not copied to replicates of same sample
QUnit.test("Test selections not copied to replicates", function(assert){
    //Need to use global scope testRun object
    var manager = new Manager(); 
    var mock_object = {
        "replicates": "1",
        "samples": {
            "1" : {
                "image": "image1.jpg",
                "landmarks": {
                    "P1" : {
                        "x" : "11",
                        "y" : "41",
                        "distLim": "1"
                    },
                    "P2" : {
                        "x" : "111",
                        "y" : "141",
                        "distLim": "2"
                    }
                }
            }
        }
    }
    configCallBack(mock_object, manager); 
    assert.equal(manager.testRun.samples.length, 2);

    // Mock landmark selections no first sample 
    manager.testRun.samples[0].landmarks[0].user_x = 1;
    manager.testRun.samples[0].landmarks[0].user_y = 2;

    assert.notEqual(
        manager.testRun.samples[0].landmarks[0].user_x,
        manager.testRun.samples[1].landmarks[0].user_x
    );

    assert.notEqual(
        manager.testRun.samples[0].landmarks[0].user_y,
        manager.testRun.samples[1].landmarks[0].user_y
    );
});
