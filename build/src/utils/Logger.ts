import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
}

export class Logger {
  private category: string;
  private level: LogLevel;
  private logFile?: string;
  private logBuffer: LogEntry[] = [];
  private maxBufferSize: number = 1000;

  constructor(category: string, level: LogLevel = LogLevel.INFO, logFile?: string) {
    this.category = category;
    this.level = level;
    this.logFile = logFile;
  }

  public setLevel(level: LogLevel): void {
    this.level = level;
  }

  public setLogFile(logFile: string): void {
    this.logFile = logFile;
  }

  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public trace(message: string, data?: any): void {
    this.log(LogLevel.TRACE, message, data);
  }

  public success(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data, true);
  }

  private log(level: LogLevel, message: string, data?: any, isSuccess: boolean = false): void {
    if (level > this.level) return;

    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      category: this.category,
      message,
      data
    };

    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    this.writeToConsole(entry, isSuccess);
    this.writeToFile(entry);
  }

  private writeToConsole(entry: LogEntry, isSuccess: boolean = false): void {
    const timestamp = entry.timestamp.toISOString();
    const levelStr = this.getLevelString(entry.level);
    const category = chalk.gray(`[${entry.category}]`);
    
    let message = entry.message;
    if (isSuccess) {
      message = chalk.green(message);
    } else {
      message = this.colorizeMessage(entry.level, message);
    }

    const output = `${timestamp} ${levelStr} ${category} ${message}`;
    console.log(output);

    if (entry.data) {
      console.log(chalk.gray(JSON.stringify(entry.data, null, 2)));
    }
  }

  private writeToFile(entry: LogEntry): void {
    if (!this.logFile) return;

    try {
      const logDir = path.dirname(this.logFile);
      fs.ensureDirSync(logDir);

      const logLine = JSON.stringify({
        timestamp: entry.timestamp.toISOString(),
        level: LogLevel[entry.level],
        category: entry.category,
        message: entry.message,
        data: entry.data
      }) + '\n';

      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Error writing to log file:', error);
    }
  }

  private getLevelString(level: LogLevel): string {
    switch (level) {
      case LogLevel.ERROR:
        return chalk.red('ERROR');
      case LogLevel.WARN:
        return chalk.yellow('WARN ');
      case LogLevel.INFO:
        return chalk.blue('INFO ');
      case LogLevel.DEBUG:
        return chalk.magenta('DEBUG');
      case LogLevel.TRACE:
        return chalk.cyan('TRACE');
      default:
        return 'UNKNOWN';
    }
  }

  private colorizeMessage(level: LogLevel, message: string): string {
    switch (level) {
      case LogLevel.ERROR:
        return chalk.red(message);
      case LogLevel.WARN:
        return chalk.yellow(message);
      case LogLevel.INFO:
        return message;
      case LogLevel.DEBUG:
        return chalk.gray(message);
      case LogLevel.TRACE:
        return chalk.gray(message);
      default:
        return message;
    }
  }

  public getLogs(level?: LogLevel, category?: string): LogEntry[] {
    let filtered = this.logBuffer;

    if (level !== undefined) {
      filtered = filtered.filter(entry => entry.level <= level);
    }

    if (category) {
      filtered = filtered.filter(entry => entry.category === category);
    }

    return filtered;
  }

  public clearBuffer(): void {
    this.logBuffer = [];
  }

  public exportLogs(format: 'json' | 'text' = 'json'): string {
    const logs = this.getLogs();

    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else {
      return logs.map(entry => {
        const timestamp = entry.timestamp.toISOString();
        const level = LogLevel[entry.level];
        return `${timestamp} [${level}] [${entry.category}] ${entry.message}`;
      }).join('\n');
    }
  }

  public async flush(): Promise<void> {
    if (this.logFile && this.logBuffer.length > 0) {
      try {
        const logDir = path.dirname(this.logFile);
        await fs.ensureDir(logDir);

        const logLines = this.logBuffer.map(entry => 
          JSON.stringify({
            timestamp: entry.timestamp.toISOString(),
            level: LogLevel[entry.level],
            category: entry.category,
            message: entry.message,
            data: entry.data
          })
        ).join('\n') + '\n';

        await fs.appendFile(this.logFile, logLines);
        this.clearBuffer();
      } catch (error) {
        console.error('Error flushing logs:', error);
      }
    }
  }
} 