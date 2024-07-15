
import * as d3 from 'd3'
import { getFillData } from './utils';
import type { IData, IFillData, IDesc, Position, IEvent } from './types';
import type { Selection } from 'd3';

class Enterprise {
  #data: {
    left?: IFillData,
    right?: IFillData,
  };
  #root: Selection<SVGGElement, unknown, HTMLElement, any>;
  #event: IEvent;
  #svg: Selection<SVGSVGElement, unknown, HTMLElement, any>;
  #canvas: {
    left?: Selection<SVGGElement, unknown, HTMLElement, any>,
    right?: Selection<SVGGElement, unknown, HTMLElement, any>
  }
  constructor(selector: string) {
    this.#event = {};
    this.#data = {};
    this.#canvas = {}
    this.#svg = d3.select(selector).append('svg')
    const { width = 0, height = 0 } = document.querySelector(selector)?.getClientRects()?.[0] || {}
    this.#root = this.#svg.append('g');
    this.#svg
      .attr('width', width)
      .attr('height', height)
      .call(this.#zoomHandler)
      .call(this.#zoomHandler.translateBy, width / 2, height / 2)
      .on('dblclick.zoom', null);
  }
  get #zoomHandler(): any {
    const zoom = (x: number, y: number, k: number) => {
      this.#root?.attr('transform', `translate(${x},${y}) scale(${k})`)
    }
    return d3
      .zoom()
      .scaleExtent([0.4, 10])
      .on('zoom', (event) => {
        const { x, y, k } = event.transform;
        zoom(x, y, k)
      });
  }
  #createDesc = (desc: string | IDesc, text: Selection<SVGTextElement, unknown, HTMLElement, any>) => {
    const _text = typeof desc === 'string' ? desc : desc.text ?? '';
    const _color = typeof desc === 'string' ? '#999' : desc.fill ?? '#999'
    text.append('tspan').text(' [').attr('fill', '#999')
    text.append('tspan').text(_text).attr('fill', _color)
    text.append('tspan').text(']').attr('fill', '#999')
  }
  #createNode = (node: Selection<SVGGElement, unknown, HTMLElement, any>, data: IFillData, position: Position) => {
    const { __attrs, type, text: content, desc } = data;
    const { width, height } = __attrs;
    let x = -__attrs.padding / 2,
      cx = -__attrs.width / 2,
      icon_translateX = __attrs.width / 2 - 12,
      arrow_translateX = -__attrs.width / 2 - 20,
      d = `M0,0L9,-3L9,3Z`;
    if (position === 'left') {
      x = -x;
      cx = -cx;
      icon_translateX = -icon_translateX;
      arrow_translateX = -arrow_translateX;
      d = `M9,0L0,-3L0,3Z`
    }
    const rect = node
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('transform', `translate(-${width / 2},-${height / 2})`)
      .attr('fill', type === 'root' ? '#128BED' : '#FFF')
      .attr('rx', 2)
      .attr('ry', 2)
    if (type === 'text') {
      rect.attr('stroke', __attrs.fill)
    }
    const text = node
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', x)
      .attr('y', 1)
      .attr('font-size', 12)
      .attr('dominant-baseline', 'middle');
    text
      .append('tspan')
      .text(content || '')
      .attr('fill', type === 'root' ? '#FFF' : '#000');
    if (desc) {
      if (Array.isArray(desc)) {
        desc.forEach(item => {
          this.#createDesc(item, text)
        })
      } else {
        this.#createDesc(desc, text)
      }
    }
    node.append('circle')
      .attr('r', 4)
      .attr('fill', __attrs.fill)
      .attr('cx', cx)
      .attr('opacity', type === 'label' ? 1 : 0)
    node.append('g').attr('transform', `translate(${arrow_translateX},0)`)
      .append('path')
      .attr('d', d)
      .attr('fill', __attrs.fill)
      .attr('stroke-width', 0)
      .attr('opacity', type === 'label' ? 1 : 0)
    const icon = node
      .append('g')
      .attr('class', 'plus-circle')
      .attr('transform', `translate(${icon_translateX},0)`)
      .attr('opacity', __attrs.padding > 0 ? 1 : 0)
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

  #animation = (position: Position) => {
    const data = this.#data[position];
    const stack = [data];
    let index = 0;
    while (stack.length) {
      const curr = stack.shift();
      if (curr) {
        if (curr.__children) {
          stack.push(...curr.__children)
        }
        const { x, y } = curr.__attrs;
        const canvas = this.#canvas[position];
        if (!canvas) {
          continue;
        }
        const node = canvas.select(`.nodes>.node:nth-child(${index + 1})`)
        const line = canvas.select(`.lines>.line:nth-child(${index})`)
        const _x = position === 'left' ? -x : x
        node.attr('transform', `translate(${_x},${y})`).attr('opacity', 1);
        if (curr.__children?.length) {
          node.select('.plus-circle>.plus.vertical-line').attr('opacity', 0)
        } else {
          node.select('.plus-circle>.plus.vertical-line').attr('opacity', 1)
        }
        node.on('click', () => {
          if (!curr.__attrs.__expandable) {
            return;
          }
          if (curr.__children?.length) {
            this.#onRetract(curr, position)
          } else {
            this.#onExpand(curr, position)
          }
        })
        line.attr('opacity', 1)
        const __attrs = curr.__attrs;
        const __father = curr.__father;
        let x1 = (__father?.__attrs.x || 0),
          y1 = __father?.__attrs.y || 0,
          x2 = __attrs.x,
          y2 = __attrs.y,
          middleX = __attrs.x - __attrs.width / 2 - 50
        if (position === 'left') {
          x1 = -x1;
          x2 = -x2;
          middleX = -middleX
        }
        line.attr('d', `
          M${x1},${y1}
          L${middleX},${y1}
          L${middleX},${y2}
          L${x2},${y2}
        `)
      }
      index++;
    }
  }
  // 收起
  #onRetract = (data: IFillData, position: Position) => {
    const _children = data.__children;
    const { x, y } = data.__attrs;
    if (_children?.length) {
      const nodes: (Selection<SVGGElement, unknown, HTMLElement, any> | undefined)[] = []
      const lines: (Selection<SVGPathElement, unknown, HTMLElement, any> | undefined)[] = [];
      const stash = [..._children];
      while (stash.length) {
        const curr = stash.shift();
        if (curr) {
          lines.push(curr.__line)
          nodes.push(curr.__node)
          if (curr?.__children?.length) {
            stash.push(...curr.__children)
          }
        } else {
          break;
        }
      }
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
        data.__children = []
        this.#animation(position)
      }, 300)
    }
  }

  #insert = (data: IFillData, position: Position) => {
    data.__children = data.children?.map(item => {
      return (item.__children = [], item)
    })
    const _data = this.#data[position];
    const stash = [_data];
    const id = data.children?.[0]?.__id;
    if (id) {
      let index = 0;
      while (stash.length) {
        const item = stash.shift();
        if (!item) {
          break;
        }
        index++;
        if (item.__id === id) {
          break;
        }
        if (item.__children?.length) {
          stash.push(...item.__children)
        }
      }
      const canvas = this.#canvas[position];
      if (!canvas) {
        return;
      }
      const nodes = canvas.select('.nodes')
      const lines = canvas.select('.lines')
      const { x, y } = data.__attrs;
      const _process: IFillData[] = []
      data.__children?.forEach((item, _index) => {
        if (item.type === 'label') {
          _process.push(item)
        }
        const _x = position === 'left' ? -x : x;
        const node = nodes
          .insert('g', `.nodes>.node:nth-child(${index + _index})`)
          .attr('class', 'node')
          .attr('transform', `translate(${_x},${y})`)
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
        this.#createNode(node, item, position)
      })
      if (_process?.length) {
        _process.forEach(item => this.#insert(item, position))
      }
    }
  }
  // 展开
  #onExpand = async (data: IFillData, position: Position) => {
    if (data.children?.length) {
      this.#insert(data, position)
      // 计算需要插入的位置
      setTimeout(() => this.#animation(position), 100)
    } else {
      const { text, type, extData } = data;
      const datas = await this.#event.request?.({ text, type, extData });
      if (datas && datas.length) {
        data.children = datas.map((item, index) => getFillData(item, {
          father: data,
          level: (data.__level || 0) + 1,
          index
        }));
        this.#onExpand(data, position)
      }
    }
  }
  get onrequest() {
    return this.#event.request
  }
  set onrequest(target) {
    this.#event.request = target;
  }
  async render(data: IData, position: Position = 'right') {
    const _data = getFillData(data);
    this.#data[position] = _data;
    const stash = [_data];
    const g = this.#root.append('g')
    this.#canvas[position] = g;
    const lines = g.append('g').attr('class', 'lines')
    const nodes = g.append('g').attr('class', 'nodes');
    const callback = () => {
      if (!stash.length) {
        return;
      }
      const curr = stash.shift();
      if (!curr) {
        return;
      }
      const { __children, type } = curr;
      if (__children?.length) {
        stash.push(...__children)
      }
      // 非根节点画线，根节点不需要画线
      if (type !== 'root') {
        const line = lines
          .append('path')
          .attr('class', 'line')
          .attr('fill', 'none')
          .attr('stroke', '#D8D8D8')
          .attr('stroke-opacity', 0.9)
          .attr('stroke-width', 0.5)
          .attr('opacity', 0)
        curr.__line = line;
      }
      // 插入当前节点
      const node = nodes
        .append('g')
        .attr('class', 'node')
        .attr('transform', `translate(0,0)`)
        .attr('opacity', type === 'root' ? 1 : 0)
        .attr('cursor', 'pointer')
      // 绑定节点到数据
      curr.__node = node;
      this.#createNode(node, curr, position)
      if (stash.length) {
        requestAnimationFrame(callback)
      } else {
        setTimeout(() => this.#animation(position), 300)
      }
    }
    requestAnimationFrame(callback)
  }
}

export default Enterprise;