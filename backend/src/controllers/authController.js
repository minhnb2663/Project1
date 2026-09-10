const bcrypt = require("bcrypt");
const User = require("../model/User");
const token = require("../utlis/generateToken");
const safe = (u) => ({
  id: u._id,
  name: u.name,
  email: u.email,
  avatar: u.avatar,
  role: u.role,
  preferences: u.preferences,
});
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      const e = new Error(
        "Name, valid email and password (min 6 characters) are required",
      );
      e.statusCode = 400;
      throw e;
    }
    if (await User.exists({ email: email.toLowerCase() })) {
      const e = new Error("Email này đã được đăng ký");
      e.statusCode = 409;
      throw e;
    }
    const u = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 12),
    });
    res.status(201).json({ success: true, token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
};
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email: email?.toLowerCase() });
    if (
      !u ||
      !u.isActive ||
      !(await bcrypt.compare(password || "", u.password))
    ) {
      const e = new Error("Email hoặc mật khẩu không chính xác");
      e.statusCode = 401;
      throw e;
    }
    res.json({ success: true, token: token(u._id), user: safe(u) });
  } catch (e) {
    next(e);
  }
};
exports.me = (req, res) => res.json({ success: true, user: safe(req.user) });
exports.updateMe = async (req, res, next) => {
  try {
    for (const k of ["name", "avatar", "preferences"])
      if (req.body[k] !== undefined) req.user[k] = req.body[k];
    await req.user.save();
    res.json({ success: true, user: safe(req.user) });
  } catch (e) {
    next(e);
  }
};
exports.listUsers=async(req,res,next)=>{try{const page=Math.max(+req.query.page||1,1),limit=Math.min(+req.query.limit||50,100),filter=req.query.q?{$or:[{name:new RegExp(req.query.q,"i")},{email:new RegExp(req.query.q,"i")}]}:{};const [data,total]=await Promise.all([User.find(filter).select("-password").sort("-createdAt").skip((page-1)*limit).limit(limit),User.countDocuments(filter)]);res.json({success:true,data,pagination:{page,limit,total}})}catch(e){next(e)}};
exports.updateUser=async(req,res,next)=>{try{if(String(req.params.id)===String(req.user._id)&&req.body.isActive===false){const e=new Error("Bạn không thể tự khóa tài khoản của mình");e.statusCode=400;throw e}const changes={};for(const k of ["role","isActive"])if(req.body[k]!==undefined)changes[k]=req.body[k];const user=await User.findByIdAndUpdate(req.params.id,changes,{new:true,runValidators:true}).select("-password");if(!user){const e=new Error("Không tìm thấy người dùng");e.statusCode=404;throw e}res.json({success:true,data:user})}catch(e){next(e)}};
exports.listUsers=async(req,res,next)=>{try{const page=Math.max(+req.query.page||1,1),limit=Math.min(+req.query.limit||50,100),filter=req.query.q?{$or:[{name:new RegExp(req.query.q,"i")},{email:new RegExp(req.query.q,"i")}]}:{};const [data,total]=await Promise.all([User.find(filter).select("-password").sort("-createdAt").skip((page-1)*limit).limit(limit),User.countDocuments(filter)]);res.json({success:true,data,pagination:{page,limit,total}})}catch(e){next(e)}};
exports.updateUser=async(req,res,next)=>{try{if(String(req.params.id)===String(req.user._id)&&req.body.isActive===false){const e=new Error("Bạn không thể tự khóa tài khoản của mình");e.statusCode=400;throw e}const changes={};for(const k of ["role","isActive"])if(req.body[k]!==undefined)changes[k]=req.body[k];const user=await User.findByIdAndUpdate(req.params.id,changes,{new:true,runValidators:true}).select("-password");if(!user){const e=new Error("Không tìm thấy người dùng");e.statusCode=404;throw e}res.json({success:true,data:user})}catch(e){next(e)}};

