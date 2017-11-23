/*jshint browser: true, strict: true*/
/*global $, jQuery*/

var landmark_data = {};
var logger_data = [];

function update_data(name, value) {
    "use strict";

    //Subtract image padding
    var img = $("#canvasbg");
    value[0] = value[0] - parseInt(img.css('padding-left'));
    value[1] = value[1] - parseInt(img.css('padding-top'));
    landmark_data[name] = value;
    $("#form-marks")[0].value = JSON.stringify(landmark_data);
    update_submit();
    add_log("data-" + name, value);
}

function add_log(name, payload) {
    "use strict";
    var data = [Date.now(), name, payload];
    logger_data.push(data);
    $("#logger")[0].value = JSON.stringify(logger_data);
}

function update_help() {
    "use strict";
    var tool = Toolbox.info();
    var helpurl = get_param("helpurl", "protocol/protocol.html")
    $("#infobox-content").html(
        '<b>' + tool.label + '</b>: ' + tool.help + ' <a href="' + helpurl + '#' + tool.anchor + '" target="_blank">More info</a>'
    );
}

function set_canvaseg(tool){
    $("#canvaseg").attr("src", example_img.replace(/P[0-99].jpg/g,'') + tool + '.jpg');
}

function evt_keydown(evt) {
    "use strict";
    if (document.activeElement.nodeName === "INPUT") {
        return; // don't interrupt form typing
    }
    var key = String.fromCharCode(evt.keyCode || evt.which);
    if (key == "f") {
        var tools = Object.keys(Toolbox.tools);
        var idx = tools.indexOf(Toolbox.active());
        if (idx > -1 && idx < tools.length) {
            var tool = tools[idx + 1];
            set_canvaseg(tool);
            $("#" + tool).click();
            add_log("key-forward", tool);
        }
    } else if (key == "b") {
        var tools = Object.keys(Toolbox.tools);
        var idx = tools.indexOf(Toolbox.active());
        if (idx > 0 && idx <= tools.length) {
            var tool = tools[idx - 1];
            set_canvaseg(tool);
            $("#" + tool).click();
            add_log("key-back", tool);
        }
    }
}

function evt_submit (evt) {
    "use strict";
    if (update_submit()) {
        // can submit!
        add_log("submission", "");
        if (!get_param("turkSubmitTo")) {
            evt.preventDefault();
            window.location.href = "data:application/json;base64," + window.btoa($("#form-marks")[0].value)
        }
    } else {
        evt.preventDefault();
    }
}

function evt_review (evt) {
    "use strict";
    var parsed = JSON.parse($("#review")[0].value);
    for (var ii in parsed) {
        if (parsed.hasOwnProperty(ii))
            draw_landmark(parsed[ii][0], parsed[ii][1], ii);
    }
}

function review_on(txt) {
    "use strict";
    var rev = $("#review");
    rev.css("display", "block");
    rev.on("change", evt_review);
    rev[0].value = txt;
    evt_review();
}

function update_submit () {
    "use strict";
    var have = Object.keys(landmark_data);
    var want = Object.keys(Toolbox.tools);
    for (var ii = 0; ii < have.length; ii++) {
        if (want.indexOf(have[ii]) > -1) {
            $("#" + have[ii]).parent().css("text-decoration", "line-through");
        }
    }

    var warning = $("#check-warning-message");
    var checkmsg = check(landmark_data);
    if (checkmsg.length > 0) {
        var warnings = checkmsg.join("<br>");
        warning.html("<b>Warning:</b><br>" + warnings);
        warning.css("display", "block");
    } else {
        warning.css("display", "none");
    }
    $("#warnings")[0].value = JSON.stringify(checkmsg)

    var submit = $("#submitButton")[0];
    if (have.length < want.length) {
        submit.disabled = true;
        submit.textContent = "Need " + (want.length - have.length) + " more points";
        submit.className = "btn btn-warning btn-large";
        return false;
    } else {
        submit.disabled = false;
        if (get_param("turkSubmitTo")) {
            submit.textContent = "Submit task";
        } else {
            submit.textContent = "Download data";
        }
        submit.className = "btn btn-primary btn-large";
        return true;
    }
}

