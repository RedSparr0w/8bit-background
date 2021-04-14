interface Events {
  [key: string]: Array<(...rest: any) => void>;
}

export default class EventEmitter {
  public events: Events;
  constructor(events?: Events) {
    this.events = events || {};
  }

  public subscribe(name: string, cb: (...rest: any) => void): Record<string, () => void> {
    (this.events[name] || (this.events[name] = [])).push(cb);

    return {
      unsubscribe: () => this.events[name] && this.events[name].splice(this.events[name].indexOf(cb) >>> 0, 1),
    };
  }

  public emit(name: string, ...rest: any[]): void {
    (this.events[name] || []).forEach(fn => fn(...rest));
  }
}
