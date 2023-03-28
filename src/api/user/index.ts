import { request } from "@/utils/service"

// const baseUrl = "http://localhost:3000/"

/** 用户列表 */
export function getUserList(data: any) {
	return request({
		// baseUrl,
		url: "user/usersList",
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

