import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import verdictRouter from "./verdict.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/verdict", verdictRouter);

export default router;
