/**
 * Created by adi on 2018/2/25.
 */

var helper = require('../lib/helper')
var Mocks = require('../model/Mocks')

var load = {
    path: '/mock/:id',
    method: 'get',
    func: function (req, resp) {
        var id = +req.params.id
        Mocks.load(id, function (entity) {
            helper.sendJSON(resp, entity)
        })
    }
}

var all = {
    path: '/mocks',
    method: 'get',
    func: function (req, resp) {
        var keyword = req.query.q
        var count = req.query.count || 50
        Mocks.query(keyword, count, function (entities) {
            helper.sendJSON(resp, entities.slice(0, count))
        })
    }
}

var create = {
    path: '/mock',
    method: 'post',
    func: function (req, resp) {
        var form = req.body
        Mocks.save(form, function () {
            helper.sendJSON(resp, {err: null})
        })
    }
}

var update = {
    path: '/mock/:id',
    method: 'put',
    func: function (req, resp) {
        var id = +req.params.id
        var form = req.body
        Mocks.update(id, form, function () {
            helper.sendJSON(resp, {err: null})
        })
    }
}

var remove = {
    path: '/mock/:id',
    method: 'delete',
    func: function (req, resp) {
        var id = +req.params.id
        Mocks.delete(id, function () {
            helper.sendJSON(resp, {err: null})
        })
    }
}


var opt1 = {
    path: '/mock',
    method: 'options',
    func: function (req, resp) {
        if (req.header('Access-Control-Request-Method').toUpperCase() == 'POST') {
            sendJSON(resp, {err: null})
        }
        else {
            sendJSON(resp, {err: 'POST /mock error'})
        }
    }
}

var opt2 = {
    path: '/mock/:id',
    method: 'options',
    func: function (req, resp) {
        if (req.header('Access-Control-Request-Method').toUpperCase() == 'DELETE') {
            sendJSON(resp, {err: null})
        }
        else if (req.header('Access-Control-Request-Method').toUpperCase() == 'PUT') {
            sendJSON(resp, {err: null})
        }
        else {
            sendJSON(resp, {err: 'OPTIONS /mock/id error'})
        }

    }
}


var routes = [load, all, create, update, remove, opt1, opt2]

module.exports.routes = routes