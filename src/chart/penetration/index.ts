import { animationFrame, reverse, stackFrame } from '@/utils';
import ChartBase from '../base';
import format from './format';

import type { FieldNames, IData } from '@/data';
import type { IEvent, SVGGSelection, SVGPathSelection } from '../types';
import type { FillData, Position } from './types';

class Penetration extends ChartBase {
  private data: {
    top?: FillData;
    bottom?: FillData;
  };
  private event: IEvent;
  private canvas: {
    top?: SVGGSelection;
    bottom?: SVGGSelection;
  };
  constructor(selector: string, fieldNames?: FieldNames) {
    super(selector, { fieldNames });
    this.data = {};
    this.canvas = {};
    this.event = {};
  }
  private packing = (
    node: SVGGSelection,
    data: FillData,
    position: Position,
  ) => {
    const { __attrs } = data;
    const {
      width,
      bbox: { height },
    } = __attrs;
    let y = height / 2,
      d = 'M0,0L4,-8L-4,-8Z';
    if (position === 'top') {
      y = -y;
      d = 'M0,8L4,0L-4,0Z';
    }
    node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('stroke', '#128bed')
      .attr('fill', data.type === 'root' ? '#128bed' : '#FFF')
      .attr('transform', `translate(${-width / 2},${-height / 2})`);
    if (data.type !== 'root') {
      node
        .append('g')
        .attr('transform', `translate(0,${-y})`)
        .append('path')
        .attr('fill', '#128bed')
        .attr('d', d);
    }
    const show = data.type === 'root' ? false : data.__attrs.expandable;
    const icon = node
      .append('g')
      .attr('class', 'plus-circle')
      .attr('transform', `translate(0,${y})`)
      .attr('opacity', show ? 1 : 0);
    icon
      .append('circle')
      .attr('stroke', '#128bed')
      .attr('fill', '#FFF')
      .attr('stroke-width', 1)
      .attr('r', 5);
    icon
      .append('line')
      .attr('class', 'plus')
      .attr('x1', -2)
      .attr('y1', 0)
      .attr('x2', 2)
      .attr('y2', 0)
      .attr('style', 'stroke: #128bed; stroke-width: 1;');
    icon
      .append('line')
      .attr('x1', 0)
      .attr('y1', -2)
      .attr('x2', 0)
      .attr('y2', 2)
      .attr('style', 'stroke: #128bed; stroke-width: 1;')
      .attr('class', 'plus vertical-line');
    if (typeof data.desc === 'string') {
      const _y = position === 'bottom' ? -y - 4 : -y + 16;
      node
        .append('text')
        .attr('transform', `translate(4,${_y})`)
        .attr('font-size', 10)
        .attr('fill', '#128bed')
        .text(data.desc);
    }
    const text = node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('style', 'font-size:12;')
      .attr('y', 1)
      .attr('fill', data.type === 'root' ? '#FFF' : '#000')
      .attr('transform', `translate(0,${-(__attrs.spans.length - 1) * 7})`);
    __attrs.spans.forEach((item, index) => {
      text
        .append('tspan')
        .text(item || '')
        .attr('dy', index * 12)
        .attr('x', 0)
        .attr('y', (index + 1) * 2);
    });
  };
  // 收起
  private onRetract = (data: FillData, position: Position) => {
    const _children = data.__children;
    const { x, y } = data.__attrs;
    if (_children?.length) {
      const nodes: (SVGGSelection | undefined)[] = [];
      const lines: (SVGPathSelection | undefined)[] = [];
      const stack = [..._children];
      stackFrame<FillData>(stack, (item) => {
        lines.push(item.__line);
        nodes.push(item.__node);
        if (item?.__children?.length) {
          stack.push(...item.__children);
        }
      });
      const _y = position === 'top' ? -y : y;
      nodes.forEach((item) => {
        item?.attr('transform', `translate(${x},${_y})`)?.attr('opacity', 0);
      });
      lines.forEach((item) => {
        item?.attr('opacity', 0);
      });
      setTimeout(() => {
        nodes.forEach((item) => item?.remove());
        lines.forEach((item) => item?.remove());
        _children.forEach((item) => {
          item.__node = undefined;
          item.__line = undefined;
        });
        data.__children = [];
        this.animation(position);
      }, 300);
    }
  };

