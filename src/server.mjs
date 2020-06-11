import data from './config'
import index from './index.pug'

import router, {post, response} from 'bliss-router'
import aws, {aws_rest} from 'bliss-router/aws'
import asset from 'bliss-router/assets'


// static assets
asset('', STATIC_ASSETS)


// homepage
asset('', index(data), 'text/html')


// contact form
aws.region = AWS_REGION
aws.key = AWS_ACCESS_KEY_ID
aws.secret = AWS_SECRET_ACCESS_KEY
post('/contact', async req => {
    let status = 202
    try {
        let form = await req.formData()
        let subject = form.has('subject') && form.get('subject') || 'no subject'
        let message = form.has('message') && form.get('message')
        if(message.length > 10) {
            let res = await aws_rest('ses', 'POST', '/v2/email/outbound-emails', {
                'Destination': {
                    'ToAddresses': [data.email.destination]
                },
                'Content': {
                    'Simple': {
                        'Subject': {
                            'Data': subject,
                            'Charset': 'utf-8'
                        },
                        'Body': {
                            'Text': {
                                'Data': message,
                                'Charset': 'utf-8'
                            }
                        }
                    }
                },
                'FromEmailAddress': data.email.sender
            })
            if(!res.ok) {
                let error = res.headers.has('x-amzn-errortype')
                    ? res.headers.get('x-amzn-errortype') + `(${res.status})`
                    : res.status
                let message = await res.text()
                throw new Error(`AWS error: ${error}: ${message}`)
            }
        }
    } catch(err) {
        console.error(err.stack)
        status = 500
    }
    return response(null, status)
})


addEventListener('fetch', router)
