import type { Selection } from 'd3'
import type { IData } from "@/data";

export interface IEvent extends Record<string, ((...args: any[]) => any) | undefined> {
  request?: (data: IData) => Promise<IData[]> | IData[]
}

export type SVGGSelection = Selection<SVGGElement, unknown, HTMLElement, any>;

export type SVGPathSelection = Selection<SVGPathElement, unknown, HTMLElement, any>;

export type SVGTextSelection = Selection<SVGTextElement, unknown, HTMLElement, any>;