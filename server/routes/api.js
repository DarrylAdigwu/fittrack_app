import express from "express";

// Create Router
const router = express.Router();

router.route("/")
.get(async (req, res) => {
  return res.status(200).json({
    checking: {"word": "hello, world"}
  });
});


export default router;