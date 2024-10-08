import { format as _format } from "@/data"
import { pixel } from "@/utils";

import type { IData, FormatOptions, FieldNames } from '@/data'
import type { Attributes } from "./types";

const PADDING = 100;


type Options = Omit<FormatOptions<Attributes>, 'attrs'> & {
  fieldNames?: FieldNames
}

const format = (data: IData, options?: Options) => {
  return _format<Attributes>(data, {
    ...options,
    attrs(that) {
      return {
        get width() {
          return pixel(that.text || '');
        },
        get height() {
          if (that.type === 'root') {
            return 32
          }
          if ((that.text?.length || 0) > 4) {
            return 48
          }
          return this.width;
        },
        box: {
          get width() {
            return (that.__children?.reduce((prev, curr) => {
              return prev + curr.__attrs.width
            }, 0) || that.__attrs.width) + PADDING
          }
        },
        get x() {
          if (that.type === 'root') {
            return 0
          }
          const _index = that.__index || 0;
          const _brother = that.__brother;
          const _father = that.__father;
          let offset = that.__attrs.width / 2;
          if (_father) {
            offset += _father.__attrs.x - _father.__attrs.box.width / 2
          }
          if (_brother) {
            _brother.forEach((item, index) => {
              if (index < _index) {
                offset += item.__attrs.box.width
              }
            })
          }
          return offset
        },
        y: that.type === 'root' ? 0 : -100,
      }
    }
  })
}

export default format;