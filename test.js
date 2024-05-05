require('dotenv').config();
let API_KEY = process.env.API_KEY
let DOMAIN = process.env.DOMAIN;
const mailgun = require('mailgun-js')
	({ apiKey: API_KEY, domain: DOMAIN });

sendMail = function (sender_email, receiver_email,
	email_subject, email_body) {

	const data = {
		"from": sender_email,
		"to": receiver_email,
		"subject": email_subject,
		"html": email_body
	};

	mailgun.messages().send(data, (error, body) => {
		if (error) console.log(error)
		else console.log(body);
	});
}

let sender_email = 'admin@servicescape.com'
let receiver_email = 'jamessajan07@gmail.com'
let email_subject = 'Booking Confirmation'
let email_body = '<h1>Your booking has been confirmed. Thank you for choosing our services</h1>'

// User-defined function to send email
sendMail(sender_email, receiver_email,
	email_subject, email_body)
