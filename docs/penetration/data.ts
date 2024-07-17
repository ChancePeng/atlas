import { IData } from "@change/atlas";



export const data: IData = {
  type: 'root',
  text: '宝鸡有一群怀揣着梦想的少年相信在牛大叔的带领下会创造生命的奇迹...',
  children: [
    {
      type: 'text',
      text: '新旗互动(北京)广告传媒有限公司',
      expandable: true,
      desc: '2.00%',
    },
    {
      type: 'text',
      text: '牛晓路',
      desc: '52.00%',
    },
    {
      type: 'text',
      text: '郭倩倩',
      desc: '52.00%',
    },

  ]
}

export const ent: IData[] = [
  {
    type: 'text',
    text: '肖剑',
    desc: '99.00%',
  },
  {
    type: 'text',
    text: '陈裕强',
    desc: '1.00%',
  }
]