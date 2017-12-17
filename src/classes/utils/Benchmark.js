export class Benchmark {
  static messure (fname, callback) {
    let t0 = global.performance.now()
    callback()
    let t1 = global.performance.now()
    console.log(fname + ': ' + (t1 - t0) + ' milliseconds')
  }
}
