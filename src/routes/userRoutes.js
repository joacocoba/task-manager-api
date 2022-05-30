const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { sendWelcomeEmail, sendCancelationEmail } = require("../emails/account");

// GET ALL USERS
router.get("/", async (req, res) => {
  try {
    let users = await User.find();
    res.status(200).send(users);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// GET USER PROFILE
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// REGISTER
router.post("/", async (req, res) => {
  const { name, password, email, age } = req.body;
  try {
    let user = new User({
      name,
      password,
      email,
      age,
    });
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({
      message: "User created",
      user,
      token,
    });

    sendWelcomeEmail(user.email, user.name);
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByCredentials(email.toLowerCase(), password);
    const token = await user.generateAuthToken();
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).send({
      message: error.message,
    });
  }
});

// LOGOUT
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

    await req.user.save();
    res.status(200).send("Logout succesfully");
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

// LOGOUT FROM ALL DEVICES
router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.status(200).send("Succesfully logged out from all devices.");
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

// UPDATE USER
router.patch("/me", auth, async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update)
    );

    if (!isValidOperation)
      return res.status(400).send({ error: "Invalid updates" });

    updates.forEach((update) => (req.user[update] = req.body[update]));
    const updatedUser = await req.user.save();
    res.status(200).send(updatedUser);
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// DELETE USER
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.delete();
    sendCancelationEmail(req.user.email, req.user.name);
    res.status(200).send({
      message: "User deleted",
      user: req.user,
    });
  } catch (error) {
    res.status(500).send({
      message: error.message,
    });
  }
});

// Multer Config for Avatar Upload
const upload = multer({
  limits: {
    fileSize: 1000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Not an image"));
    }
    cb(undefined, true);
  },
});

// Add User Avatar
router.post(
  "/me/avatar",
  auth,
  upload.single("upload"),
  async (req, res) => {
    try {
      // req.user.avatar = req.file.buffer;
      const buffer = await sharp(req.file.buffer)
        .resize({ width: 250, height: 250 })
        .png()
        .toBuffer();

      req.user.avatar = buffer;
      await req.user.save();
      res.status(200).send("Image saved succesfully");
    } catch (error) {
      res.status(500).send({
        error: error.message,
      });
    }
  },
  (err, req, res, next) => {
    res.status(400).send(err.message);
  }
);

// Remove User Avatar
router.delete("/me/avatar", auth, async (req, res) => {
  try {
    req.user.avatar = undefined;
    await req.user.save();
    res.status(200).send("The image has been removed succesfully");
  } catch (error) {
    res.status(500).send({
      error: error.message,
    });
  }
});

// Get Avatar by Id
router.get("/:id/avatar", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user || !user.avatar) throw new Error("Avatar not found");

    res.set("Content-Type", "image/png");
    res.status(200).send(user.avatar);
  } catch (error) {
    res.status(404).send({
      error: error.message,
    });
  }
});

module.exports = router;
