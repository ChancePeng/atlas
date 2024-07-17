import React, { useEffect } from "react";
import { Penetration } from '@change/atlas';
import { data, ent } from './data'
import '../index.less'
const PenetrationChart = () => {
  useEffect(() => {
    const penetration = new Penetration('#penetration')
    penetration.render(data, 'top')
    penetration.render(data, 'bottom')
    penetration.onrequest = () => {
      return ent
    }
  }, [])
  return <div id="penetration" className="chart" />
}

export default PenetrationChart