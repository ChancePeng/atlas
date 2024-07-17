import { IData, IFillData } from "@/data";
import ChartBase from "../base";
import format from "./format";
import { Attributes } from "./types";
import type { Selection } from 'd3';
import type { IEvent } from '../types';

type FillData = IFillData<Attributes>;
type Position = 'top' | 'bottom'

class Penetration extends ChartBase {
  private data: {
    top?: FillData,
    bottom?: FillData;
  }
  private event: IEvent;
  private canvas: {
    top?: Selection<SVGGElement, unknown, HTMLElement, any>,
    bottom?: Selection<SVGGElement, unknown, HTMLElement, any>
  }
  constructor(selector: string) {
    super(selector);
    this.data = {};
    this.canvas = {};
    this.event = {}
  }
  private createNode = (node: Selection<SVGGElement, unknown, HTMLElement, any>, data: FillData, position: Position) => {
    const { __attrs } = data;
    const { width, bbox: { height } } = __attrs;
    let y = height / 2, d = 'M0,0L4,-8L-4,-8Z'
    if (position === 'top') {
      y = -y;
      d = 'M0,8L4,0L-4,0Z'
    }
    node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('stroke', '#128bed')
      .attr('fill', data.type === 'root' ? '#128bed' : '#FFF')
      .attr('transform', `translate(${-width / 2},${-height / 2})`)
    if (data.type !== 'root') {
      node.append('g')
        .attr('transform', `translate(0,${-y})`)
        .append('path')
        .attr('fill', '#128bed')
        .attr('d', d)
    }
    const show = data.type === 'root' ? false : data.__attrs.expandable
    const icon = node
      .append('g')
      .attr('class', 'plus-circle')
      .attr('transform', `translate(0,${y})`)
      .attr('opacity', show ? 1 : 0)
    icon.append('circle')
      .attr('stroke', '#128bed')
      .attr('fill', '#FFF')
      .attr('stroke-width', 1)
      .attr('r', 5)
    icon.append('line')
      .attr('class', 'plus')
      .attr('x1', -2)
      .attr('y1', 0)
      .attr('x2', 2)
      .attr('y2', 0)
      .attr('style', 'stroke: #128bed; stroke-width: 1;')
    icon.append('line')
      .attr('x1', 0)
      .attr('y1', -2)
      .attr('x2', 0)
      .attr('y2', 2)
      .attr('style', 'stroke: #128bed; stroke-width: 1;')
      .attr('class', 'plus vertical-line')
    if (typeof data.desc === 'string') {
      const _y = position === 'bottom' ? -y - 4 : -y + 16
      node.append('text')
        .attr('transform', `translate(4,${_y})`)
        .attr('font-size', 10)
        .attr('fill', '#128bed')
        .text(data.desc)
    }
    const text = node.append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('style', 'font-size:12;')
      .attr('y', 1)
      .attr('fill', data.type === 'root' ? '#FFF' : '#000')
      .attr('transform', `translate(0,${-(__attrs.spans.length - 1) * 7})`)
    __attrs.spans.forEach((item, index) => {
      text
        .append('tspan')
        .text(item || '')
        .attr('dy', index * 12)
        .attr('x', 0)
        .attr('y', (index + 1) * 2)
    })

  }
  // 收起
  private onRetract = (data: FillData, position: Position) => {
    const _children = data.__children;
    const { x, y } = data.__attrs;
    if (_children?.length) {
      const nodes: (Selection<SVGGElement, unknown, HTMLElement, any> | undefined)[] = []
      const lines: (Selection<SVGPathElement, unknown, HTMLElement, any> | undefined)[] = [];
      const stack = [..._children];
      while (stack.length) {
        const curr = stack.shift();
        if (curr) {
          lines.push(curr.__line)
          nodes.push(curr.__node)
          if (curr?.__children?.length) {
            stack.push(...curr.__children)
          }
        } else {
          break;
        }
      }
      const _y = position === 'top' ? -y : y
      nodes.forEach(item => {
        item?.attr('transform', `translate(${x},${_y})`)?.attr('opacity', 0)
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

  private insert = (data: FillData, position: Position) => {
    data.__children = data.children?.map(item => {
      return (item.__children = [], item)
    })
    const _data = this.data[position];
    const stack = [_data];
    const id = data.children?.[0]?.__id;
    if (id) {
      let index = 0;
      while (stack.length) {
        const item = stack.shift();
        if (!item) {
          break;
        }
        index++;
        if (item.__id === id) {
          break;
        }
        if (item.__children?.length) {
          stack.push(...item.__children)
        }
      }
      const canvas = this.canvas[position];
      if (!canvas) {
        return;
      }
      const nodes = canvas.select('.nodes')
      const lines = canvas.select('.lines')
      const { x, y } = data.__attrs;
      const _process: FillData[] = [];
      data.__children?.forEach((item, _index) => {
        if (item.type === 'label') {
          _process.push(item)
        }
        const _y = position === 'top' ? -y : y;
        const node = nodes
          .insert('g', `.nodes>.node:nth-child(${index + _index})`)
          .attr('class', 'node')
          .attr('transform', `translate(${x},${_y})`)
          .attr('opacity', 0)
          .attr('cursor', 'pointer')
        item.__node = node;
        const line = lines.insert('path', `.lines>.line:nth-child(${index - 1 + _index})`)
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', '#D8D8D8')
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 0.5)
          .attr('opacity', 0)
        item.__line = line;
        this.createNode(node, item, position)
      })
      if (_process?.length) {
        _process.forEach(item => this.insert(item, position))
      }
    }
  }
  // 展开
  private onExpand = async (data: FillData, position: Position) => {
    if (data.children?.length) {
      this.insert(data, position)
      // 计算需要插入的位置
      document.body.getBoundingClientRect()
      this.animation(position)
    } else {
      const { text, type, extData } = data;
      const datas = await this.event.request?.({ text, type, extData });
      if (datas && datas.length) {
        data.children = datas.map((item, index) => format(item, {
          father: data,
          level: (data.__level || 0) + 1,
          index
        }));
        this.onExpand(data, position)
      }
    }
  }
  private animation = (position: Position) => {
    const canvas = this.canvas[position];
    const data = this.data[position]
    if (canvas && data) {
      const stack = [data];
      while (stack.length) {
        const curr = stack.shift();
        if (curr) {
          const { __attrs: { x, y }, __node, __line, __children } = curr;
          if (__children?.length) {
            stack.push(...__children)
          }
          const x1 = curr.__father?.__attrs.x || 0;
          let y1 = curr.__father?.__attrs.y || 0;
          const x2 = curr.__attrs.x;
          let y2 = curr.__attrs.y;
          let middle = y2 - 50;
          if (position === 'top') {
            y1 = -y1;
            y2 = -y2;
            middle = y2 + 50
          }

          __node?.attr('transform', `translate(${x},${position === 'top' ? -y : y})`).attr('opacity', 1).on('click', () => {
            if (curr.type === 'root') {
              return;
            }
            if (curr.__attrs.expandable) {
              if (curr.__children?.length) {
                this.onRetract(curr, position)
              } else {
                this.onExpand(curr, position)
              }
            }
          });
          if (curr.__children?.length) {
            __node?.select('.plus-circle>.plus.vertical-line').attr('opacity', 0)
          } else {
            __node?.select('.plus-circle>.plus.vertical-line').attr('opacity', 1)
          }
          __line?.attr('d', `
             M${x1},${y1}
              L${x1},${middle}
              L${x2},${middle}
              L${x2},${y2}
            `).attr('opacity', 1)
        } else {
          break;
        }
      }
    }
  }
  get onrequest() {
    return this.event.request
  }
  set onrequest(target) {
    this.event.request = target;
  }
  render(data: IData, position: Position = 'bottom') {
    const _data = this.data[position] = format(data);
    const canvas = this.canvas[position] = this.root.append('g');
    const stack = [_data];
    const lines = canvas.append('g').attr('class', 'lines')
    const nodes = canvas.append('g').attr('class', 'nodes')
    while (stack.length) {
      const curr = stack.shift();
      if (curr) {
        const { __children, } = curr;
        if (__children?.length) {
          stack.push(...__children)
        }
        if (curr.type !== 'root') {
          curr.__line = lines
            .append('path')
            .attr('class', 'line')
            .attr('fill', 'none')
            .attr('stroke', '#D8D8D8')
            .attr('stroke-width', 0.5)
            .attr('stroke-opacity', 0.9)
        }
        const node = nodes
          .append('g')
          .attr('class', 'node')
          .attr('transform', `translate(0,0)`)
          .attr('cursor', 'pointer')
          .attr('opacity', 0)
        curr.__node = node;
        this.createNode(node, curr, position)
      } else {
        break;
      }
    }
    document.body.getBoundingClientRect()
    this.animation(position)
  }
}


export default Penetration;