// Test data.js
// Ben Johnston
// BSD 3-Clause 
// Wed Nov 22 08:36:29 AEDT 2017

"use strict";

QUnit.test("update canvas set", function (assert){

    var manager = new Manager();
    manager.init();

    var done = assert.async();
    // Create new canvas set and update background images
    var landmark = {};
    landmark.x = "1";
    landmark.y = "1";
    landmark.id = "P1";

    var sample = {};
    sample.filename = "test_img.jpg";
    sample.width = 400;
    sample.height = 407;
    sample.landmarks = [landmark];

    var mock_object = {};
    mock_object.samples = [sample, sample];

    manager.canvas.updateCanvasSet(sample, manager);

    setTimeout(function() {
        // Check the correct number of canvases
        assert.equal($("#canvasbox").children.length, 2);

        //Check the canvases have height and width of the sample
        assert.equal($("#P1_canvas").width(), 400);
        assert.equal($("#P1_canvas").height(), 407);
        done()
    });

});

QUnit.test("test canvas img", function(assert){
    var manager = new Manager();
    // Test correct change of canvas image
    var img = "test_img.jpg";
    manager.canvas.setImage(img);
    assert.equal($('#canvasbg').attr("src"), "./static/" + img);
});
