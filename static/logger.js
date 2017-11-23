function Logger(debug=true){
    this.messages = [];
    this.debug = debug;
}

Logger.prototype = {

    addMsg: function(msg){
        // Generic message template
        var d = new Date();
        var printMsg = d.getTime() + ": " + msg;
        this.messages.push(printMsg);

        if (this.debug){
            console.log(printMsg);
        }
    }
}
