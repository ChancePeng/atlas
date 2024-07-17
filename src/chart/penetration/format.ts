import { IData, FormatOptions } from "@/data";
import { format as _format } from '@/data'
import { split, width } from "@/utils";
import { Attributes } from "./types";
const PADDING_X = 10;
const PADDING_Y = 60;
type Options = Omit<FormatOptions<Attributes>, 'attrs'>;

const format = (data: IData, options?: Options) => {
  return _format<Attributes>(data, {
    ...options,
    attrs(that) {
      return {
        spans: that.type === 'root' ? [that.text || ''] : split(that.text || '', 18),
        get expandable() {
          if (that.children?.length) {
            return true
          }
          return that.expandable
        },
        width: that.type === 'root' ? width(that.text || '') : 240,
        get height() {
          if (that.type === 'root') {
            return 32
          }
          return this.spans.length * 16 + 20;
        },
        box: {
          get width() {
            if (that.__children?.length) {
              let offset = 0;
              that.__children.forEach(item => {
                offset += item.__attrs.box.width
              })
              return offset;
            } else {
              return that.__attrs.width + PADDING_X;
            }
          }
        },
        bbox: {
          get height() {
            if (that.__brother?.length) {
              return Math.max(...(that.__brother.map(item => item.__attrs.height)))
            }
            return that.__attrs.height;
          }
        },
        get x() {
          if (that.type === 'root') {
            return 0
          }
          const _father = that.__father;
          const _index = that.__index || 0;
          const _brother = that.__brother;
          let offset = 0
          if (_father) {
            offset += _father.__attrs.x - _father.__attrs.box.width / 2 + that.__attrs.box.width / 2;
          }
          if (_brother?.length) {
            _brother.forEach((item, index) => {
              if (index < _index) {
                offset += item.__attrs.box.width
              }
            })
          }
          return offset;
        },
        get y() {
          if (that.type === 'root') {
            return 0
          }
          const _father = that.__father;
          let offset = that.__attrs.bbox.height / 2
          if (_father) {
            offset += _father.__attrs.y + _father.__attrs.bbox.height / 2
          }
          return offset + PADDING_Y
        }
      }
    }
  })
}

export default format;