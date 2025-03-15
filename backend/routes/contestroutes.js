const express = require("express");
const { fetchAllContests } = require("../scrapers/contestscraper");
const authMiddleware = require("../middleware/authMiddleware"); // Import middleware

const router = express.Router();
// Apply the middleware to all routes in this file
// router.use(authMiddleware);
router.get("/contests", async (req, res) => {
  const contests = await fetchAllContests();
  res.json(contests);
});

module.exports = router;
