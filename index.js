require('dotenv').config();
const express = require("express");
const methodOverride = require('method-override');
const database = require('./config/database')
const bodyParser = require('body-parser')
const flash = require('express-flash')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const moment = require('moment')
const path = require('path');

database.connect()

const systemConfig = require("./config/system.js")

const route = require("./routes/client/index.route")
const routeAdmin = require('./routes/admin/index.route.js')

const app = express();
const port = process.env.PORT;

//! config view
app.set("views", `${__dirname}/views`);
app.set("view engine", "pug");

//! config method override
app.use(methodOverride('_method'))

//! config static file
app.use(express.static(`${__dirname}/public`));

//! config express flash
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key', // Thay 'your-secret-key' bằng một chuỗi bí mật của bạn
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

//TinyMCE
app.use('/tinymce', express.static(path.join(__dirname, 'node_modules', 'tinymce')));

//! define app local vars
app.locals.prefixAdmin = systemConfig.prefixAdmin
app.locals.moment = moment;

// Middleware to get current URL and pass it to Pug templates
app.use((req, res, next) => {
    res.locals.currentUrl = req.originalUrl; // Lấy URL hiện tại
    next();
});

//! config url encoded
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// Routes
route(app);
routeAdmin(app);

app.get("*", (req, res) => {
    res.render("client/pages/errors/404", {
        pageTitle: "404 Not Found"
    });
});

app.listen(port, () => {
    console.log(`App listening on http://127.0.0.1:${port}`)
});