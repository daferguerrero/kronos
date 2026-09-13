import { Router } from "express";

import { create } from "../controllers/schedule-config.controller.js";

const router = Router();

router.post("/", create);

export default router;
