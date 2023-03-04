import { request } from "@/utils/service"

// const baseUrl = "http://localhost:3000/"
/** 所有订单列表 */
export function getOrderList() {
	return request({
		// baseUrl,
		url: "order/orderList",
		method: "get"
	})
}

/*
    更新订单列表
*/

export function updateOrder(data: any) {
	return request({
		url: "order/updateOrder",
		method: "post",
		data
	})
}
