/**
 * Created by Trooper on 21/11/15.
 */
var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var skillsetSchema = new Schema({

    creator : {type: Schema.Types.ObjectId, ref:'User'},
    content : String,
    created: { type: Date, default: Date.now}

});

module.exports = mongoose.model('Skillset', skillsetSchema);