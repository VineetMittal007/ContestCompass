const express = require("express");
const router = express.Router();
const User = require("../model/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// User registration
router.post("/register", async (req, res) => {
    try {
        const { username, password, email } = req.body; // Extract email from request body
        const user = new User({ username, password, email }); // Create user with email
        await user.save();
        res.status(201).send({ message: "User registered successfully" });
    } catch (error) {
        res.status(400).send(error);
    }
});

// User login
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.send({ token, user: { username: user.username } });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;