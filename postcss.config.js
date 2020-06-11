const PROD = process.env.NODE_ENV == 'production'


module.exports = {
    parser: 'sugarss',
    map: false,
    plugins: [
        require('postcss-nested-props'),
        require('postcss-nested'),
        ...(PROD ? [
            require('cssnano')
        ]: [])
    ]
}
