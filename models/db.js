var mongoose = require('mongoose');
var settings = require('../setting').config;

module.exports = mongoose.connect(settings.db);