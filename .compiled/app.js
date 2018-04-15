'use strict';

var inter = require('./interaction');
console.log("SSSSSSSSSSSSSSSSSSTTTTTTTTTTTAAAAAAAARRRRRRRRTTTTTTTTTTTTEEEEEEEEEEEEEDDDDDDDDD!!!!!!!");

var express = require('express');
var app = express();

app.get('/', function (req, res) {
  res.send('Hello World');
});

app.listen(process.env.PORT || 8080);
//# sourceMappingURL=app.js.map