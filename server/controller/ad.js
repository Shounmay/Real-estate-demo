import * as config from "../config.js";
import { nanoid } from "nanoid";
import Ad from "../models/ad.js";
import User from "../models/user.js"
import slugify from "slugify";
import ad from "../models/ad.js";
import { emailTemplate } from "../helper/email.js";
export const uploadImage = async (req, res) => {
  try {
    // console.log(req.body);
    const { image } = req.body;

    const base64Image = new Buffer.from(
      image.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const type = image.split(";")[0].split("/")[1];

    // image params
    const params = {
      Bucket: "real-estate-project-vaibhav",
      Key: `${nanoid()}.${type}`,
      Body: base64Image,
      ACL: "public-read",
      ContentEncoding: "base64",
      ContentType: `image/${type}`,
    };

    config.AWSS3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        res.sendStatus(400);
      } else {
         console.log(data);
        res.send(data);
      }
    });
  } catch (err) {
    console.log(err);
    res.json({ error: "Upload failed. Try again." });
  }
};

export const removeImage=async(req,res)=>{
try{
    const{Key,Bucket}=req.body;
   config.AWSS3.deleteObject({Bucket,Key},(err,data)=>{
     if(err){
        console.log(err);
        res.sendStatus(403);
     }else{
        res.send({ok:true});
     }
   });
}
catch(err){
console.log(err);
}
}

export const create=async(req,res)=>{
  try{
    //console.log(req.body);
    const{photos,description,title,address,price,type,landsize}=req.body;
    if(!photos?.length){
return res.json({error:"Photo is required"});}
if(!description){
  return res.json({error:"Description is required"});
    }
    if(!title){
      return res.json({error:"Title is required"});
        }
        if(!address){
          return res.json({error:"Address is required"});
            }
            if(!price){
              return res.json({error:"Price is required"});
            }
            
            if(!landsize){
              return res.json({error:"LandSize is required"});
            }
//const geo=await config.GOOGLE_GEOCODER.geocode(address);
//console.log(geo); 
const ad=await new Ad({
  ...req.body,
  postedBy: req.user._id,
  // location: {
  //   type: "Point",
  //   coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
  // },
  // googleMap: geo,
  slug: slugify(`${type}-${address}-${price}-${nanoid(6)}`),
}).save();
// make user role > Seller
const user = await User.findByIdAndUpdate(
  req.user._id,
  {
    $addToSet: { role: "Seller" },
  },
  { new: true }
);

user.password = undefined;
user.resetCode = undefined;

res.json({
  ad,
  user,
});
 }
  catch(err){
    res.json({error:"Something went wrong"});
    console.log(err);

  }
}

export const ads=async(req,res)=>{
try{
  const adsforSell=await Ad.find({action:"Sell"})
  .select("-photos.Key -photos.key -photos.ETag")
  .sort({createdAt:-1}).limit(12);

  const adsforRent=await Ad.find({action:"Rent"})
  .select("-photos.Key -photos.key -photos.ETag")
  .sort({createdAt:-1}).limit(12);
   
  res.json({adsforRent,adsforSell});
}
catch(err){
  res.json({error:"Something went wrong"});
console.log(err);
  
}
}

export const read=async(req,res)=>{
  try{
    const ad=await Ad.findOne({slug:req.params.slug}).populate(
      "postedBy",
      "name username email phone company photo.Location"
    )
    console.log(ad);
    
    const related = await Ad.find({
      _id: { $ne: ad._id },
      action: ad.action,
      type: ad.type,
      address: {
        $regex: ad.address,
        $options: "i",
      },
    })
      .limit(3)
      .select("-photos.Key -photos.key -photos.ETag -photos.Bucket -googleMap");
    res.json({ad,related})
  }
  catch(err){
    res.json({error:"Something went wrong"});
console.log(err);
  }
}
export const addToWishlist=async(req,res)=>{
try{
  const user=await User.findByIdAndUpdate(
    req.user._id,{
      $addToSet:{wishlist:req.body.adId},
  },
  {new:true});
  user.password = undefined;
  user.resetCode = undefined;
  res.json(user);
}
catch(err){
console.log(err);
}
}

