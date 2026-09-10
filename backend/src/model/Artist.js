const mongoose=require("mongoose");
const schema=new mongoose.Schema({name:{type:String,required:true,unique:true,trim:true},slug:{type:String,required:true,unique:true},portrait:{type:String,default:""},nationality:{type:String,default:""},period:{type:String,default:"Đương đại"},styles:[String],biography:{type:String,default:""},quote:{type:String,default:""},featured:{type:Boolean,default:false}},{timestamps:true});
schema.index({name:"text",biography:"text"});module.exports=mongoose.model("Artist",schema);
