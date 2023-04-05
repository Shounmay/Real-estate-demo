import express from "express";
import * as ad from "../controller/ad.js";
import { requireSignin } from "../middlewares/auth.js";

const router=express.Router();
router.post("/upload-image",requireSignin,ad.uploadImage);
router.post("/remove-image",requireSignin,ad.removeImage);
router.post("/ad-create",requireSignin,ad.create);
router.get("/ads",ad.ads);
router.get("/ad/:slug",ad.read);
router.post("/wishlist",requireSignin,ad.addToWishlist);
router.delete("/wishlist/:adId",requireSignin,ad.removeFromWishlist);
export default router;


