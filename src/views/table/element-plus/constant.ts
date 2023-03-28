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

export { orderStatusMap, orderStatusOptions, orderType, sellTypes }
