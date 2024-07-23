import express from "express";
import dotenv from "dotenv";
import "./database/dataSource";
import { AppDataSource } from "./database/dataSource";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { APPROUTER } from "./appRouters";
import { companysSellOfferService } from "./services/sellOfferService";

const app = express();
app.use(express.json());
dotenv.config({ path: `${process.cwd()}/./.env` });
const PORT = process.env.APP_PORT || 4000;

APPROUTER.forEach(({ path, router }) => app.use(`/api/${path}`, router));

app.use(globalErrorHandler);

// companysSellOfferService(1);

AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
  })
  .catch((error) => console.log(error));
