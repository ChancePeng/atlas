import type { IData } from '@/data';
import type { Selection } from 'd3';

export interface IEvent
  extends Record<string, ((...args: any[]) => any) | undefined> {
  request?: (data: IData) => Promise<IData[]> | IData[];
}

export type SVGGSelection = Selection<SVGGElement, unknown, HTMLElement, any>;

export type SVGPathSelection = Selection<
  SVGPathElement,
  unknown,
  HTMLElement,
  any
>;

export type SVGTextSelection = Selection<
  SVGTextElement,
  unknown,
  HTMLElement,
  any
>;

export type SVGSVGSelection = Selection<
  SVGSVGElement,
  unknown,
  HTMLElement,
  any
>;
