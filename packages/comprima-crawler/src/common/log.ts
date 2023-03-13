import chalk from 'chalk';
import config from './config';

export interface Log {
  debug: (title: string, message: string, data: Object, ...rest: any[]) => void;
  error: (title: string, error: Error, data: Object, ...rest: any[]) => void;
  info: (message: string, data?: Object, ...rest: any[]) => void;
}

const logLevelIsAtLeastDebug = config.logLevel.toUpperCase() === 'DEBUG';
const logLevelIsAtLeastInfo =
  config.logLevel.toUpperCase() === 'INFO' || logLevelIsAtLeastDebug;
const logLevelIsAtLeastWarn =
  config.logLevel.toUpperCase() === 'WARN' || logLevelIsAtLeastInfo;

  export default {
    debug: (title: string, message: string, data = '', ...rest: any[]) => {
      if (!logLevelIsAtLeastDebug) {
        return;
      }
  
      console.debug(
        `${chalk.whiteBright.bold('DEBUG')} ${chalk.gray(title)} ${chalk.gray(
          message
        )}`
      );
  
      if (data) {
        console.error(JSON.stringify(data, null, 2), ...rest);
      }
    },
    error: (title: string, error: Error, data: Object, ...rest: any[]) => {
      console.error(`${chalk.redBright.bold('ERROR')} ${chalk.red(title)}`);
      console.error(error);

      if (data) {
        console.error(JSON.stringify(data, null, 2), ...rest);
      }
    },
    info: (message: string, data = '', ...rest: any[]) => {
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
  } as Log

// module.exports = {
//   info: (title: string, message: string, data = '', ...rest: any[]) => {
//     if (!logLevelIsAtLeastInfo) {
//       return;
//     }

//     console.log(
//       `${chalk.whiteBright.bold('INFO ')} ${chalk.white(title)} ${chalk.white(
//         message
//       )}`,
//       data,
//       ...rest
//     );
//   },
//   warn: (title: string, message: string, data = '', ...rest: any[]) => {
//     if (!logLevelIsAtLeastWarn) {
//       return;
//     }

//     console.log(
//       `${chalk.red.bold('WARN ')} ${chalk.white(title)} ${chalk.white(
//         message
//       )}`,
//       data,
//       ...rest
//     );
//   },
// };
