import ChartBase from "../base";
import format from "./format";
import { animationFrame, pixel, stackFrame } from "@/utils";

import type { FieldNames, IData } from "@/data";
import type { FillData } from "./types";
import type { IEvent } from "../types";
import type { Selection } from 'd3';

class StockRight extends ChartBase {
  private data?: FillData;
  private event: IEvent;
  constructor(selector: string, fieldNames?: FieldNames) {
    super(selector, {
      position: [20, 'center'],
      fieldNames
    });
    this.event = {};
  }
  private packing = (node: Selection<SVGGElement, unknown, HTMLElement, any>, data: FillData) => {
    const { __attrs, fill, text, tags: _tags, desc } = data;
    const { width, height } = __attrs;
    node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('stroke', '#d8d8d8')
      .attr('fill', '#FFF');
    node.append('rect')
      .attr('width', 5)
      .attr('height', height)
      .attr('fill', fill || '#128BED');
    node.append('text')
      .attr('style', 'font-size:14px;fill:#128bed;')
      .attr('transform', `translate(35,25)`)
      .append('tspan')
      .text(text || '');
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
      stackFrame<FillData>(stack, item => {
        lines.push(item.__line)
        nodes.push(item.__node)
        if (item?.__children?.length) {
          stack.push(...item.__children)
        }
      })
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


  private append = (data: FillData, isInsert?: boolean) => {
    const stack = isInsert ? [...data.__children || []] : [data]
    const canvas = this.root;
    if (!canvas) {
      return;
    }
    const nodes = canvas.select('.nodes')
    const lines = canvas.select('.lines')
    const point = {
      x: isInsert ? data.__attrs.x : 0,
      y: isInsert ? data.__attrs.y : 0
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
        .attr('opacity', 0)
        .attr('cursor', 'pointer')
      this.packing(item.__node, item)
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
      this.animation()
    })
  }


  // 展开
  private onExpand = async (data: FillData) => {
    if (data.children?.length) {
      data.__children = [...data.children]
      this.append(data,true)
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
        this.onExpand(data)
      }
    }
  }
  private click = (data: FillData) => {
    if (data.__attrs?.expandable) {
      if (data.__children?.length) {
        this.onRetract(data)
      } else {
        this.onExpand(data)
      }
    }
  }
  private animation = () => {
    const stack = [this.data];
    stackFrame<FillData>(stack, (item) => {
      if (item.__children?.length) {
        stack.push(...item.__children)
      }
      const __attrs = item.__attrs;
      const { x, y } = item.__attrs;
      const _father = item.__father;
      const x1 = (_father?.__attrs?.x || 0) + 2;
      const y1 = _father?.__attrs?.y || 0;
      const x2 = __attrs.x;
      const y2 = __attrs.y + __attrs.height / 2
      item.__node?.attr('transform', `translate(${x},${y})`)
        .attr('opacity', 1)
        .on('click', () => this.click(item))
        .select('.plus-circle>.plus.vertical-line')
        .attr('opacity', item.__children?.length ? 0 : 1)
      item.__line?.attr('d', `M${x1},${y1}L${x1},${y2}L${x2},${y2}`)
        .attr('opacity', 1)
    })
  }
  get onrequest() {
    return this.event.request
  }
  set onrequest(target) {
    this.event.request = target;
  }
  render(data: IData) {
    this.data = format(data, {
      fieldNames: this.fieldNames
    })
    const canvas = this.root.append('g').attr('transform', `translate(-250,20)`)
    canvas.append('g').attr('class', 'lines')
    canvas.append('g').attr('class', 'nodes');
    this.append(this.data)
  }
}

export default StockRight;