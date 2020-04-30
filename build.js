let {spawnSync} = require('child_process')
const fs = require('fs')
const path = require('path')

let pug = require('pug')
let cssnano = require('cssnano')


function execSync() {
    let result = spawnSync(...arguments)
    if(result.status)
        throw new Error(`Non-zero exit code: ${result.status}\n\n` +
                        `${result.stderr.toString()}`)
    else
        return result.stdout
}

fs.writeFileSync('dist/index.html', pug.renderFile('src/index.pug', Object.assign({filters: {
    css(text, options) {
        if(process.env['NODE_ENV'] == 'local')
            return text
        return execSync('node_modules/.bin/postcss', [
            '--use=cssnano',
            '--no-map'
        ], {input: text}).toString()
    },
    js(text, options) {
        if(process.env['NODE_ENV'] == 'local')
            return text
        return execSync('java', [
            '-jar',
            require('google-closure-compiler-java'),
            '-W', 'quiet',
            '-O', 'ADVANCED',
            '--language_in=ECMASCRIPT5',
            '--language_out=ECMASCRIPT3'
        ], {input: text}).toString().replace(/\n/g, '')
    }
}}, require('./src/private.json'))))
