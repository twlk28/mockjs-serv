/**
 * Created by adi on 2018/2/25.
 */

var fs = require('fs')

var list = {
    path: '/',
    method: 'get',
    func: function (req, resp) {
        var config = global.__config
        var options = {
            encoding: 'utf-8'
        }
        fs.readFile('tpl/_index.html', options, function (err, data) {
            resp.send(data.replace(/\{\{host\}\}/mg, config.host))
        })
    }
}

var routes = [list]

module.exports.routes = routes
