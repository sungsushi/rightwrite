/**
 * Local web server for development.
 *
 *   http://localhost:8000/dev.html     - development version (modules loaded from js/, no build needed)
 *   http://localhost:8000/dist/        - built version (after `npm run build`)
 */
var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

app.use(express.static(__dirname));
app.listen(port, function() {
    console.log('rightwrite dev server');
    console.log('  development: http://localhost:' + port + '/dev.html');
    console.log('  built:       http://localhost:' + port + '/dist/');
});
