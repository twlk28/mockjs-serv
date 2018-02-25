/**
 * Created by adi on 2018/2/25.
 */

function sendJSON(resp, data) {
    resp.set({
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,OPTIONS',
        'Access-Control-Allow-Headers': 'X-Requested-With,Origin,Content-Type'
    })
    resp.send(JSON.stringify(data, null, 4))
}

module.exports = {
    sendJSON
}