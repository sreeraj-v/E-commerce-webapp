const mongoose=require('mongoose');

const bannerSchema=mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    image:[
        {
            type:String
        }
    ]  
})

module.exports= mongoose.model("Banner", bannerSchema)