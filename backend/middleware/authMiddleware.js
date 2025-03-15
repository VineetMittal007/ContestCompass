const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).send({ message: "Invalid token" });
            }

            req.userId = decoded.userId; // Add userId to request object
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        res.status(401).send({ message: "Authorization header missing" });
    }
};

module.exports = authMiddleware;