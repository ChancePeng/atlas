import { IData, IFillData } from "./types";
import { v4 as uuid } from 'uuid';



export const format = <T = Record<string, any>, P = any>(data: IData<P>, option?: {
  father?: IFillData<T, P>,
  index?: number,
  level?: number,
  attrs?: T | ((data: IFillData<T, P>) => T)
}) => {
  const { children } = data;
  const { father, index = 0, level = 0, attrs } = option || {};
  const that = {
    ...data,
    __index: index,
    __father: father,
    __id: uuid(),
    __level: level,
    get __brother() {
      return father?.__children
    },
  } as IFillData<T>;

  if (children?.length) {
    const _option = {
      father: that,
      index,
      level: level + 1,
    }
    that.children = children.map((item, index) => format(item, { ..._option, index, attrs }))
    if (level < 2) {
      that.__children = children.map((item, index) => format(item, { ..._option, index, attrs }))
    }
  }
  if (attrs instanceof Function) {
    that.__attrs = attrs.call(that, that)
  } else if (attrs) {
    that.__attrs = attrs
  }
  return that;
}
