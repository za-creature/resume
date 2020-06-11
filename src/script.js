if(console && console.log) {
    console.log('Using Zilla Slab, available at')
    console.log('https://github.com/mozilla/zilla-slab')
}


function doc(name) {
    return document[name].bind(document)
}
var $ = doc('getElementById')
var el = doc('createElement')
function all(tag, cb) {
    [].forEach.call(document.getElementsByTagName(tag), cb)
}


// make images predictably responsive cross-browser and use highest resolution in print
var queries = {}
function make_responsive(img, id) {
    var srcset = img.getAttribute('srcset')
    if(srcset)
        img.removeAttribute('srcset')
    else
        return
    srcset += ',' + img.src + ' 1x'
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='

    var print = img.cloneNode()
    print.classList.add('print')
    img.classList.add('screen')
    img.id = id = 'img' + id
    img.parentNode.insertBefore(print, img)
    var max = 0
    srcset.split(',').forEach(function(x) {
        x = x.split(' ')
        var src = x[0]
        var res = parseInt(x[1].slice(0, -1), 10)|0
        if(res > max) {
            print.src = src
            max = res
        }
        queries[res] = queries[res] || []
        queries[res].push('#' + id + '{background-image:url(' + src + ')}')
    })
}
function commit_responsive() {
    var bg = '@media screen {img{background-position:50% 50%;background-size:cover}}'
    var style = el('style')
    style.type = 'text/css'
    style.innerText = bg + Object.keys(queries).sort().map(function(dpr) { return (
        '@media screen and (min-resolution:' + (1+96*(dpr-1)) + 'dpi), ' +
               '(-webkit-min-device-pixel-ratio: ' + (dpr-95/96) + ') {' +
        queries[dpr].join('') + '}'
    )}).join('')
    document.head.appendChild(style)
    queries = {}
}


// build a list of links to show in print
var references
function begin_reference() {
    references = el('ol')
    references.className = 'print'
    var refs = $('references')
    refs.parentNode.insertBefore(references, refs.nextSibling)
}
function add_reference(link) {
    if(link.href.slice(0, 4) == 'http') {
        var ref = el('sup')
        ref.className = 'print'
        ref.innerText = (1 + references.childNodes.length)
        link.appendChild(ref)

        var li = el('li')
        li.innerText = link.href
        references.appendChild(li)
    }
}


// TODO: add support for live collections
all('img', make_responsive)
commit_responsive()
begin_reference()
all('a', add_reference)


// entry-level captcha requiring use of javascript + fetch to submit the form
// only intended to prevent cheap spam
var submit = $('submit')
submit.onclick = function() {
    function cb(err) {
        status.innerText = err
            ? 'Sorry, looks like something went wrong. Please send me an email directly'
            : 'Your message was sent. I will get back to you as soon as possible'
    }
    try {
        var status = el('span')
        submit.parentNode.replaceChild(status, submit)
        var message = $('message')
        if(message.value.length > 10) {
            var body = new FormData()
            body.append('subject', $('subject').value)
            body.append('message', message.value)
            fetch('/contact', {'method': 'POST', 'body': body})
            .then(function(res) { if(!res.ok) throw new Error() })
            .then(cb, cb)
        } else message.focus()
    } catch(err) {
        cb(err)
    }
    return false
}
