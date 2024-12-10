const mongoose = require("mongoose")
const logger = require("../../utils/logger");

var db = mongoose.connection;

// will ensure that update and remove operations are only applied to documents that match the schema definition. 
mongoose.set("strictQuery", true); 

mongoose.connect(process.env.MONGO_URI, {}); 

db.once("open", () => logger.info("Connected to Mongoose "));
db.on("error", (error) =>  logger.error(`Database connection error: ${error.message}`));
db.on("disconnected", () => {
  logger.info("Mongoose Disconnected");
  });
  
module.exports=mongoose.connection;

