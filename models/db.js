var mongoose = require('mongoose');
var settings = require('../setting');

module.exports = mongoose.connect('mongodb://username:pwd@host:port/dbname');