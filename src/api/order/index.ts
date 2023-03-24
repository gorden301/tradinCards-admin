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

/*
    上传图片
*/
export function uploadImg(data: any) {
	return request({
		url: "order/uploadImg",
		method: "post",
        headers: {
            'content-type': 'multipart/form-data'
        },
		data
	})
}

/*
    删除云空间里的文件
*/
export function deleteFiles(data: any) {
	return request({
		url: "order/deleteStorageFile",
		method: "post",
		data
	})
}
