
import * as d3 from 'd3';
import type { Selection } from 'd3';

type PositionX = 'center' | 'left' | 'right' | number
type PositionY = 'center' | 'top' | 'bottom' | number

interface Options {
  position?: 'center' | [PositionX, PositionY]
}

class ChartBase {
  root: Selection<SVGGElement, unknown, HTMLElement, any>;
  private svg: Selection<SVGSVGElement, unknown, HTMLElement, any>;
  constructor(selector: string, options?: Options) {
    const { position = 'center' } = options || {}
    this.svg = d3.select(selector).append('svg')
    const { width = 0, height = 0 } = document.querySelector(selector)?.getBoundingClientRect() || {}
    this.root = this.svg.append('g');
    const point = {
      x: width / 2,
      y: height / 2
    }
    if (Array.isArray(position)) {
      position.forEach((item, index) => {
        if (typeof item === 'string') {
          switch (item) {
            case 'left': point.x = 0; break;
            case 'right': point.x = width; break;
            case 'top': point.y = 0; break;
            case 'bottom': point.y = height; break;
          }
        } else {
          if (index) {
            point.x = item;
          } else {
            point.y = item;
          }
        }
      })

    }
    this.svg
      .attr('width', width)
      .attr('height', height)
      .call(this.zoomHandler)
      .call(this.zoomHandler.translateBy, point.x, point.y)
      .on('dblclick.zoom', null);
  }
  private get zoomHandler(): any {
    const zoom = (event: any) => {
      const { x, y, k } = event.transform;
      this.root?.attr('transform', `translate(${x},${y}) scale(${k})`);
    }
    return d3
      .zoom()
      .scaleExtent([0.4, 10])
      .on('zoom', zoom);
  }
}

export default ChartBase