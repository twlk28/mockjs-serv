/**
 * Created by adi on 2018/2/25.
 */

helper = require('../lib/helper')
var Mocks = require('../model/Mocks')
var MockJS = require('mockjs')

var all = {
    path: '/api/:id',
    method: 'all',
    func: function (req, resp) {
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
                    helper.sendJSON(resp, data)
                }
            }
            else {
                helper.sendJSON(resp, {})
            }
        })
    }
}


var routes = [all]

module.exports.routes = routes