import { createLogger, format, transports } from "winston";
import "winston-daily-rotate-file";
import { createObjectCsvWriter } from "csv-writer";
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join } from "path";

// Upewnij się, że katalog na logi istnieje
const logDir = "logs";
if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

// Definicja typu nagłówka CSV
type CsvHeader = { id: string; title: string };

// Funkcja do tworzenia lub aktualizacji nagłówków w pliku CSV
const updateCsvHeaders = <T>(object: T, filePath: string): CsvHeader[] => {
  const headersPath = `${filePath}.headers.json`;
  let existingHeaders: string[] = [];

  if (existsSync(headersPath)) {
    existingHeaders = JSON.parse(readFileSync(headersPath, "utf-8"));
  }

  const newHeaders = ["timestamp", ...Object.keys(object as Record<string, any>)]; // Dodajemy timestamp do nagłówków
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

// Mapa przechowująca instancje CsvWriter dla różnych plików
const csvWriters: { [key: string]: any } = {};

// Funkcja do logowania i zapisywania w CSV
export const log = async <T>(level: string, message: T, filePath: string = join(logDir, "logs.csv")) => {
  // Konwersja obiektu message na string przed przekazaniem do loggera
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
    console.log("Creating or updating csvWriter for:", filePath);
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
