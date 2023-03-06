const orderStatusMap = {
	1: "订单待确认",
	2: "订单已确认",
	3: "评级已寄出",
	4: "评级已出分",
	5: "评级回途中",
	6: "订单已完成"
}

const orderStatusOptions = [
	{
		value: "1",
		label: "订单待确认"
	},
	{
		value: "2",
		label: "订单已确认"
	},
	{
		value: "3",
		label: "评级已寄出"
	},
	{
		value: "4",
		label: "评级已出分"
	},
	{
		value: "5",
		label: "评级回途中"
	},
	{
		value: "6",
		label: "订单已完成"
	}
]

const orderType = {
	1: "评级",
	2: "代卖"
}

const sellType = {
	1: "拍卖",
	2: "议价",
	3: "一口价"
}

export { orderStatusMap, orderStatusOptions, orderType, sellType }
