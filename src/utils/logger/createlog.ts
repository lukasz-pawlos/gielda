import si from "systeminformation";
import { log } from "./logger";

interface StockLog {
  cpuUsage: number;
  memoryUsage: number;
}

export interface APILog {
  apiMethod: "GET" | "POST" | "DELETE";
  apiTime: number;
  applicationTime: number;
  databaseTime: number;
  endpointUrl: string;
}

export interface TradeCpuLog extends StockLog {
  replicaId: number;
}

export interface TradeLog {
  applicationTime: number;
  databaseTime: number;
  numberOfSellOffers: number;
  numberOfBuyOffers: number;
}

export const createLog = async (info: APILog | TradeLog, path: string) => {
  log("info", info, `logs/${path}`);
};

const cpuMemoryUse = async () => {
  const cpuLoad = await si.currentLoad();
  const memory = await si.mem();

  const cpuUsage = parseFloat(cpuLoad.currentLoad.toFixed(2));
  const memoryUsage = parseFloat(((memory.active / memory.total) * 100).toFixed(2));

  const message: StockLog = {
    cpuUsage,
    memoryUsage,
  };

  return message;
};

export const createStockLog = async () => {
  const message = await cpuMemoryUse();
  log("info", message, "logs/stockUse.csv");
};

export const createTradeCpuLog = async (replicaId: number) => {
  const cpuMemory = await cpuMemoryUse();
  const message: TradeCpuLog = { ...cpuMemory, replicaId };

  log("info", message, `logs/tradeCpu${replicaId}.csv`);
};
