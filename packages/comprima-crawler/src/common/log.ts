import chalk from 'chalk';
import config from './config';

export interface Log {
  debug: (message: string, data?: object, ...rest: string[]) => void;
  error: (title: string, error?: Error) => void;
  info: (message: string, data?: object | string, ...rest: string[]) => void;
  warn: (title: string, error?: Error) => void;
}

const logLevelIsAtLeastDebug = config.logLevel.toUpperCase() === 'DEBUG';
const logLevelIsAtLeastInfo =
  config.logLevel.toUpperCase() === 'INFO' || logLevelIsAtLeastDebug;
const logLevelIsAtLeastWarn =
  config.logLevel.toUpperCase() === 'WARN' || logLevelIsAtLeastInfo;

  export default {
    debug: (message: string, data?: object, ...rest: string[]) => {
      if (!logLevelIsAtLeastDebug) {
        return;
      }
  
      console.debug(
        `${chalk.whiteBright.bold('DEBUG')} ${chalk.gray(
          message
        )}`
      );
  
      if (data) {
        console.error(JSON.stringify(data, null, 2), ...rest);
      }
    },
    error: (title: string, error?: Error) => {
      console.error(`${chalk.redBright.bold('ERROR')} ${chalk.red(title)}`);
      if (error) {
        console.error(error);
      }
    },
    info: (message: string, data?: object | string, ...rest: string[]) => {
      if (!logLevelIsAtLeastInfo) {
        return;
      }

      console.log(
        `${chalk.whiteBright.bold('INFO ')} ${chalk.white(
          message
        )}`,
        data,
        ...rest
      );
    },
    warn: (title: string, error?: Error) => {
      if (!logLevelIsAtLeastWarn) {
        return;
      }
  
      console.log(
        `${chalk.red.bold('WARN ')} ${chalk.white(title)} ${chalk.white(
          title
        )}`
      );
      if (error) {
        console.error(error);
      }
    },
  } as Log
