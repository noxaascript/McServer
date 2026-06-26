import { Router, type IRouter } from "express";
import healthRouter from "./health";
import configRouter from "./config";
import modsRouter from "./mods";

const router: IRouter = Router();

router.use(healthRouter);
router.use(configRouter);
router.use(modsRouter);

export default router;
