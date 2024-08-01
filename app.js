const express = require("express")
const hbs = require("express-handlebars")
const path = require("path")
const cookieParser = require('cookie-parser')
const session = require("express-session")
require("dotenv").config()
const {SECRET_KEY} = process.env
const mongoDbStore = require("connect-mongodb-session")(session)

const connectDb = require("./config/db/cofig")
const adminLayoutActive = require("./middleware/adminLayoutActive")
const clearCache = require("./middleware/clearCache")
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter") 


const app = express()

app.use(clearCache)
// session setup 
app.use(session({
  secret:SECRET_KEY,
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000 * 24},
  store:new mongoDbStore({mongooseConnection:connectDb})  
}))

// view engine setting
app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");
app.engine("hbs",hbs.engine({
  extname:"hbs",
  defaultLayout:"userLayout", // set userlayout for user routes
  layoutsDir:path.join(__dirname,'views/layout'),
  partialsDir:path.join(__dirname,'views/partials'),
  helpers: {
    eq: (a, b) => a === b
  }
}))

// public accessible to evryting so to access folders inside public avoid public and  starts from stylesheet or js
app.use(express.static(path.join(__dirname,"public")))
// app.use(express.static(path.join(__dirname,"public/assets")))
app.use(express.static(path.join(__dirname,"public/admin")))

// json parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());



// user routes
app.use("/",userRouter)
// setting the layout to adminLayout & active sidebar elements for admin routes
app.use("/admin",adminLayoutActive, adminRouter);


// port setup
const PORT = process.env.PORT||3001
app.listen(PORT, () =>
  console.log(`Server is Listening on http://localhost:${PORT}`)
);


module.exports = app

// doubts:
