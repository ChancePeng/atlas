import { IData } from "../data"

export interface IEvent extends Record<string, ((...args: any[]) => any) | undefined> {
  request?: (data: IData) => Promise<IData[]> | IData[]
}

