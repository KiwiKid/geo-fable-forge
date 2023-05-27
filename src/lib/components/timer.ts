class Timer {
  private timerId?: NodeJS.Timeout;
  private shouldStop = false;
  private startTime?: number;

  methodToCallEverySecond(elapsedTime: number): void {
    console.log(`Called after ${elapsedTime} seconds...`);
    // put your code here
  }

  start(): void {
    this.shouldStop = false;
    this.startTime = Date.now();
    this.methodToCallEverySecond(0);
    this.timerId = setInterval(() => {
      if (!this.shouldStop) {
        const elapsedTime = (Date.now() - this.startTime!) / 1000;
        console.log(elapsedTime)
        this.methodToCallEverySecond(+elapsedTime.toFixed(0));
      }
    }, 1000);
  }

  stop(): void {
    this.shouldStop = true;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }
}

export {
  Timer
}