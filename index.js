require('dotenv').config();
const express = require('express');
const session=require('express-session');
const mongoose=require('mongoose');
const {mongoClient}=require('mongodb');
const bodyParser=require('body-parser');
const {Users,Workers,Bookings}=require('./schema');
const app=express();
app.use(session({
    secret:'youwillnevergetthisshit',
    resave:false,
    saveUninitialized:true
}))
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

mongoose.connect(process.env['URI']).then(()=>console.log("db connected"))
app.route('/')
    .get((req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    })

app.route('/usersignup')
    .get((req, res) => {
        res.sendFile(__dirname+'/public/usersignup.html')
    })
    .post(async(req, res) => {
        const {name,email,address,city,pincode,contact,password} = req.body;
        const user = new Users({name:name, email:email, address:address, city:city, pincode:pincode, contact:contact,password:password });
        await user.save().then(() => {
            res.redirect('/userlogin');
        });
    });

app.route("/userlogin")
    .get((req,res)=>{
        res.sendFile(__dirname+'/public/userlogin.html');
    })
    .post(async(req,res)=>{
        const {email,password}=req.body;
        await Users.findOne({email:email,password:password}).then(async(data)=>{
            if(data){
                books= await Bookings.find({userid:data.id}).populate('workerid','name email contact profession rating noofratings reviews')
                req.session.myid=data.id;
                res.render('userhome',{books})

            }
            else{
                res.sendFile(__dirname+'/public/loginfail.html');
            }
        })});

app.route("/myhome")
    .get(async(req,res)=>{
        const userid=req.session.myid;
        books= await Bookings.find({userid:userid}).populate('workerid','name email contact profession rating noofratings reviews')
        res.render('userhome',{books})
    })
app.route('/workersignup')
    .get((req, res) => {
        res.sendFile(__dirname + '/public/workersignup.html');
    })
    .post(async (req, res) => {
        const { name, description, email, address, city, pincode, contact, profession, password } = req.body;
        const worker = new Workers({ name, description, email, address, city, pincode, contact, profession, password });
        await worker.save().then(() => {
            res.redirect('/workerlogin');
        });
    });

app.route("/workerlogin")
    .get((req, res) => {
        res.sendFile(__dirname + '/public/workerlogin.html');
    })
    .post(async (req, res) => {
        const { email, password } = req.body;
        await Workers.findOne({ email: email, password: password }).then(async(data) => {
            if (data) {
                req.session.workmyid = data.id;
                await Bookings.find({ workerid: data.id, bookingstatus: { $in: ["pending", "done"] } })
                    .populate('userid', 'name email address city pincode contact')
                    .then((books) => {
                        res.render('workerprofile', { books, data });
                    });
            }
            else {
                res.sendFile(__dirname+'/public/loginfail.html');
            }
        });
    });
app.route("/workerhome")
    .get(async(req,res)=>{
        const workid=req.session.workmyid;
        await Workers.findById(workid).then(async(data) => {
         
                await Bookings.find({ workerid: data.id, bookingstatus: { $in: ["pending", "done"] } })
                    .populate('userid', 'name email address city pincode contact')
                    .then((books) => {
                        res.render('workerprofile', { books, data });
                    });
                });
    })
app.route('/workerdashboard')
    .get(async (req, res) => {
        const workerid = req.session.workmyid;
        await Bookings.find({ workerid: workerid, bookingstatus: { $in: ["pending", "done"] } })
            .populate('userid', 'name email address city pincode contact')
            .then((books) => {
                res.render('workerdashboard', { books });
            });
    });
app.route("/userhome")
    .get(async (req, res) => {
        const profession = req.query.profession;
        await Workers.find({ profession: profession }).then((data) => {
            res.render('listworkers', { data });
        });
    });

app.route("/workerdetails")
    .get(async (req, res) => {
        const id = req.query.id;
        const userid = req.session.myid;
        req.session.workerid = id;
        await Workers.findById(id).then((data) => {
            res.render('workerdetails', { data, userid });
        });
    });

app.route("/bookings")
    .get(async (req, res) => {
        const workerid = req.session.workerid;
        const userid = req.session.myid;
        res.render('booking', { workerid, userid });
    });


app.route("/bookconfirm")
    .post(async (req, res) => {
        let username,useremail;
        let workername,workeremail,workercontact;
        const workerid = req.session.workerid;
        const userid = req.session.myid;
        const date = req.body.date;
        const time = req.body.time;
        const locationLink = req.body.locationLink;
        const problem = req.body.problem;
        const problemStatement = req.body.problemStatement;
        const booking = new Bookings({ workerid, userid, date, time, locationLink, problem, problemStatement });

        await Users.findById(userid).then((data) => {
            username = data.name;
            useremail = data.email;
        });
        await Workers.findById(workerid).then((data) => {
            workeremail = data.email;
            workername = data.name;
            workercontact = data.contact;
        })
        let API_KEY = process.env.API_KEY
        let DOMAIN = process.env.DOMAIN;
        const mailgun = require('mailgun-js')
	    ({ apiKey: API_KEY, domain: DOMAIN });

        sendMail = async function (sender_email, receiver_email,
	    email_subject, email_body) {

	    const data = {
		"from": sender_email,
		"to": receiver_email,
		"subject": email_subject,
		"html": email_body
	    };

	    await mailgun.messages().send(data, (error, body) => {
		    if (error) console.log(error)
		    else console.log(body);
	    });
        }

        let sender_email = 'admin@servicescape.com'
        let receiver_email = useremail
        let email_subject = 'Booking Confirmation'
        let email_body = `<h2>Dear ${username},</h2><br>
        <h3> Your booking has been confirmed for ${date} at ${time} to assist with </h3>
        <h3>problem: ${problem}.</h3>
        <h3>description:${problemStatement}</h3>
        <h3>you will be assisted by ${workername} you can conatact him on ${workeremail} , ${workercontact}</h3>
        <h3>Thank you for choosing our services.</h3>
        <h3>Your's truly , mahesh dulley</h3>
        <h3>Servicescape</h3>`

        // User-defined function to send email
        await sendMail(sender_email, receiver_email,
	        email_subject, email_body)


            await booking.save().then((data) => {
                res.redirect('/userdashboard');
            });
    });

app.route("/userdashboard")
    .get(async (req, res) => {
        const userid = req.session.myid;
        await Bookings.find({ userid: userid })
            .populate('workerid', 'name email contact profession')
            .then((data) => {   
                res.render('userdashboard', { data });
            });
    });

