const express = require("express")

const http = require("http"); // Add this for Socket.IO
const socketio = require("socket.io");

const hbs = require("express-handlebars")
const path = require("path")
const cookieParser = require('cookie-parser')
const session = require("express-session")
require("dotenv").config()
const {SECRET_KEY} = process.env
const mongoDbStore = require("connect-mongodb-session")(session)
const hbsHelpers = require('handlebars-helpers')();

const connectDb = require("./config/db/cofig")
const adminLayoutActive = require("./middleware/adminLayoutActive")
const clearCache = require("./middleware/clearCache")
const userRouter = require("./routes/userRouter")
const adminRouter = require("./routes/adminRouter")
const initializeChatSocket = require('./utils/chatsocket');
const logger = require("./utils/logger");


const app = express()
const server = http.createServer(app); // Create an HTTP server for socket.IO
const io = socketio(server); // Initialize Socket.IO

app.use(clearCache)
// session setup 
const sessionMiddleware = session({
  secret:SECRET_KEY,
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:600000 * 24},
  store:new mongoDbStore({mongooseConnection:connectDb})  
})

app.use(sessionMiddleware)

// view engine setting
app.set("views",path.join(__dirname,"views"));
app.set("view engine","hbs");
app.engine("hbs",hbs.engine({
  extname:"hbs",
  defaultLayout:"userLayout", // set userlayout for user routes
  layoutsDir:path.join(__dirname,'views/layout'),
  partialsDir:path.join(__dirname,'views/partials'),
  helpers: {
    ...hbsHelpers,
    eq: (a, b) => a === b,
    json: (context) => JSON.stringify(context)
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
// setting up socket 
initializeChatSocket(io, sessionMiddleware); 


// port setup
const PORT = process.env.PORT||3001
server.listen(PORT, () =>
  logger.info(`Server is Listening on http://localhost:${PORT}`)
);


module.exports = app

// new changes due to socket:
// 1.added session object to sessionMiddleware variable &it is passed to app.use middleware .before directly passed to app.use
// 2.passed sessionMiddleware to initializeChatSocket() function.
