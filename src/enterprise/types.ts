import type { Selection } from 'd3'


export interface IDesc {
  fill?: string,
  text?: string
}

export type Position = 'left' | 'right';



export interface IEvent extends Record<string, unknown | undefined> {
  request?: (data: IData) => Promise<IData[]> | IData[]
}

export interface IData {
  type: 'root' | 'label' | 'text',
  text?: string,
  desc?: string | string[] | IDesc | IDesc[],
  expandable?: boolean,
  children?: IData[],
  fill?: string,
  extData?: any,
}


interface Attributes {
  fill: string,
  width: number,
  height: number,
  x: number,
  y: number,
  bbox: {
    width: number,
    height: number
  },
  box: {
    width: number,
    height: number
  }
  padding: number,
  __expandable?: boolean,
}



export interface IFillData extends IData {
  __id: string,
  __attrs: Attributes,
  __father?: IFillData,
  __index?: number,
  __brother?: IFillData[],
  __node?: Selection<SVGGElement, unknown, HTMLElement, any>,
  __line?: Selection<SVGPathElement, unknown, HTMLElement, any>,
  __level?: number,
  __children?: IFillData[],
  children?: IFillData[],
}