
import { IAttributes } from "../../data";
export type Position = 'left' | 'right';




export interface Attributes extends IAttributes {
  fill: string,
  bbox: {
    width: number,
  },
  box: {
    height: number
  }
  padding: number,
}
