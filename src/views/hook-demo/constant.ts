const orderStatusMap = {
	1: "待客服确认",
	2: "客服已确认",
	3: "正在评级中",
	4: "评分已完成 回寄中",
	5: "订单已完成"
}

const orderStatusOptions = [
	{
		value: "1",
		label: "待客服确认"
	},
	{
		value: "2",
		label: "客服已确认"
	},
	{
		value: "3",
		label: "正在评级中"
	},
	{
		value: "4",
		label: "评分已完成 回寄中"
	},
	{
		value: "5",
		label: "订单已完成"
	}
]

const orderType = {
	1: "评级",
	2: "代卖"
}

const sellTypes = {
	1: "拍卖",
	2: "议价",
	3: "一口价"
}

const gradeConfigs = {
	psa: {
        desc: '',
		data: [
			{
				name: "Bulk批量档",
				desc: "140元/张，10张以上135/张，30张以上130/一张，不平签字，卡价限额$199，理论时效6个月",
			},
			{
				name: "Value特惠档",
				desc: "245元/张，10张以上240/张，30张以上235/一张，签字每张+45，卡价限额$499，理论时效6个月",
			},
			{
				name: "Economy经济档",
				desc: "355元/张，10张以上350/张，30张以上345/一张，签字每张+70，卡价限额$999，理论时效6个月",
			},
			{
				name: "Regular常规档",
				desc: "720元/张，10张以上710/张，30张以上700/一张，签字每张+140，卡价限额$1499，理论时效6个月",
			},
			{
				name: "Express快速档",
				desc: "1100元/张，签字每张+200，卡价限额$2499，理论时效6个月",
			},
			{
				name: "SuperExpress快速档",
				desc: "2200元/张，签字每张+400，卡价限额$4999，理论时效6个月",
			},
			{
				name: "Walk-Through极速档",
				desc: "4300/张，签字每张+800，卡价限额$9999，理论时效6个月",
			},
		],
	},
    bgs: {
        desc: [
            '1.送评小书需在档位的基础上加收100元每张',
            '2.BGS有签字默认评签字，没有限额，档位只有速度区别。',
            '3.BGS不可带壳评级'
        ],
        data: [
            {
                name: 'Economy',
                desc: '￥340/张，理论时效7个月'
            },
            {
                name: 'Standard',
                desc: '￥450/张，理论时效5个月'
            },
            {
                name: 'Express',
                desc: '￥1320/张，理论时效3个月'
            },
            {
                name: 'Premium',
                desc: '￥2300/张，理论时效1个月'
            },
            {
                name: '换壳',
                desc: '￥360/张，理论时效2个月'
            }
        ]
    },
    hga: {
        desc: [
            '1.HGA有标签客制化服务，会根据卡片进行标签设计，在档位费用的基础上加200元每张',
            '2.HGA标签需在特定模板中选择，或者客制化标签(详情微信咨询工作人员)'
        ],
        data: [
            {
                name: 'Best Value',
                desc: '￥320/张，理论时效3个月'
            },
            {
                name: 'Popular',
                desc: '￥420/张，理论时效2个月'
            },
            {
                name: 'Very Fast',
                desc: '￥550/张，理论时效2个月'
            },
            {
                name: 'Fatest',
                desc: '￥880/张，理论时效1个月'
            },
            {
                name: '仅上壳',
                desc: '￥220/张，理论时效2个月'
            }
        ]
    }
};

export { gradeConfigs };


export { orderStatusMap, orderStatusOptions, orderType, sellTypes }
