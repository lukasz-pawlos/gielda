import dotenv from "dotenv";
import { AppDataSource } from "./database/dataSource";
import { trade } from "./services/tradeService";
import { createTradeCpuLog } from "./utils/logger/createlog";

dotenv.config({ path: `${process.cwd()}/./.env` });

AppDataSource.initialize()
  .then(async () => {
    trade();
    setInterval(async () => {
      await createTradeCpuLog(Number(process.env.TRADE_ID));
    }, 1000);
  })
  .catch((error) => console.log(error));
