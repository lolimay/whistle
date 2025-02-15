const { PerformanceObserver, performance } = require('perf_hooks');
const { green, yellow, red, blue } = require('colors');

const identity = x => x;
const log = (msg, color = identity) => {
  require('console').log(color(msg));
};
const colorize = duration => {
  if (duration < 100) return green(`${ duration }ms`);
  if (duration > 1000) return red(`${ duration }ms`);
  return yellow(`${ duration }ms`);
};

if (process.env.VERBOSE) {
  new PerformanceObserver(list => {
    const [entry] = list.getEntries();
    const { name, duration } = entry;
    log(`${ name }: ${ colorize(duration) }`);
  }).observe({ entryTypes: ['measure'], buffered: false });
}

module.exports = {
  log,
  perf: new class {
    _startMark = '_start_';
    start(mark) {
      this._startMark = mark;
      performance.mark(this._startMark);
      if (process.env.VERBOSE) log(`${ mark}: ${ colorize(0) }`);
    }
    measure(mark = '') {
      const trace = Error().stack.toString().split('\n').filter(line => {
        return line.replace('at ', '').split(' ').filter(Boolean).length > 1;
      })[1].replace('at ', '').split(' ').filter(Boolean);
      const [fn, position] = trace;
      const pos = position.split('/lib/')[1].slice(0, -1);
      performance.mark(mark);
      performance.measure(`${ blue(mark) } ${ fn } at ${ pos }`, this._startMark, mark);
    }
  }
};
