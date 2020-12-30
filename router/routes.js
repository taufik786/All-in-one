const express = require('express');
const routes = express.Router();
require('../config/db')
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const user = require('../models/model')
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');


routes.use( bodyParser.json() );
routes.use(bodyParser.urlencoded({ urlencoded: true }));
routes.use(cookieParser('secret'));
routes.use(session({
    secret : 'secret',
    maxAge : 3600000,
    resave : true,
    saveUninitialized : true,
}))
routes.use(passport.initialize());
routes.use(passport.session());

routes.use(flash());
// Global variable
routes.use(function(req, res, next){
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error')
    next();
})

// Authentication
const checkAuthenticated = function(req,res,next){
    if(req.isAuthenticated()){
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next()
    }else{
        res.redirect('/login')
    }
}

routes.get('/', (req, res)=>{
    res.render('index')
})
routes.get('/register', (req, res)=>{
        res.render('register');
})
routes.post('/register', (req, res)=>{
    let {name, email, phone, password, cnfpassword} = req.body;
    let err;
    if(!name || !email || !phone || !password || !cnfpassword){
        err = "Please Fill All Fields...";
        res.render('register',{'err': err});
    }
    if(password != cnfpassword){
        err = "Password Don't Match";
        res.render('register', {'err': err, 'email': email, 'name': name, 'phone': phone})
    }
    if(typeof err == 'undefined'){
        user.findOne({email : email}, function(err, data){
            if(err) throw err;
            if(data){
                console.log("User exists")
                err = "User Already Exists With This Email...";
                res.render('register', {'err': err, 'email': email, 'name': name, 'phone': phone});
            }else{
                bcrypt.genSalt(10,(err, salt)=>{
                    if(err) throw err;
                    bcrypt.hash(password, salt, (err, hash)=>{
                        if(err) throw err;
                        password = hash;
                        user({
                            name,
                            email,
                            phone,
                            password,
                        }).save((err, data)=>{
                            if(err) throw err;
                            req.flash('success_message',"Registered Successfully... Login To Continue")
                            res.redirect('/login');
                            console.log(data)
                        })
                    })
                })
            }
        })
    }

});

// Authentication Strategy
let localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField : 'email' },(email, password, done)=>{
    user.findOne({email: email}, (err,data)=>{
        if(err) throw err;
        if(!data){
            return done(null, false,{message : "Your Credentials Wrong..."});
        }
        bcrypt.compare(password, data.password, (err, match)=>{
            if(err){
                return done(null,false);
            }
            if(!match){
                return done(null,false, { message : "Your Credentials Wrong..."});
            }
            if(match){
                return done(null,data);
            }
        });
    });
}));

passport.serializeUser(function(user, cb){
    cb(null, user.id);
})
passport.deserializeUser(function(id, cb){
    user.findById(id, function(err, user){
        cb(err, user)
    })
})
// end of authenticate strategy

routes.get('/login', (req, res)=>{
    res.render('login')
})
routes.post('/login', (req, res, next)=>{
    passport.authenticate('local',{
        failureRedirect : '/login',
        successRedirect : '/successLogin',
        failureFlash: true
    })(req, res, next);
})
routes.get('/successLogin',checkAuthenticated, (req, res)=>{
    res.render('successLogin',{'user': req.user})
})
routes.get('/logout', (req, res)=>{
    req.logOut();
    res.redirect('/login')
})
routes.get('/forgetpassword', (req, res)=>{
    res.render('forgetpassword')
})
routes.get('*', (req, res)=>{
    res.render('404')
})

module.exports = routes;