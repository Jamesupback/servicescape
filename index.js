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
            res.send('Data saved');
        });
    });

app.route("/userlogin")
    .get((req,res)=>{
        res.sendFile(__dirname+'/public/userlogin.html');
    })
    .post(async(req,res)=>{
        const {email,password}=req.body;
        await Users.findOne({email:email,password:password}).then((data)=>{
            if(data){
                req.session.myid=data.id;
                res.sendFile(__dirname+'/public/userhome.html');
            }
            else{
                res.send('failed to login');
            }
        })});
app.route('/workersignup')
    .get((req, res) => {
        res.sendFile(__dirname + '/public/workersignup.html');
    })
    .post(async (req, res) => {
        const { name, description, email, address, city, pincode, contact, profession, password } = req.body;
        const worker = new Workers({ name, description, email, address, city, pincode, contact, profession, password });
        await worker.save().then(() => {
            res.send('Data saved');
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
                await Bookings.find({ workerid: data.id, bookingstatus: { $in: ["pending", "accepted"] } })
                    .populate('userid', 'name email address city pincode contact')
                    .then((books) => {
                        res.render('workerdashboard', { books, data });
                    });
            }
            else {
                res.send('failed to login');
            }
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
        const workerid = req.session.workerid;
        const userid = req.session.myid;
        const date = req.body.date;
        const time = req.body.time;
        const locationLink = req.body.locationLink;
        const problem = req.body.problem;
        const problemStatement = req.body.problemStatement;
        const booking = new Bookings({ workerid, userid, date, time, locationLink, problem, problemStatement });
        await booking.save().then((data) => {
            console.log(data);
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
            .then(() => {
                res.send('Booking status updated');
            })
            .catch((error) => {
                console.log(error);
                res.send('Failed to update booking status');
            });
    });

    app.route("/cancelstatus")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findByIdAndUpdate(bookingId, { $set: { bookingstatus: "pending" } })
                .then(() => {
                    res.send('Booking status updated');
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

    app.route("/paynow")
        .post(async (req, res) => {
            const bookingId = req.body.bookingid;
            await Bookings.findOneAndUpdate({ _id: bookingId }, { $set: { paymentstatus: "paid" } })
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
                        const newReview = { reviewer: data.userid.name, review: review };
                        await Workers.findByIdAndUpdate(data.workerid, {
                            noofratings: worker.noofratings + 1,
                            rating: newRating,
                            $push: { reviews: newReview }
                        }).then(() => {
                            res.send("done");
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
        app.get('/favicon.ico', (req, res) => {
            res.status(204);
        });
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });