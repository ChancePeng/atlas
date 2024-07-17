import { IAttributes } from "../../data";

export interface Attributes extends IAttributes {
  box: {
    width: number
  }
  bbox: {
    height: number
  }
  spans: string[],
}
