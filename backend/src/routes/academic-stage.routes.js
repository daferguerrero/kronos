import { Router } from "express";

import { calculate } from "../controllers/academic-stage.controller.js";

const router = Router();

router.post("/calculate", calculate);

export default router;
