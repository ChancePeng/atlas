import { type IData, type FormatOptions, format as _format } from '@/data'
import { width } from '@/utils';
import type { Attributes } from './types';

const concat = (data: IData) => {
  const { text, desc } = data;
  let str: string = text || '';
  if (Array.isArray(desc)) {
    desc.forEach(item => {
      if (typeof item === 'string') {
        str += ` [${item}]`;
      } else {
        str += ` [${item.text || ''}]`
      }
    })
  } else if (desc) {
    if (typeof desc === 'string') {
      str += ` [${desc}]`;
    } else {
      str += ` [${desc.text || ''}]`
    }
  }
  return str
}

type Options = Omit<FormatOptions<Attributes>, 'attrs'>
const format = (data: IData, options?: Options) => {
  return _format<Attributes>(data, {
    ...options,
    attrs: (that) => ({
      get fill() {
        if (that.fill) {
          return that.fill;
        }
        return that.__father?.__attrs?.fill || '#128BED'
      },
      get expandable() {
        if (that.type === 'root') {
          return false
        }
        if (that.type === 'label') {
          return !!that.children?.length
        }
        if (that.children?.length) {
          return true
        }
        return that.expandable
      },
      get padding() {
        if (this.expandable) {
          return 16
        }
        return 0
      },
      get width() {
        const text = concat(that)
        return width(text) + this.padding
      },
      height: 32,
      get x() {
        if (that.type === 'root') {
          return 0
        }
        const _father = that.__father;
        // 当前节点的其实位置基于上个节点位置
        let offset = _father?.__attrs.x || 0
        if (_father) {
          // 中心点向左移动父节点一半，使得起始点处于相同位置
          offset -= _father.__attrs.width / 2;
          // 中心点向右偏移整个父节点最大宽度
          offset += _father.__attrs.bbox.width;
          //  中心点向右偏移自身宽度的一半，使得节点左边对齐
          offset += that.__attrs.width / 2
        }
        // 加入一个边距，使得左右两个节点直接存在空隙
        return offset + 100
      },
      get y() {
        const _father = that.__father;
        if (that.type === 'root' || !_father) {
          return 0
        }
        if (_father.__children && _father.__children.length > 1) {
          let offset = _father.__attrs.y - _father.__attrs.box.height / 2 + that.__attrs.box.height / 2;
          const _brother = that.__brother;
          const _index = that.__index || 0;
          _brother?.forEach((item, index) => {
            if (index < _index) {
              offset += item.__attrs.box.height;
            }
          })
          return offset
        }
        return _father.__attrs.y;
      },
      box: {
        get height() {
          const _children = that.__children;
          if (_children?.length) {
            return _children.reduce((prev, curr) => {
              return prev + curr.__attrs.box.height
            }, 0)
          }
          return that.__attrs.height + 20;
        }
      },
      // 兄弟节点整体的盒子宽高
      bbox: {
        get width() {
          const _brother = that.__brother;
          if (_brother?.length) {
            return Math.max(..._brother.map(item => item.__attrs.width))
          }
          return that.__attrs.width
        },
      }
    })
  })
}

export default format;