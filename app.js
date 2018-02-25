/**
 * Created by adi on 17/6/16.
 */

var fs = require('fs')
var argv = require('yargs').argv
var express = require('express')
var bodyParser = require('body-parser')
var publicIp = require('public-ip')
var localIp = require('./lib/localIp')
var MockJS = require('mockjs')
var log = console.log.bind(console)
var app = express()

var Mocks = require('./model/Mocks')

app.use(express.static('assets'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())

var config = {
    protocol: 'http',
    host: 'localhost:8081',
    port: 8001,
    portAlias: 8001,
}
global.__config = config

// utils

function sendJSON(resp, data) {
    resp.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With,Origin,Content-Type'
    })
    resp.send(JSON.stringify(data, null, 4))
}

function sendHTML(resp, path) {
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile(path, options, function (err, data) {
        resp.send(data)
    })
}

// route::page
app.get('/', function (req, resp) {
    var options = {
        encoding: 'utf-8'
    }
    fs.readFile('tpl/_index.html', options, function (err, data) {
        resp.send(data.replace(/\{\{host\}\}/mg, config.host))
    })
})

// route::dataCRUD

app.get('/mock/:id', function (req, resp) {
    var id = +req.params.id
    Mocks.load(id, function (entity) {
        sendJSON(resp, entity)
    })
})

app.get('/mocks', function (req, resp) {
    var keyword = req.query.q
    var count = req.query.count || 50
    Mocks.query(keyword, count, function (entities) {
        sendJSON(resp, entities.slice(0, count))
    })
})

app.post('/mock', function (req, resp) {
    var form = req.body
    Mocks.save(form, function () {
        sendJSON(resp, {err: null})
    })
})

app.put('/mock/:id', function (req, resp) {
    var id = +req.params.id
    var form = req.body
    Mocks.update(id, form, function () {
        sendJSON(resp, {err: null})
    })
})

app.delete('/mock/:id', function (req, resp) {
    var id = +req.params.id
    Mocks.delete(id, function () {
        sendJSON(resp, {err: null})
    })
})

app.options('/mock', function (req, resp) {
    if (req.header('Access-Control-Request-Method').toUpperCase() == 'POST') {
        sendJSON(resp, {err: null})
    }
    else {
        sendJSON(resp, {err: 'POST /mock error'})
    }
})

app.options('/mock/:id', function (req, resp) {
    if (req.header('Access-Control-Request-Method').toUpperCase() == 'DELETE') {
        sendJSON(resp, {err: null})
    }
    else if (req.header('Access-Control-Request-Method').toUpperCase() == 'PUT') {
        sendJSON(resp, {err: null})
    }
    else {
        sendJSON(resp, {err: 'OPTIONS /mock/id error'})
    }

})

// route::dataAPI

app.all('/api/:id', function (req, resp) {
    var id = +req.params.id
    Mocks.load(id, function (entity) {
        if (entity) {
            var data = ""
            try {
                var tpl = JSON.parse(entity.tpl)
                data = MockJS.mock(tpl)
            }
            catch (e) {
                data = `{err: ${e}}`
            }
            finally {
                sendJSON(resp, data)
            }
        }
        else {
            sendJSON(resp, {})
        }
    })
})

// main

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
