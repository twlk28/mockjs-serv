/**
 * Created by adi on 17/6/16.
 */

var Datastore = require('nedb')
var log = console.log.bind(console)

var __db = new Datastore({
    filename: 'db/mocks.db',
    autoload: true,
})

var __count = 0

var Mocks = function () {
    this.id = -1
    this.title = ''
    this.tpl = ''
    this.url = ''
}

Mocks.query = function (keyword, count, cb) {
    var kw = keyword.replace(/([\.\*\-])/g, '\\$1').trim()
    var condition = {
        title: {
            $regex: new RegExp('.*'+kw+'.*', 'i'),
        },
        delete: false
    }
    __db.find(condition, function (err, list) {
        if (err){
            log('query', err)
            return
        }
        cb(list)
    })
}

Mocks.save = function (form, cb) {
    var newId = __count+1
    var entity = {
        id: newId,
        title: form.title || '',
        tpl: form.tpl || '',
        url: `http://${global.__config.host}/api/${newId}`,
        delete: false,
    }
    __db.insert(entity, function (err, _) {
        if (err){
            log('save', err)
            return
        }
        __count = newId
        cb()
    })
}

Mocks.update = function (id, form, cb) {
    var condition = {
        id: id,
        delete: false,
    }
    var entityMerged = {
        title: form.title,
        tpl: form.tpl,
    }
    __db.update(condition, {$set: entityMerged}, {upsert: true}, function (err, _) {
        if (err) {
            log('update', err)
            return
        }
        cb()
    })
}

Mocks.delete = function (id, cb) {
    var condition = {
        id: id,
        delete: false,
    }
    var entityMerged = {
        delete: true,
    }
    __db.update(condition, {$set: entityMerged}, {upsert: true}, function (err, _) {
        if (err) {
            log('delete', err)
            return
        }
        cb()
    })
}

Mocks.load = function (id, cb) {
    __db.find({id:id, delete: false}, function (err, list) {
        if (err){
            log('load', err)
            return
        }
        cb(list[0] || {})
    })
}

// init

function init() {
    __db.count({}, function (err, count) {
        if (err){
            log(err)
        }
        __count = count
    })
}
init()

module.exports = Mocks