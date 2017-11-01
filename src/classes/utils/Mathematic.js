export class Mathematic {
  static getRandomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
}
