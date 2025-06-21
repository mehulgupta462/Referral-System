import express from "express";
import { createEarnings } from "../controllers/earningsController.js";

const earningRouter = express.Router();

const earningsRoute = (io) => {
  earningRouter.post("/", (req, res) => createEarnings(req, res, io));
  return earningRouter;
};

export default earningsRoute;
