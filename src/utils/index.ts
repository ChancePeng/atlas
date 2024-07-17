
export function count(str: string) {
  let count = 0;
  const arr = str?.split('') || [];
  arr.forEach((item: string) => {
    count += Math.ceil(item.charCodeAt(0).toString(2).length / 8);
  });
  return count;
}

export function width(str: string) {
  return count(str) * 6 + 14;
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