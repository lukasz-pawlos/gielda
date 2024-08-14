import express from "express";
import dotenv from "dotenv";
import "./database/dataSource";
import { AppDataSource } from "./database/dataSource";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { APPROUTER } from "./appRouters";
import { createStockLog } from "./utils/logger/createlog";

const app = express();
app.use(express.json());
dotenv.config({ path: `${process.cwd()}/./.env` });
const PORT = process.env.APP_PORT || 4000;

APPROUTER.forEach(({ path, router }) => app.use(`/api/${path}`, router));

app.use(globalErrorHandler);

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
    setInterval(await createStockLog, 5000);
  })
  .catch((error) => console.log(error));
