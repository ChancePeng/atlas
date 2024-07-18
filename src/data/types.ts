import type { Selection } from 'd3';

export interface IDesc {
  fill?: string,
  text?: string,
  title?: string,
}

export interface ITag {
  fill?: string,
  text?: string
}


export interface IAttributes {
  width: number,
  height: number,
  x: number,
  y: number,
  expandable?: boolean,
}

export interface FormatOptions<T> {
  father?: IFillData<T>,
  index?: number,
  level?: number,
  attrs: T
}

export interface FieldNames {
  text?: string,
  desc?: string,
  expandable?: string,
  children?: string,
  fill?: string,
  tags?: string,
}

export interface IData<T = any> {
  type: 'root' | 'label' | 'text',
  text?: string,
  desc?: string | string[] | IDesc | IDesc[],
  expandable?: boolean,
  children?: IData<T>[],
  fill?: string,
  tags?: (string | ITag)[],
  extData?: T,
  fieldNames?: FieldNames,
  [data: string]: any
}



export interface IFillData<T = IAttributes, P = any> extends IData<P> {
  __id: string,
  __attrs: T,
  __father?: IFillData<T>,
  __index?: number,
  __brother?: IFillData<T>[],
  __node?: Selection<SVGGElement, unknown, HTMLElement, any>,
  __line?: Selection<SVGPathElement, unknown, HTMLElement, any>,
  __level?: number,
  __children?: IFillData<T>[],
  children?: IFillData<T>[],
}