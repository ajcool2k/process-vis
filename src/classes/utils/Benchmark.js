export class Benchmark {
  static messure (fname, callback) {
    let t0 = performance.now()
    callback()
    let t1 = performance.now()
    console.log(fname + ': ' + (t1 - t0) + ' milliseconds')
  }
}
