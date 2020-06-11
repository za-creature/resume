let {text, secret, dir} = require('bliss-router/bindings')

const prod = process.env.NODE_ENV == 'production' ? '.min' : ''
module.exports = {
    code: `.deploy/cf_worker${prod}.js`,
    bindings: {
        AWS_REGION: text(process.env['AWS_REGION']),
        AWS_ACCESS_KEY_ID: secret(process.env['AWS_ACCESS_KEY_ID']),
        AWS_SECRET_ACCESS_KEY: secret(process.env['AWS_SECRET_ACCESS_KEY']),
        //SOURCE_MAP: file(`.deploy/cf_worker${prod}.js.map`),
        STATIC_ASSETS: dir('assets')
    }
}
