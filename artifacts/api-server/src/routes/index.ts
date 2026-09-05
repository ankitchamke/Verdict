import { Router, type IRouter } from "express";
import healthRouter from "./health";
import verdictRouter from "./verdict";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/verdict", verdictRouter);

export default router;
