
import type { IAttributes, IFillData } from "@/data";

export interface Attributes extends IAttributes {
  box: {
    height: number
  }
}


export type FillData = IFillData<Attributes>