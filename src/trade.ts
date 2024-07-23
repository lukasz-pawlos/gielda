import { AppDataSource } from "./database/dataSource";
import { trade } from "./services/tradeService";

AppDataSource.initialize()
  .then(async () => {
    trade();
  })
  .catch((error) => console.log(error));
