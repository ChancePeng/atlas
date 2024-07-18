import type { IAttributes, IFillData } from "@/data";


export interface Attributes extends IAttributes {
  box: {
    width: number
  },
}

export type FillData = IFillData<Attributes>