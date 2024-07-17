import React, { useEffect } from "react";
import { Controller } from "@change/atlas";
import { data } from './data';
import '../index.less'
const ControllerChart = () => {
  useEffect(() => {
    const controller = new Controller('#controller')
    controller.render(data)
  }, [])

  return <div id="controller" className="chart" />
}

export default ControllerChart