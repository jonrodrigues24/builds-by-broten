const express = require("express")
const morgan = require("morgan")
const bodyParser = require("body-parser")
const Recaptcha = require("express-recaptcha").RecaptchaV2
const formData = require("form-data")
const Mailgun = require("mailgun.js")
const mailgun = new Mailgun(formData)
const {check, validationResult} = require("express-validator")
const {request, response} = require("express");

const validation = [
    check("inputEmail", "A valid email is required").isEmail(),
    check("inputPhone", "Please provide a valid phone number").not().isEmpty().trim().escape(),
    check("inputProductType").optional().trim().escape().isLength({max:2000}),
    check("inputWood").optional().trim().escape(),
    check("inputDetails").optional().trim().escape().isLength({max:2000})
]

const app = express()
const recaptcha = new Recaptcha(process.env.RECAPTCHA_SITE_KEY, process.env.RECAPTCHA_SECRET_KEY)
const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY})

app.use(morgan("dev"))
app.use(express.json())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

const indexRoute = express.Router()

const handleGetRequest = (request, response) => {
    return response.json("The express server is live")
}

const handlePostRequest = (request, response) => {
    response.append('Content-Type', 'text/html')

    if (request.recaptcha.error) {
        return response.send(
            `<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong>There was a recaptcha error. Please try again</div>`
        )
    }

    const errors = validationResult(request)

    if(errors.isEmpty() === false){
        const currentError = errors.array()[0]
        return response.send(`<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong>${currentError}</div>`)
    }

    const {inputEmail, inputPhone, inputProductType, inputWood, inputDetails} = request.body

    const mailgunData = {
        to: process.env.MAIL_RECIPIENT,
        from: `${inputEmail} <postmaster@${process.env.MAILGUN_DOMAIN}>`,
        subject: `${inputEmail}: ${inputPhone}`,
        text: inputDetails, inputWood, inputPhone, inputProductType
    }

    mg.messages.create(process.env.MAILGUN_DOMAIN, mailgunData)
        .then(msg =>
        response.send(
            `<div class='alert alert-success' role='alert' >${JSON.stringify(msg)}</div>`
        ))
        .catch(err =>
        response.send(
            `<div class='alert alert-danger' role='alert'><strong>Oh Snap!</strong>${err}</div>`
        ))

}

indexRoute.route("/")
    .get(handleGetRequest)
    .post(recaptcha.middleware.verify, validation, handlePostRequest)

app.use('/apis', indexRoute)

app.listen(4200, () => {
    console.log('Express Succesfully Built')
})

