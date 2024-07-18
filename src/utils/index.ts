
export function count(str: string) {
  let count = 0;
  const arr = str?.split('') || [];
  arr.forEach((item: string) => {
    count += Math.ceil(item.charCodeAt(0).toString(2).length / 8);
  });
  return count;
}

interface Option {
  size?: number,
  padding?: number
}

export function pixel(str: string, option?: Option) {
  const { size = 12, padding = 14 } = option || {};
  return count(str) * size / 2 + padding;
}


export function split(str: string, length: number = 12) {
  const _length = length * 2;
  const arr = str?.split('') || [];
  let _str = '';
  let _count = 0;
  const result: string[] = [];
  const arrLength = arr.length;
  arr.forEach((item: string, index: number) => {
    const count = Math.ceil(item.charCodeAt(0).toString(2).length / 8);
    _count += count;
    if (_count <= _length) {
      _str += item;
      if (index === arrLength - 1) {
        result.push(_str)
      }
    } else {
      _count = count;
      result.push(_str)
      _str = item;
    }
  });
  return result;
}


export const animationFrame = <T = unknown>(
  stack: (T | undefined)[], callback: (item: T, stop: () => void) => void,
  onFinished?: (index: number) => void
) => {

  let state = true;
  let index = 0;
  const stop = () => {
    state = false;
  }
  const animationCallback = () => {
    const item = stack.shift();
    if (item) {
      callback(item, stop)
    }
    index++;
    if (stack.length && state) {
      requestAnimationFrame(animationCallback)
    } else {
      onFinished?.(index)
    }
  }
  requestAnimationFrame(animationCallback)
}