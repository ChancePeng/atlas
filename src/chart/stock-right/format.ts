
import { format as _format } from '@/data';

import type { IData, FormatOptions, FieldNames } from "@/data";
import type { Attributes } from "./types";

const PADDING = 10;

type Options = Omit<FormatOptions<Attributes>, 'attrs'> & {
  fieldNames?: FieldNames
}

const format = (data: IData, options?: Options) => {
  return _format<Attributes>(data, {
    ...options,
    attrs(that) {
      return {
        a: {},
        box: {
          get height() {
            let offset = that.__attrs.height;
            if (that.__children?.length) {
              that.__children.forEach(item => {
                offset += item.__attrs.box.height + PADDING
              })
            }
            return offset;
          }
        },
        get expandable() {
          if (that.children?.length) {
            return true
          }
          return that.expandable
        },
        x: (that.__level || 0) * 20,
        width: 500 - (that.__level || 0) * 20,
        get height() {
          if (that.type === 'root') {
            return 40
          }
          const tags = that.tags;
          const desc = that.desc;
          let offset = 40;
          if (tags) {
            offset += 20;
          }
          if (desc) {
            offset += 28
          }
          return offset
        },
        get y() {
          if (that.type === 'root') {
            return 0
          }
          let offset = that.__father?.__attrs.y || 0;
          const _father = that.__father;
          const _brower = that.__brother;
          const _index = that.__index || 0;
          if (_father) {
            offset += _father.__attrs.height + PADDING;
          };
          if (_brower?.length) {
            _brower.forEach((item, index) => {
              if (index < _index) {
                offset += item.__attrs.box.height + PADDING
              }
            })
          }
          return offset;
        }
      }
    }
  })
}

export default format;