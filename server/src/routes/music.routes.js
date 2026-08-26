import express from "express";
import { searchTracks } from "../services/jamendo.service.js";

const router = express.Router();

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim() || "";
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 20, 50);

    const result = await searchTracks({
      query,
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.results || [],
      meta: {
        page,
        limit,
        total: result.headers?.results_count || 0,
      },
    });
  } catch (error) {
    console.error(
      "Jamendo error:",
      error.response?.data || error.message
    );

    res.status(502).json({
      success: false,
      message: "Unable to fetch music from Jamendo",
    });
  }
});

export default router;