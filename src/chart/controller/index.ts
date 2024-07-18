import { animationFrame } from "@/utils";
import ChartBase from "../base";
import format from "./format";

import type { IData } from "@/data";
import type { FillData } from "./types";

class Controller extends ChartBase {
  data?: FillData;
  animation = () => {
    if (this.data) {
      const stack = [
        this.data,
        ...(this.data.children || [])
      ];
      stack.forEach(item => {
        const { x, y } = item.__attrs;
        item.__node?.attr('transform', `translate(${x},${y})`).attr('opacity', 1)
        const x1 = item?.__father?.__attrs.x || 0;
        const y1 = item?.__father?.__attrs.y || 0;
        const x2 = item.__attrs.x;
        const y2 = item.__attrs.y;
        item.__line?.attr('d', `M${x1},${y1}L${x1},${y1 - 50}L${x2},${y1 - 50}L${x2},${y2}`).attr('opacity', 1)
      })
    }
  }
  render(data: IData) {
    this.data = format(data, {
      fieldNames: this.fieldNames
    });
    const lines = this.root.append('g').attr('class', 'lines')
    const nodes = this.root.append('g').attr('class', 'nodes')

    if (this.data) {
      const stack = [
        this.data,
        ...(this.data.children || [])
      ];
      animationFrame<FillData>(stack, item => {
        const { text = '', __attrs, type, fill = '#128BED' } = item;
        const { width, height } = __attrs;
        const node = nodes
          .append('g')
          .attr('class', 'node')
          .attr('transform', `translate(0,0)`)
          .attr('opacity', type === 'root' ? 1 : 0)
        item.__node = node;
        if (type !== 'root') {
          item.__line = lines
            .append('path')
            .attr('fill', 'none')
            .attr('stroke', fill)
            .attr('stroke-opacity', 0.9)
            .attr('stroke-width', 0.5)
            .attr('opacity', 0)
        }
        const isRoot = type === 'root'
        const isRect = isRoot || text.length > 4;

        if (isRect) {
          node
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('fill', isRoot ? fill : '#FFF')
            .attr('stroke', isRoot ? 'none' : fill)
            .attr('stroke-width', 0.5)
            .attr('transform', `translate(${-width / 2},${-height / 2})`)
        } else {
          node
            .append('circle')
            .attr('r', width / 2)
            .attr('fill', fill ?? '#fd485d')
        }
        node
          .append('text')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('y', 1)
          .attr('font-size', 12)
          .attr('fill', isRoot ? '#FFF' : text.length > 4 ? '#000' : '#FFF')
          .text(text)
        if (typeof item.desc === 'string') {
          const descriptions = node
            .append('g')
            .attr('transform', `translate(0,${-height / 2 - 17 - 6})`)
          descriptions.append('path')
            .attr('fill', fill)
            .attr('d', `M0,23L3,17L-3,17Z`)
          descriptions.append('rect')
            .attr('width', 80)
            .attr('height', 34)
            .attr('fill', fill)
            .attr('transform', 'translate(-40,-17)')
          const content = descriptions
            .append('text').attr('font-size', 10)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('transform', 'translate(0,-6)')
            .attr('fill', '#FFF')
          content.append('tspan').text('疑似实际控制人').attr('x', 0).attr('y', 1).attr('dy', 0)
          content.append('tspan').text(`持有${item.desc}`).attr('x', 0).attr('y', 1).attr('dy', 12)
        }
      }, () => {
        document.body.getBoundingClientRect()
        this.animation()
      })
    }
  }
}

export default Controller;