function evt_mousedown(e) {
    "use strict";
    var tool = Toolbox.info();
    var appbox = $("#appbox");
    var x = e.pageX - appbox[0].offsetLeft;
    var y = e.pageY - appbox[0].offsetTop;
    clear_canvas(tool.ctx);
    var ret;
    switch (tool.kind) {
        case "point":
            ret = draw_point(tool.ctx, x, y, tool.label);
            break;
        case "line":
            appbox.on("mousemove", evt_mousemove);
            appbox.on("mouseup", evt_mouseup);
            draw_start_line(tool.ctx, x, y, tool.label);
            break;
        case "curve":
            appbox.on("mousemove", evt_mousemove);
            appbox.on("mouseup", evt_mouseup);
            draw_start_curve(tool.ctx, x, y, tool.label);
            break;
        default:
            console.log("Warning: Undefined tool type", tool.kind, "used.");
    }
    if (ret) {
        update_data(tool.label, ret);
    }
}

function evt_mousemove(e) {
    "use strict";
    var tool = Toolbox.info();
    var appbox = $("#appbox");
    var x = e.pageX - appbox[0].offsetLeft;
    var y = e.pageY - appbox[0].offsetTop;

    if (tool.kind === "line") {
        draw_continue_line(tool.ctx, x, y, tool.label);
    } else {
        draw_continue_curve(tool.ctx, x, y, tool.label);
    }
}

function evt_mouseup(e) {
    "use strict";
    var tool = Toolbox.info();
    var appbox = $("#appbox");
    var x = e.pageX - appbox[0].offsetLeft;
    var y = e.pageY - appbox[0].offsetTop;
    var ret;
    if (tool.kind === "line") {
        ret = draw_end_line(tool.ctx, x, y, tool.label);
    } else {
        ret = draw_end_curve(tool.ctx, x, y, tool.label);
    }
    if (ret) {
        update_data(tool.label, ret);
    }
    appbox.off("mousemove", evt_mousemove);
    appbox.off("mouseup", evt_mouseup);
}

function get_param (param, default_value) {
    "use strict";
    var res = new RegExp(param + "=([^&#]*)").exec(window.location.search);
    return res && decodeURIComponent(res[1]) || default_value || "";
}

function load_resources(image, toolbox) {
    "use strict";
    var wait_img = $.Deferred(function (dfd) {
        $("#canvasbg").one("load", dfd.resolve);
        $("#canvasbg").attr("src", image);
        $("#canvaseg").attr("src", example_img);
    }).promise();

    var wait_tool = $.getJSON(toolbox);
    $.when(wait_img, wait_tool).then(function () {
        var img = $("#canvasbg");
        $(".container").css("min-width", img.css("width"));
        wait_tool.done(Toolbox.init);
    });

}

function initialize(image, config) {
    "use strict";
    var cbox = $("#canvasbox");

    cbox.on("mousedown", evt_mousedown);
    $(document).keypress(evt_keydown);


    var form = $("#mturk_form");
    form.submit(evt_submit);

    load_resources(get_param("url", image),
                   get_param("config", config));

    // Manage mechanical turk form interface and ensure Assignment ID assigned
    $("#assignmentId")[0].value = get_param("assignmentId");
    if (get_param("assignmentId") == "ASSIGNMENT_ID_NOT_AVAILABLE") {
        var submit = $("#submitButton")[0];
        submit.disabled = true;
        submit.textContent = "Please ACCEPT the HIT first!";
        submit.className = "btn btn-danger btn-large";
        $("canvas").css("cursor", "not-allowed");
        update_submit = function() {};
    } else {
        add_log("init", get_param("url", image));
        $(".alert").hide();
        form[0].action = get_param("turkSubmitTo") + "/mturk/externalSubmit";
        update_submit();
    }

}
