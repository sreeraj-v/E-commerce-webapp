const mongoose = require("mongoose")

var db = mongoose.connection;

// will ensure that update and remove operations are only applied to documents that match the schema definition. 
mongoose.set("strictQuery", true);

mongoose.connect(process.env.MONGO_URI, {});

db.once("open", () => console.log("Connected to Mongoose "));
db.on("error", (error) => console.error(error));
db.on("disconnected", () => {
  console.log("Mongoose Disconnected");
  });
  
module.exports=mongoose.connection;




// DOUBTS:
// var db = mongoose.connection adsh git;