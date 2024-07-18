import ChartBase from "../base";
import format from "./format";
import { IData, IFillData } from "@/data";
import { pixel } from "@/utils";

import type { Attributes } from "./types";
import type { IEvent } from "../types";
import type { Selection } from 'd3';


type FillData = IFillData<Attributes>

class StockRight extends ChartBase {
  private data?: FillData;
  private event: IEvent;
  constructor(selector: string) {
    super(selector, {
      position: [20, 'center']
    });
    this.event = {};
  }
  private createNode = (node: Selection<SVGGElement, unknown, HTMLElement, any>, data: FillData) => {
    const { __attrs, fill, text, tags: _tags, desc } = data;
    const { width, height } = __attrs;
    node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('stroke', '#d8d8d8')
      .attr('fill', '#FFF')
    node.append('rect')
      .attr('width', 5)
      .attr('height', height)
      .attr('fill', fill || '#128BED')
    node.append('text')
      .attr('style', 'font-size:14px;fill:#128bed;')
      .attr('transform', `translate(35,25)`)
      .append('tspan')
      .text(text || '')

    let offset = 52;
    if (_tags?.length) {
      offset = 70
      const tags = node.append('g')
      const tag = tags
        .append('g')
        .attr('transform', `translate(35,33)`)
      _tags.forEach((item) => {
        const content = typeof item === 'string' ? item : item.text ?? ''
        const _fill = typeof item === 'string' ? '#BB833D' : item.fill ?? '#BB833D'
        const __width = pixel(content) + 4
        tag
          .append('rect')
          .attr('width', __width)
          .attr('height', 20)
          .attr('fill', _fill)
          .attr('opacity', 0.1)
        tag
          .append('text')
          .attr('fill', _fill)
          .attr('font-size', '12px')
          .attr('transform', `translate(9,14)`)
          .text(content)
      })
    }
    if (desc) {
      const descs = node.append('g').attr('transform', `translate(35,${offset})`)
      if (typeof desc === 'string') {
        descs
          .append('text')
          .attr('font-size', 12)
          .append('tspan').text(desc)
      } else if (Array.isArray(desc)) {
        let _x = 0
        desc.forEach(item => {
          if (typeof item === 'string') {
            descs
              .append('text')
              .attr('transform', `translate(${_x},0)`)
              .attr('font-size', 12)
              .append('tspan').text(item)

            _x = pixel(item)
          } else {
            const { fill, text, title } = item || {};
            const _title = title ? `${title}: ` : ''
            descs.append('text')
              .attr('font-size', 12)
              .attr('transform', `translate(${_x},0)`)
              .append('tspan').text(_title)
              .attr('fill', '#808080')
              .append('tspan').text(text ?? '')
              .attr('fill', fill ?? '#FF8900')
            _x = pixel(`${_title}${text || ''}`)
          }
        })
      }
    }

    const icon = node
      .append('g')
      .attr('class', 'plus-circle')
      .attr('transform', `translate(20,${height / 2})`)
      .attr('opacity', data.__attrs.expandable ? 1 : 0)
    icon
      .append('circle')
      .attr('style', 'stroke: rgb(153, 153, 153); fill: rgb(255, 255, 255); stroke-width: 1;')
      .attr('r', 5)
    icon
      .append('line')
      .attr('style', 'stroke: rgb(153, 153, 153); stroke-width: 1;')
      .attr('class', 'plus')
      .attr('x1', -2)
      .attr('y1', 0)
      .attr('x2', 2)
      .attr('y2', 0)
    icon
      .append('line')
      .attr('style', 'stroke: rgb(153, 153, 153); stroke-width: 1;')
      .attr('class', 'plus vertical-line')
      .attr('x1', 0)
      .attr('y1', -2)
      .attr('x2', 0)
      .attr('y2', 2)
  }
  // 收起
  private onRetract = (data: FillData) => {
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
      nodes.forEach(item => {
        item?.attr('transform', `translate(${x},${y})`)?.attr('opacity', 0)
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
        data.__children = []
        this.animation()
      }, 300)
    }
  }

  private insert = (data: FillData) => {
    data.__children = data.children?.map(item => {
      return (item.__children = [], item)
    })
    const _data = this.data;
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
      const canvas = this.root;
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
        const node = nodes
          .insert('g', `.nodes>.node:nth-child(${index + _index})`)
          .attr('class', 'node')
          .attr('transform', `translate(${x},${y})`)
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
        this.createNode(node, item)
      })
      if (_process?.length) {
        _process.forEach(item => this.insert(item))
      }
    }
  }
  // 展开
  private onExpand = async (data: FillData) => {
    if (data.children?.length) {
      this.insert(data)
      // 计算需要插入的位置
      document.body.getBoundingClientRect();
      this.animation()
    } else {
      const { text, type, extData } = data;
      const datas = await this.event.request?.({ text, type, extData });
      if (datas && datas.length) {
        data.children = datas.map((item, index) => format(item, {
          father: data,
          level: (data.__level || 0) + 1,
          index
        }));
        this.onExpand(data)
      }
    }
  }
  private animation = () => {
    const stack = [this.data];
    while (stack.length) {
      const curr = stack.shift();
      if (curr) {
        const __attrs = curr.__attrs;
        const { x, y } = curr.__attrs;
        const _father = curr.__father;
        const node = curr.__node;
        const line = curr.__line;
        if (node) {
          node.attr('transform', `translate(${x},${y})`).attr('opacity', 1)
          if (curr.__children?.length) {
            stack.push(...curr.__children)
            node.select('.plus-circle>.plus.vertical-line').attr('opacity', 0)
          } else {
            node.select('.plus-circle>.plus.vertical-line').attr('opacity', 1)
          }
          node.on('click', () => {
            if (curr.__attrs?.expandable) {
              if (curr.__children?.length) {
                this.onRetract(curr)
              } else {
                this.onExpand(curr)
              }
            }
          })
        }
        if (line) {
          const x1 = (_father?.__attrs?.x || 0) + 2;
          const y1 = _father?.__attrs?.y || 0;
          const x2 = __attrs.x;
          const y2 = __attrs.y + __attrs.height / 2
          line.attr('d', `
            M${x1},${y1}
            L${x1},${y2}
            L${x2},${y2}
            `).attr('opacity', 1)
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
  render(data: IData) {
    this.data = format(data)
    const g = this.root.append('g').attr('transform', `translate(-250,20)`)
    const lines = g.append('g').attr('class', 'lines')
    const nodes = g.append('g').attr('class', 'nodes');
    const stack = [this.data];
    while (stack.length) {
      const curr = stack.shift();
      if (curr) {
        const { __children } = curr;
        if (curr.type !== 'root') {
          curr.__line = lines.append('path').attr('class', 'line').attr('stroke', '#D8D8D8').attr('fill', 'none')

        }
        if (__children?.length) {
          stack.push(...__children)
        }
        const node = nodes
          .append('g')
          .attr('class', 'node')
          .attr('transform', `translate(0,0)`)
          .attr('cursor', "pointer")
          .attr('opacity', 0)
        curr.__node = node;
        this.createNode(node, curr)
      } else {
        break;
      }
      document.body.getBoundingClientRect()
      this.animation()
    }
  }
}

export default StockRight;