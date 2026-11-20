import { healthResponse } from "../health";
import { r, type Route } from "../core";
import { deviceRoutes } from "./device";
import { financeRoutes } from "./finance";
import { salesRoutes } from "./sales";
import { resourceRoutes } from "./resources";
import { miscRoutes } from "./misc";
import { exportRoutes } from "./exports";
import { fileRoutes } from "./files";
import { p2Routes } from "./p2";
import { prdRoutes } from "./prd";
import { accountRoutes } from "./account";

export const routes: Route[] = [
  r("GET", "/health", { auth: "none" }, async () => {
    return healthResponse();
  }),
  ...deviceRoutes,
  ...accountRoutes,
  ...financeRoutes,
  ...salesRoutes,
  ...resourceRoutes,
  ...miscRoutes,
  ...exportRoutes,
  ...fileRoutes,
  ...p2Routes,
  ...prdRoutes,
];
