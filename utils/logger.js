export class Logger {
  constructor() {}

  static error(message) {
    console.log(`%c[ERROR] ${message}`, "color : red");
  }

  static info(message) {
    console.log(`%c[INFO] ${message}`, "color : green");
  }

  static warn(message) {
    console.log(`%c[WARN] ${message}`, "color : blue");
  }
}