app.route("/acceptbooking")
    .post(async (req, res) => {
        const bookingId = req.body.bookingid;
        const bookingStatus = req.body.bookingstatus;

        await Bookings.findByIdAndUpdate(bookingId, { $set: { bookingstatus: bookingStatus } })
            .catch((error) => {
                console.log(error);
                res.send('Failed to update booking status');
            });
    });

    app.route("/deleteentryuser")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findByIdAndDelete(bookingId)
                .then(() => {
                    res.redirect('/userdashboard');
                })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to update booking status');
                });
        });

        app.route("/deleteentryworker")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findByIdAndDelete(bookingId)
                .then(() => {
                    res.redirect('/workerdashboard');
                })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to update booking status');
                });
        });
    app.route('/rejectbooking')
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findByIdAndUpdate(bookingId, { $set: { bookingstatus: "rejected" } })
                .then(() => {
                    res.send('Booking status updated');
                })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to update booking status');
                });
        });

    app.route("/requestpayment")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findOneAndUpdate({ _id: bookingId }, { $set: { paymentstatus: "requested" } })
                .then(() => {
                    res.send('Payment requested');
                })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to request payment');
                });
        });

    app.route("/cancelbooking")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findByIdAndDelete(bookingId)
                .then(() => {
                    res.send('Booking cancelled');
                })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to cancel booking');
                });
        });
    app.route("/paydemo")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            req.session.bookingId = bookingId;
            res.sendFile(__dirname + '/public/payment.html');
        });
    app.route("/paynow")
        .post(async (req, res) => {
            const bookingId = req.session.bookingId;
            await Bookings.findOneAndUpdate({ _id: bookingId }, { $set: { paymentstatus: "paid" } })
            .then(() => {
                res.redirect('/userdashboard');
            })
                .catch((error) => {
                    console.log(error);
                    res.send('Failed to update payment status');
                });
        });

    app.route('/userprofileedit')
        .get(async (req, res) => {
            const userid = req.session.myid;
            await Users.findById(userid).then((data) => {
                res.render('userprofileedit', { data });
            });
        })
        .post(async (req, res) => {
            const userid = req.session.myid;
            const { address, city, pincode, contact, password } = req.body;
            await Users.findByIdAndUpdate(userid, { address, city, pincode, contact, password }).then(() => {
                res.redirect('/userdashboard');
            });
        });

    app.route('/workerprofileedit')
        .get(async (req, res) => {
            const workerid = req.session.workmyid;
            await Workers.findById(workerid).then((data) => {
                res.render('workerprofileedit', { data });
            });
        })
        .post(async (req, res) => {
            const workerid = req.session.workmyid;
            const { address, city, pincode, contact, password, description } = req.body;
            await Workers.findByIdAndUpdate(workerid, { address, city, pincode, contact, password, description }).then(() => {
                res.redirect('/workerdashboard');
            });
        });

    app.route("/rateworker")
        .post(async (req, res) => {
            const { rating, review, bookingid } = req.body;
            await Bookings.findById(bookingid)
                .populate('userid', 'name')
                .then(async(data) => {
                    await Workers.findById(data.workerid).then(async(worker) => {
                        const newRating = (Number(worker.rating) + Number(rating)) / 2;
                        const newReview = { reviewer: data.userid.name, review: review,rating:rating };
                        await Workers.findByIdAndUpdate(data.workerid, {
                            noofratings: worker.noofratings + 1,
                            rating: newRating,
                            $push: { reviews: newReview }
                        }).then(async() => {
                            await Bookings.findByIdAndUpdate(bookingid, { reviewstatus: "done" }).then(() => {
                                res.redirect('/userdashboard');
                            }).catch(err => {
                                console.error("Error updating booking:", err);
                                res.status(500).send("Error updating booking");
                            });
                        }).catch(err => {
                            console.error("Error updating worker:", err);
                            res.status(500).send("Error updating worker");
                        });
                    }).catch(err => {
                        console.error("Error finding worker:", err);
                        res.status(500).send("Error finding worker");
                    });
                }).catch(err => {
                    console.error("Error finding booking:", err);
                    res.status(500).send("Error finding booking");
                });
        });
        app.route('/workerstatus')
            .post(async(req, res) => {
                const status = req.body.status;
                const workerid = req.session.workmyid;
                await Workers.findByIdAndUpdate(workerid, { status: status }).then(() => {
                    res.sendStatus(200);
                }).catch((error) => {
                    console.log(error);
                    res.sendStatus(500);
                });
            });
        app.route('/about')
            .get((req, res) => {
                res.sendFile(__dirname + '/public/about.html');
            });
        app.route('/logout')
            .get((req, res) => {
                req.session.destroy();
                res.redirect('/');
            });
        app.get('/favicon.ico', (req, res) => {
            res.status(204);
        });
    app.route("/adminlogin")
        .get((req, res) => {
            res.sendFile(__dirname + '/public/adminlogin.html');
        })
        .post(async(req, res) => {
            const email = req.body.email;
            const password = req.body.password;
            if (email == process.env['ADMIN_EMAIL'] && password == process.env['ADMIN_PASSWORD']) {
                res.sendFile(__dirname + '/public/adminhome.html');
            } else {
                res.sendFile(__dirname + '/public/loginfail.html');
            }
        });
    app.route("/adminlistusers")
        .get(async(req, res) => {
            await Users.find().then((data) => {
                res.render('adminlistusers', { data });
            });
        });
    app.route("/adminlistworkers")
        .get(async(req, res) => {
            await Workers.find().then((data) => {
                res.render('adminlistworkers', { data });
            });
        });
    app.route("/admindeleteuser")
        .get(async(req, res) => {
            const userid = req.query.id;
            await Users.findByIdAndDelete(userid).then(() => {
                res.redirect('/adminlistusers');
            });
        });
    app.route("/admindeleteworker")
        .get(async(req, res) => {
            const workerid = req.query.id;
            await Workers.findByIdAndDelete(workerid).then(() => {
                res.redirect('/adminlistworkers');
            });
        });
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });