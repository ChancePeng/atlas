import React, { useEffect } from "react";
import { StockRight } from "@change/atlas";
import { data, ent } from './data'
import '../index.less'

const StockChart = () => {
  useEffect(() => {
    const stockRight = new StockRight('#scock')
    stockRight.render(data)
    stockRight.onrequest = () => {
      return ent
    }
  }, [])

  return <div id="scock" className="chart" />
}

export default StockChart;