  private append = (data: FillData, position: Position, isInsert?: boolean) => {
    const stack = isInsert ? [...(data.__children || [])] : [data];
    const canvas = this.canvas[position];
    if (!canvas) {
      return;
    }
    const nodes = canvas.select('.nodes');
    const lines = canvas.select('.lines');
    const point = {
      x: isInsert ? data.__attrs.x : 0,
      y: isInsert ? data.__attrs.y : 0,
    };
    if (position === 'top') {
      point.y = -point.y;
    }
    animationFrame<FillData>(
      stack,
      (item) => {
        const { type, __children } = item;
        if (__children?.length) {
          stack.push(...__children);
        }
        item.__node = nodes
          .append('g')
          .attr('class', 'node')
          .attr('transform', `translate(${point.x},${point.y})`)
          .attr('opacity', 0)
          .attr('cursor', 'pointer');
        this.packing(item.__node, item, position);
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
      },
      () => {
        document.body.getBoundingClientRect();
        this.animation(position);
      },
    );
  };

  // 展开
  private onExpand = async (data: FillData, position: Position) => {
    if (data.children?.length) {
      data.__children = [...data.children];
      this.append(data, position, true);
    } else {
      const { text, type, extData } = data;
      const datas = await this.event.request?.({ text, type, extData });
      if (datas && datas.length) {
        data.children = datas.map((item, index) =>
          format(item, {
            father: data,
            level: (data.__level || 0) + 1,
            index,
            fieldNames: this.fieldNames,
          }),
        );
        this.onExpand(data, position);
      }
    }
  };
  private click = (data: FillData, position: Position) => {
    if (data.type === 'root') {
      return;
    }
    if (data.__attrs.expandable) {
      if (data.__children?.length) {
        this.onRetract(data, position);
      } else {
        this.onExpand(data, position);
      }
    }
  };
  private animation = (position: Position) => {
    const canvas = this.canvas[position];
    const data = this.data[position];
    if (canvas && data) {
      const stack = [data];
      stackFrame<FillData>(stack, (item) => {
        const {
          __attrs: { x, y },
          __node,
          __line,
          __children,
        } = item;
        if (__children?.length) {
          stack.push(...__children);
        }
        const context: Record<string, Record<string, number>> = {
          x: {
            x1: item.__father?.__attrs.x || 0,
            x2: item.__attrs.x,
          },
          y: {
            y1: item.__father?.__attrs.y || 0,
            y3: item.__attrs.y,
            y2: item.__attrs.y - 50,
          },
        };
        const {
          x: { x1, x2 },
          y: { y1, y2, y3 },
        } = (position === 'top' && (context.y = reverse(context.y)), context);
        __node
          ?.attr('transform', `translate(${x},${position === 'top' ? -y : y})`)
          .attr('opacity', 1)
          .on('click', () => this.click(item, position))
          .select('.plus-circle>.plus.vertical-line')
          .attr('opacity', item.__children?.length ? 0 : 1);
        __line
          ?.attr('d', `M${x1},${y1}L${x1},${y2}L${x2},${y2}L${x2},${y3}`)
          .attr('opacity', 1);
      });
    }
  };
  get onrequest() {
    return this.event.request;
  }
  set onrequest(target) {
    this.event.request = target;
  }
  render(data: IData, position: Position = 'bottom') {
    const _data = (this.data[position] = format(data, {
      fieldNames: this.fieldNames,
    }));
    const canvas = (this.canvas[position] = this.root.append('g'));
    canvas.append('g').attr('class', 'lines');
    canvas.append('g').attr('class', 'nodes');
    this.append(_data, position);
  }
}

export default Penetration;