export const removeFromWishlist=async(req,res)=>{
  try{
    const user=await User.findByIdAndUpdate(
      req.user._id,{
        $pull:{wishlist:req.params.adId},
    },
    {new:true});
    user.password = undefined;
    user.resetCode = undefined;
    res.json(user);
  }
  catch(err){
  console.log(err);
  }
  }

  export const contactSeller = async (req, res) => {
    try {
      const { name, email, message, phone, adId } = req.body;
      const ad = await Ad.findById(adId).populate("postedBy", "email");
  
      const user = await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { enquiredProperties: adId },
      });
  
      if (!user) {
        return res.json({ error: "Could not find user with that email" });
      } else {
        // send email
        config.AWSSES.sendEmail(
          emailTemplate(
            ad.postedBy.email,
            `
          <p>You have received a new customer enquiry regarding your property</p>
  
            <h4>Customer details</h4>
            <p>Name: ${name}</p>
            <p>Email: ${email}</p>
            <p>Phone: ${phone}</p>
            <p>Message: ${message}</p>
  
          <a href="${config.CLIENT_URL}/ad/${ad.slug}">${ad.type} in ${ad.address} for ${ad.action} ${ad.price}</a>
          `,
            email,
            "New enquiry received"
          ),
          (err, data) => {
            if (err) {
              console.log(err);
              return res.json({ ok: false });
            } else {
              console.log(data);
              return res.json({ ok: true });
            }
          }
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  export const userAds = async (req, res) => {
    try {
      const perPage = 3;
      const page = req.params.page ? req.params.page : 1;
  
      const total = await Ad.find({ postedBy: req.user._id });
  
      const ads = await Ad.find({ postedBy: req.user._id })
        .populate("postedBy", "name email username phone company")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .sort({ createdAt: -1 });
  
      res.json({ ads, total: total.length });
    } catch (err) {
      console.log(err);
    }
  };
  export const update = async (req, res) => {
    try {
      const { photos, price, type, address, description } = req.body;
  
      const ad = await Ad.findById(req.params._id);
  
      const owner = req.user._id == ad?.postedBy;
  
      if (!owner) {
        return res.json({ error: "Permission denied" });
      } else {
        // validation
        if (!photos.length) {
          return res.json({ error: "Photos are required" });
        }
        if (!price) {
          return res.json({ error: "Price is required" });
        }
        if (!type) {
          return res.json({ error: "Is property hour or land?" });
        }
        if (!address) {
          return res.json({ error: "Address is required" });
        }
        if (!description) {
          return res.json({ error: "Description are required" });
        }
  
       // const geo = await config.GOOGLE_GEOCODER.geocode(address);
  
        await ad.update({
          ...req.body,
          slug: ad.slug,
          // location: {
          //   type: "Point",
          //   coordinates: [geo?.[0]?.longitude, geo?.[0]?.latitude],
          // },
        });
  
        res.json({ ok: true });
      }
    } catch (err) {
      console.log(err);
    }
  };
  export const enquiriedProperties = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const ads = await Ad.find({ _id: user.enquiredProperties }).sort({
        createdAt: -1,
      });
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  };
  export const remove = async (req, res) => {
    try {
      const ad = await Ad.findById(req.params._id);
      const owner = req.user._id == ad?.postedBy;
  
      if (!owner) {
        return res.json({ error: "Permission denied" });
      } else {
        await Ad.findByIdAndRemove(ad._id);
        res.json({ ok: true });
      }
    } catch (err) {
      console.log(err);
    }
  };
  export const wishlist = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const ads = await Ad.find({ _id: user.wishlist }).sort({
        createdAt: -1,
      });
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  };
  export const adsForSell = async (req, res) => {
    try {
      const ads = await Ad.find({ action: "Sell" })
        .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
        .sort({ createdAt: -1 })
        .limit(24);
  
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  };
  
  export const adsForRent = async (req, res) => {
    try {
      const ads = await Ad.find({ action: "Rent" })
        .select("-googleMap -location -photo.Key -photo.key -photo.ETag")
        .sort({ createdAt: -1 })
        .limit(24);
  
      res.json(ads);
    } catch (err) {
      console.log(err);
    }
  };
  export const search = async (req, res) => {
    try {
      console.log("req query", req.query);
      const { action, address, type, priceRange } = req.query;

  
      const ads = await Ad.find({
        action: action === "Buy" ? "Sell" : "Rent",
        type,
        price: {
          $gte: parseInt(priceRange[0]),
          $lte: parseInt(priceRange[1]),
        },
        
        address: { $regex: new RegExp(address, "i") }
      })
        .limit(24)
        .sort({ createdAt: -1 })
        .select(
          "-photos.key -photos.Key -photos.ETag -photos.Bucket "
        );
       console.log(ads);
      res.json(ads);
    } catch (err) {
      console.log();
    }
  };