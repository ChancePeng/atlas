import React, { useEffect } from "react";
import { Enterprise } from "@change/atlas";
import { left, right, presion_guo, persion_niu, ent } from './data';

import '../index.less'

const EntChart = () => {
  useEffect(() => {
    const enterprise = new Enterprise('#ent')
    enterprise.render(left, 'left')
    enterprise.render(right, 'right')
    enterprise.onrequest = async (config) => {
      if (config.text === '新旗互动(北京)广告传媒有限公司') {
        return ent
      }
      if (config.text === '郭倩倩') {
        return presion_guo
      }
      if(config.text === '牛晓路'){
        return persion_niu
      }
      return left.children
    }
  }, [])

  return <div id="ent" className="chart" />
}

export default EntChart;