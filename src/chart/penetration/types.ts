import type { IAttributes, IFillData } from "@/data";

export interface Attributes extends IAttributes {
  box: {
    width: number
  }
  bbox: {
    height: number
  }
  spans: string[],
}

export type FillData = IFillData<Attributes>;

export type Position = 'top' | 'bottom'