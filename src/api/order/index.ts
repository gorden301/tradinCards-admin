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

/** 分页订单列表 */
export function getNewOrderList(data: any) {
	return request({
		// baseUrl,
		url: "order/newOrderList",
		method: "post",
        data
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
