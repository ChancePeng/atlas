import React, { useEffect } from 'react'
import Chart from '@change/atlas';
import { left, right, presion_guo, persion_niu, ent } from './data';
import './index.less'
export default () => {
  useEffect(() => {
    const enterprise = new Chart.Enterprise('#graph')
    enterprise.render(left, 'left')
    enterprise.render(right, 'right')
    enterprise.onrequest = async (config) => {
      if (config.text === '新旗互动(北京)广告传媒有限公司') {
        return ent
      }
      if (config.text === '郭倩倩') {
        return presion_guo
      }
      return persion_niu
    }
  }, [])
  return (
    <div id="graph">
    </div>
  )
}