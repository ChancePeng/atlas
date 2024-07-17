import { IData } from "@change/atlas";



export const data: IData = {
  type: 'root',
  text: '宝鸡有一群怀揣着梦想的少年相信在牛大叔的带领下会创造生命的奇迹...',
  fill: '#128BED',
  children: [
    {
      type: 'text',
      fill: '#128BED',
      text: '新旗互动(北京)广告传媒有限公司',
      expandable: true,
      desc: [
        {
          text: '2.00%',
          title: '持股比例'
        },
        {
          text: '2.00万元',
          title: '任缴金额'
        },
      ]
    },
    {
      type: 'text',
      fill: '#FF7777',
      text: '牛晓路',
      tags: ['大股东'],
      desc: [
        {
          text: '52.00%',
          title: '持股比例'
        }
      ]
    },
    {
      type: 'text',
      fill: '#FF7777',
      text: '郭倩倩',
      tags: ['大股东'],
      desc: [
        {
          text: '52.00%',
          title: '持股比例'
        },
        {
          text: '46.00万元',
          title: '任缴金额'
        }
      ]
    },
    
  ]
}

export const ent: IData[] = [
  {
    type: 'text',
    text: '肖剑',
    fill: '#FF7777',
    tags: ['大股东'],
    desc: [
      {
        text: '99.00%',
        title: '持股比例'
      },
      {
        text: '111.10万元',
        title: '任缴金额'
      },
    ]
  },
  {
    type:'text',
    text:'陈裕强',
    fill:'#FF7777',
    desc: [
      {
        text: '1.00%',
        title: '持股比例'
      },
      {
        text: '1.12万元',
        title: '任缴金额'
      },
    ]
  }
]