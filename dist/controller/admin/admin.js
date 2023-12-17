import { Router } from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { JWT_SECRET_ADMIN } from "../../configs/config.js";
import AdminAuth from "../../middleware/auth-admin.js";
import multer from "multer";
const admin_router = Router();
const prisma = new PrismaClient();
const saltRounds = 10;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images"); // Specify the directory to store the uploaded files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split(".").pop();
        cb(null, file.fieldname + "-" + uniqueSuffix + "." + extension);
    },
});
const upload_dir = multer({ storage: storage });
admin_router.post("/register", [body("email").isEmail()], async (req, res) => {
    const { password, email } = req.body;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    bcrypt.genSalt(saltRounds, async function (_, salt) {
        bcrypt.hash(password, salt, async function (_, hash) {
            try {
                const admin = await prisma.admin.create({
                    data: {
                        email: email,
                        password: hash,
                    },
                });
                res.status(201).json(admin);
            }
            catch (error) {
                res.status(500).send(error);
            }
        });
    });
});
admin_router.post("/login", [body("email").isEmail()], async (req, res) => {
    const { email, password } = req.body;
    const validationErrors = validationResult(req);
    if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
    }
    try {
        const admin = await prisma.admin.findFirst({
            where: {
                email,
            },
        });
        const match = bcrypt.compareSync(password, admin.password);
        if (admin && match) {
            const token = jwt.sign(admin, `${JWT_SECRET_ADMIN}`, {
                expiresIn: "24hr",
            });
            res.cookie("token_admin", token, {
                httpOnly: true,
                expires: new Date(Date.now() + 30 * 60 * 1000),
            });
            res.json({ ...admin, token: token, message: "Login successful" });
        }
        else {
            res.status(401).json({ message: "username or password is incorrect" });
        }
    }
    catch (error) {
        res.send(error);
    }
});
admin_router.post("/add_property", AdminAuth, upload_dir.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 15 },
]), async (req, res) => {
    const { image, images } = req.files;
    const path0 = image[0].path;
    const path1 = images?.map((image) => image.path);
    console.log(req.body);
    const { appartement, address, bathroom, bedroom, city, description, price, kitchen, size, state, property_status, } = req.body;
    try {
        await prisma.listing.create({
            data: {
                property_type: appartement,
                description: description,
                price: parseInt(price),
                address,
                city,
                state,
                size: parseInt(size),
                bedrooms: parseInt(bedroom),
                bathrooms: parseInt(bathroom),
                kitchen: parseInt(kitchen),
                property_status,
                image: path0,
                images: path1,
            },
        });
        res.json({ message: "we reached here" });
    }
    catch (error) {
        console.log(error);
    }
});
admin_router.put("/edit_property/:id", AdminAuth, upload_dir.fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 15 },
]), async (req, res) => {
    const { image, images } = req.files;
    const { id } = req.params;
    const path0 = image[0].path;
    const path1 = images.map((image) => image.path);
    const { appartement, address, bathroom, bedroom, city, description, price, kitchen, size, state, status, } = req.body;
    try {
        await prisma.listing.update({
            where: {
                listing_id: id,
            },
            data: {
                property_type: appartement,
                description: description,
                price: parseInt(price),
                address,
                city,
                state,
                size: parseInt(size),
                bedrooms: parseInt(bedroom),
                bathrooms: parseInt(bathroom),
                kitchen: parseInt(kitchen),
                property_status: status,
                image: path0,
                images: path1,
            },
        });
    }
    catch (error) {
        res.status(400).json({ message: "error updating property" });
    }
});
admin_router.delete("/delete_property/:id", AdminAuth, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.listing.delete({
            where: {
                listing_id: id,
            },
        });
        res.json({ message: "we reached here" });
    }
    catch (error) {
        console.log(error);
    }
});
admin_router.patch("/marksold/:id", AdminAuth, async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    try {
        await prisma.listing.update({
            where: {
                listing_id: id,
            },
            data: {
                available: available,
            },
        });
        res.json({ message: "property is sold" });
    }
    catch (error) {
        console.log(error);
    }
});
export default admin_router;
