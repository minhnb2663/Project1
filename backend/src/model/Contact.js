const mongoose=require("mongoose");
const schema=new mongoose.Schema({name:{type:String,required:true,trim:true,maxlength:100},email:{type:String,required:true,trim:true,lowercase:true},phone:{type:String,trim:true,default:""},subject:{type:String,trim:true,default:"Liên hệ"},message:{type:String,required:true,trim:true,maxlength:3000},status:{type:String,enum:["new","read","resolved"],default:"new"}},{timestamps:true});
schema.index({createdAt:-1,status:1});
module.exports=mongoose.model("Contact",schema);
