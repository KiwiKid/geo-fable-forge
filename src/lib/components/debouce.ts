
type FunctionType = (...args: any[]) => void;

const debounce = (func: FunctionType, wait: number): FunctionType => {
    let lastCallTime: number | undefined;

    return (...args: any[]): void => {
      const currentCallTime = Date.now();
      if (lastCallTime && currentCallTime - lastCallTime < wait) {
        return;
      }
  
      lastCallTime = currentCallTime;
      func(...args);
    };
}

export {
    debounce
}