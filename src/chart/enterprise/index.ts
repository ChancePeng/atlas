import ChartBase from '../base';
import format from './format';
import { animationFrame, reverse, stackFrame } from '@/utils';

import type { Position, FillData } from './types';
import type { IData, IDesc, FieldNames } from '@/data';
import type { IEvent, SVGGSelection, SVGPathSelection, SVGTextSelection } from '../types';


class Enterprise extends ChartBase {
  private data: {
    left?: FillData,
    right?: FillData,
  };
  private event: IEvent;
  private canvas: {
    left?: SVGGSelection,
    right?: SVGGSelection
  }
  constructor(selector: string, fieldNames?: FieldNames) {
    super(selector, { fieldNames })
    this.event = {};
    this.data = {};
    this.canvas = {}
  }
  private innerText = (desc: string | IDesc, text: SVGTextSelection) => {
    const content = typeof desc === 'string' ? desc : desc.text ?? '';
    const fill = typeof desc === 'string' ? '#999' : desc.fill ?? '#999'
    text.append('tspan').text(' [').attr('fill', '#999')
    text.append('tspan').text(content).attr('fill', fill)
    text.append('tspan').text(']').attr('fill', '#999')
  }
  private packing = (node: SVGGSelection, data: FillData, position: Position) => {
    const { __attrs, type, text: content, desc } = data;
    const { width, height, fill, expandable } = __attrs;
    const isL = position === 'left'
    const context: Record<string, number> = {
      x: -__attrs.padding / 2,
      cx: -__attrs.width / 2,
      ix: __attrs.width / 2 - 12,
      ax: -__attrs.width / 2 - 20,
    }
    const { x, cx, ix, ax } = isL ? reverse(context) : context;
    const rect = node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(-${width / 2},-${height / 2})`)
      .attr('fill', type === 'root' ? '#128BED' : '#FFF')
      .attr('rx', 2)
      .attr('ry', 2)
    if (type === 'text') {
      rect.attr('stroke', fill)
    }
    const text = node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('x', x)
      .attr('y', 1)
      .attr('font-size', 12);
    text
      .append('tspan')
      .text(content || '')
      .attr('fill', type === 'root' ? '#FFF' : '#000');
    if (desc) {
      if (Array.isArray(desc)) {
        desc.forEach(item => {
          this.innerText(item, text)
        })
      } else {
        this.innerText(desc, text)
      }
    }
    node.append('circle')
      .attr('r', 4)
      .attr('fill', fill)
      .attr('cx', cx)
      .attr('opacity', type === 'label' ? 1 : 0)
    node.append('g').attr('transform', `translate(${ax},0)`)
      .append('path')
      .attr('d', isL ? 'M9,0L0,-3L0,3Z' : 'M0,0L9,-3L9,3Z')
      .attr('fill', fill)
      .attr('stroke-width', 0)
      .attr('opacity', type === 'label' ? 1 : 0)
    const icon = node
      .append('g')
      .attr('class', 'plus-circle')
      .attr('transform', `translate(${ix},0)`)
      .attr('opacity', expandable ? 1 : 0)
    icon.append('circle')
      .attr('stroke', 'rgb(153, 153, 153)')
      .attr('fill', 'rgb(255, 255, 255)')
      .attr('stroke-width', 1)
      .attr('r', 5)
    icon.append('line')
      .attr('class', 'plus')
      .attr('x1', -2)
      .attr('y1', 0)
      .attr('x2', 2)
      .attr('y2', 0)
      .attr('style', 'stroke: rgb(153, 153, 153); stroke-width: 1;')
    icon.append('line')
      .attr('x1', 0)
      .attr('y1', -2)
      .attr('x2', 0)
      .attr('y2', 2)
      .attr('style', 'stroke: rgb(153, 153, 153); stroke-width: 1;')
      .attr('class', 'plus vertical-line')
  }
  private click = (data: FillData, position: Position) => {
    if (!data.__attrs.expandable) {
      return;
    }
    if (data.__children?.length) {
      this.onRetract(data, position)
    } else {
      this.onExpand(data, position)
    }
  }

  private animation = (position: Position) => {
    const data = this.data[position];
    const stack = [data];
    stackFrame<FillData>(stack, (item) => {
      if (item.__children) {
        stack.push(...item.__children)
      }
      const { x, y } = item.__attrs;
      const _x = position === 'left' ? -x : x
      item.__node?.attr('transform', `translate(${_x},${y})`)
        .attr('opacity', 1)
        .on('click', () => this.click(item, position))
        .select('.plus-circle>.plus.vertical-line')
        .attr('opacity', item?.__children?.length ? 0 : 1)
      const __attrs = item.__attrs;
      const __father = item.__father;
      const point: Record<string, Record<string, number>> = {
        x: {
          x1: (__father?.__attrs.x || 0),
          x2: __attrs.x - __attrs.width / 2 - 50,
          x3: __attrs.x,
        },
        y: {
          y1: __father?.__attrs.y || 0,
          y2: __attrs.y,
        }
      }
      const { x: { x1, x2, x3 }, y: { y1, y2 } } = (position === 'left' && (point.x = reverse(point.x)), point);
      item.__line?.attr('d', `
        M${x1},${y1}
        L${x2},${y1}
        L${x2},${y2}
        L${x3},${y2}
      `).attr('opacity', 1)
    })
  }
  // 收起
  private onRetract = (data: FillData, position: Position) => {
    const _children = data.__children;
    const { x, y } = data.__attrs;
    if (_children?.length) {
      const nodes: (SVGGSelection | undefined)[] = []
      const lines: (SVGPathSelection | undefined)[] = [];
      const stack = [..._children];
      stackFrame<FillData>(stack, item => {
        lines.push(item.__line)
        nodes.push(item.__node)
        if (item?.__children?.length) {
          stack.push(...item.__children)
        }
      })
      const _x = position === 'left' ? -x : x
      nodes.forEach(item => {
        item?.attr('transform', `translate(${_x},${y})`)?.attr('opacity', 0)
      })
      lines.forEach(item => {
        item?.attr('opacity', 0)
      })
      setTimeout(() => {
        nodes.forEach(item => item?.remove())
        lines.forEach(item => item?.remove())
        _children.forEach(item => {
          item.__node = undefined;
          item.__line = undefined;
        })
        data.__children = [];
        this.animation(position)
      }, 300)
    }
  }

  private append = (data: FillData, position: Position, isInsert?: boolean) => {
    const stack = isInsert ? [...data.__children || []] : [data]
    const canvas = this.canvas[position];
    if (!canvas) {
      return;
    }
    const nodes = canvas.select('.nodes')
    const lines = canvas.select('.lines')
    const point = {
      x: isInsert ? data.__attrs.x : 0,
      y: isInsert ? data.__attrs.y : 0
    }
    if (position === 'left') {
      point.x = -point.x
    }
    animationFrame<FillData>(stack, item => {
      const { type, __children } = item;
      if (__children?.length) {
        stack.push(...__children)
      }
      item.__node = nodes
        .append('g')
        .attr('class', 'node')
        .attr('transform', `translate(${point.x},${point.y})`)
        .attr('opacity', type === 'root' ? 1 : 0)
        .attr('cursor', 'pointer')
      this.packing(item.__node, item, position)
      if (type !== 'root') {
        item.__line = lines
          .append('path')
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', '#D8D8D8')
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 0.5)
          .attr('opacity', 0);
      }
    }, () => {
      document.body.getBoundingClientRect();
      this.animation(position)
    })
  }
  // 展开
  private onExpand = async (data: FillData, position: Position) => {
    if (data.children?.length) {
      data.__children = [...data.children]
      this.append(data, position, true)
    } else {
      const { text, type, extData } = data;
      const datas = await this.event.request?.({ text, type, extData });
      if (datas && datas.length) {
        data.children = datas.map((item, index) => format(item, {
          father: data,
          level: (data.__level || 0) + 1,
          index,
          fieldNames: this.fieldNames
        }));
        this.onExpand(data, position)
      }
    }
  }
  get onrequest() {
    return this.event.request
  }
  set onrequest(target) {
    this.event.request = target;
  }
  render(data: IData, position: Position = 'right') {
    const _data = format(data, { fieldNames: this.fieldNames });
    this.data[position] = _data;
    const canvas = this.canvas[position] = this.root.append('g')
    canvas.append('g').attr('class', 'lines')
    canvas.append('g').attr('class', 'nodes');
    this.append(_data, position)
  }
}

export default Enterprise;