import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

const logDir = "logs";
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

type CsvHeader = { id: string; title: string };

const updateCsvHeaders = <T>(object: T, filePath: string): CsvHeader[] => {
  const headersPath = `${filePath}.headers.json`;
  let existingHeaders: string[] = [];

  if (existsSync(headersPath)) {
    existingHeaders = JSON.parse(readFileSync(headersPath, "utf-8"));
  }

  const newHeaders = ["timestamp", ...Object.keys(object as Record<string, any>)];
  const updatedHeaders = Array.from(new Set([...existingHeaders, ...newHeaders]));

  writeFileSync(headersPath, JSON.stringify(updatedHeaders), "utf-8");

  return updatedHeaders.map((header) => ({ id: header, title: header }));
};

const logger = createLogger({
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.printf(({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`)
  ),
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      filename: `${logDir}/application-%DATE%.log`,
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
    }),
  ],
});

const csvWriters: { [key: string]: any } = {};

export const log = async <T>(level: string, message: T, filePath: string = join(logDir, "logs.csv")) => {
  const messageString = JSON.stringify(message);
  logger.log({ level, message: messageString });

  const headersPath = `${filePath}.headers.json`;
  let existingHeaders: string[] = [];

  if (existsSync(headersPath)) {
    existingHeaders = JSON.parse(readFileSync(headersPath, "utf-8"));
  }

  const newHeaders = ["timestamp", ...Object.keys(message as Record<string, any>)];
  const updatedHeaders = Array.from(new Set([...existingHeaders, ...newHeaders]));

  if (!csvWriters[filePath] || JSON.stringify(existingHeaders) !== JSON.stringify(updatedHeaders)) {
    writeFileSync(headersPath, JSON.stringify(updatedHeaders), "utf-8");
    csvWriters[filePath] = createObjectCsvWriter({
      path: filePath,
      header: updatedHeaders.map((header) => ({ id: header, title: header })),
      append: true,
    });
  }

  const logRecord = { timestamp: new Date().toISOString(), ...message };
  try {
    await csvWriters[filePath].writeRecords([logRecord]);
  } catch (error) {
    console.error("Failed to write log to CSV", error);
  }
};
