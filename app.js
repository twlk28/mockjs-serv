/**
 * Created by adi on 17/6/16.
 */

var argv = require('yargs').argv
var express = require('express')
var bodyParser = require('body-parser')
var publicIp = require('public-ip')
var localIp = require('./lib/localIp')
var log = console.log.bind(console)
var app = express()

app.use(express.static('assets'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

var registerRoutes = function (app, routes) {
    for (let i = 0; i < routes.length; i++) {
        var route = routes[i]
        app[route.method](route.path, route.func)
    }
}

var m = require('./route/mock')
registerRoutes(app, m.routes)

var api = require('./route/api')
registerRoutes(app, api.routes)

var main = require('./route/main')
registerRoutes(app, main.routes)

// main

var config = {
    protocol: 'http',
    host: 'localhost:8081',
    port: 8001,
    portAlias: 8001,
}
global.__config = config

publicIp.v4().then(ip => {
    var port = argv.port || config.port
    var portAlias = argv.portAlias || config.portAlias
    var hostname = argv.domain || (argv.external ? ip : localIp() )
    var host = +portAlias == 80 ? hostname : `${hostname}:${portAlias}`
    Object.assign(config, {port, portAlias, host})
    var server = app.listen(+port, function () {
        log('serv start http://%s', `${hostname}:${port}`)
    })
})
