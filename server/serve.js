#!/usr/bin/env node

var app = require('./app.js').app
    connect = require('connect'),
    express = require('express'),
    jade = require('jade');

if (!module.parent) {
   app.listen(3000);
   console.log('Express server listening on port %d, environment: %s', app.address().port, app.settings.env)
   console.log('Using connect %s, Express %s, Jade %s', connect.version, express.version, jade.version);
}
