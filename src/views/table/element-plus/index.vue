<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { getOrderList, updateOrder, getNewOrderList, uploadImg, deleteFiles } from "@/api/order"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox, ElLoading } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { orderStatusMap, orderStatusOptions, orderType, sellTypes } from "./constant"
import { formatDateTime } from "@/utils/index"
import type { UploadInstance, UploadProps } from "element-plus"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const editIndex = ref<number>(0)
// 判断是编辑还是新建单卡详情
const isEditSingleCard = ref<boolean>(false)
// 添加卡片详情弹窗visible
const addCardDialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
let formData = reactive<Record<string, any>>({})
// 新增卡片详情form ref
const addCardRef = ref<FormInstance | null>(null)
// 新增卡片详情formdata
let addCardData = reactive<any>({
	cardName: "",
	cardNo: "",
	cardPoint: ""
})
// 上传图片upload
const uploadRef = ref<UploadInstance>()
// 单卡里的图片list
const singleCardImgs = ref<any[]>([])
// 订单卡片详情列表
const singleDetailList = ref<any[]>([])
// 卡片upload组件展示list
const fileList = ref<any[]>([])
const disabled = ref(false)
// const formRules: FormRules = reactive({
// 	username: [{ required: true, trigger: "blur", message: "请输入用户名" }],
// 	password: [{ required: true, trigger: "blur", message: "请输入密码" }]
// })
const openAddCard = () => {
	addCardRef.value?.resetFields()
	isEditSingleCard.value = false
	addCardData.cardName = ""
	addCardData.cardNo = ""
	addCardData.cardPoint = ""
	fileList.value = []
	addCardDialogVisible.value = true
}
const handleChange: UploadProps["onChange"] = (uploadFile) => {
	fileList.value.push(uploadFile)
}

// 获取订单list
const getOrderData = async () => {
	loading.value = true
	const newRes: any = await getNewOrderList({
		page: paginationData.currentPage,
		...searchData
	})
	loading.value = false
	if (newRes.code === 0) {
		paginationData.total = newRes.data?.total
		tableData.value = newRes.data?.data?.map((item: any) => {
			item.createTime = formatDateTime(item.createTime?.$date)
			return item
		})
		// paginationData.currentPage = paginationData.currentPage + 1
	}
	console.log("newRes", newRes)
}

const handlePictureCardPreview = () => {}

// 编辑单卡详情
const editSingleCards = (item: any, index: number) => {
	isEditSingleCard.value = true
	console.log("item", item)
	addCardDialogVisible.value = true
	addCardData = item
	editIndex.value = index
	singleCardImgs
	fileList.value = item.singleCardImgs.map((item: any) => {
		return {
			name: index,
			url: item.download_url,
			fileid: item.fileid
		}
	})
}

const delelteSingleCards = async (item: any, index: number) => {
	const delRes: any = await deleteFiles({
		fileids: item.singleCardImgs.map((v: any) => {
			return v.fileid
		})
	})
	if (delRes.code === 0) {
		singleDetailList.value = singleDetailList.value.filter((item, _index) => {
			return _index !== index
		})
	}
}

const handleRemove = () => {}

// 创建或编辑单卡详情
const handleCreateCard = async () => {
	// 循环上传图片到云存储
	const uploadedImgs = fileList.value
		?.filter((item) => !item.raw)
		.map((item) => {
			return {
				fileid: item.fileid,
				download_url: item.url
			}
		})
	// 先把已经存在的合并进去
	const _loading = ElLoading.service({
		lock: true,
		text: "Loading",
		background: "rgba(0, 0, 0, 0.7)"
	})
	singleCardImgs.value = singleCardImgs.value.concat(uploadedImgs)
	for (let i = 0; i < fileList.value.length; i++) {
		if (!fileList.value[i].raw) {
			continue
		}
		const formData = new FormData()
		formData.append("file", fileList.value[i].raw)
		const result: any = await uploadImg(formData)
		if (result.code == 0) {
			singleCardImgs.value.push(result.data)
		}
	}
	_loading.close()
	if (isEditSingleCard.value) {
		singleDetailList.value[editIndex.value] = {
			...addCardData,
			singleCardImgs: singleCardImgs.value
		}
	} else {
		singleDetailList.value.push({
			...addCardData,
			singleCardImgs: singleCardImgs.value
		})
	}
	addCardDialogVisible.value = false
	singleCardImgs.value = []
}

const handleCreate = async () => {
	const { customerComment, orderStatus, _id, sellNumber } = formData
	const updateRes: any = await updateOrder({
		customerComment,
		orderStatus,
		singleDetailList: singleDetailList.value,
		_id,
		sellNumber
	})
	if (updateRes?.data?.modified > 0) {
		ElMessage.success("更新成功")
		dialogVisible.value = false
		getOrderData()
	} else {
		ElMessage.success("更新失败")
	}
}
const resetForm = () => {
	currentUpdateId.value = undefined
	formData.username = ""
	formData.password = ""
}
//#endregion

//#region 删
const handleDelete = (row: any) => {
	ElMessageBox.confirm(`正在删除用户：${row.username}，确认删除？`, "提示", {
		confirmButtonText: "确定",
		cancelButtonText: "取消",
		type: "warning"
	}).then(() => {
		deleteTableDataApi(row.id).then(() => {
			ElMessage.success("删除成功")
			getTableData()
		})
	})
}
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: any) => {
	row.orderStatus = row.orderStatus?.toString()
	if (row.singleDetailList) {
		singleDetailList.value = JSON.parse(row.singleDetailList) || []
	} else {
		singleDetailList.value = []
	}
	formData = row
	// formData.username = row.username
	// formData.password = row.password
	dialogVisible.value = true
}
//#endregion

//#region 查
const tableData = ref<any[]>([])
const searchFormRef = ref<FormInstance | null>(null)
const searchData = reactive({
	nickName: "",
	phoneNumer: "",
	_id: "",
	orderType: ""
})
const getTableData = () => {
	// loading.value = true
	// getTableDataApi({
	// 	currentPage: paginationData.currentPage,
	// 	size: paginationData.pageSize,
	// 	username: searchData.username || undefined,
	// 	phone: searchData.phone || undefined
	// })
	// 	.then((res) => {
	// 		paginationData.total = res.data.total
	// 		tableData.value = res.data.list
	// 	})
	// 	.catch(() => {
	// 		tableData.value = []
	// 	})
	// 	.finally(() => {
	// 		loading.value = false
	// 	})
}
const handleSearch = () => {
	getOrderData()
}
const resetSearch = async () => {
	searchFormRef.value?.resetFields()
	getOrderData()
}
const handleRefresh = () => {
	getOrderData()
}

onMounted(() => {
	getOrderData()
})
//#endregion

/** 监听分页参数的变化 */
watch([() => paginationData.currentPage, () => paginationData.pageSize], getTableData, { immediate: true })
</script>

<template>
	<div class="app-container">
		<el-card shadow="never" class="search-wrapper">
			<el-form ref="searchFormRef" :inline="true" :model="searchData">
				<el-form-item prop="_id" label="订单编号">
					<el-input v-model="searchData._id" placeholder="请输入" />
				</el-form-item>
				<el-form-item prop="nickName" label="用户名">
					<el-input v-model="searchData.nickName" placeholder="请输入" />
				</el-form-item>
				<el-form-item prop="phoneNumer" label="手机号">
					<el-input v-model="searchData.phoneNumer" placeholder="请输入" />
				</el-form-item>
				<el-form-item prop="orderType" label="订单类型">
					<el-select v-model="searchData.orderType">
						<el-option :value="Number(1)" label="评级" />
						<el-option :value="Number(2)" label="代卖" />
					</el-select>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" :icon="Search" @click="handleSearch">查询</el-button>
					<el-button :icon="Refresh" @click="resetSearch">重置</el-button>
				</el-form-item>
			</el-form>
		</el-card>
		<el-card v-loading="loading" shadow="never">
			<div class="toolbar-wrapper">
				<div>
					<el-button type="primary" :icon="CirclePlus" @click="dialogVisible = true">新增用户</el-button>
					<el-button type="danger" :icon="Delete">批量删除</el-button>
				</div>
				<div>
					<el-tooltip content="下载">
						<el-button type="primary" :icon="Download" circle />
					</el-tooltip>
					<el-tooltip content="刷新表格">
						<el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
					</el-tooltip>
				</div>
			</div>
			<div class="table-wrapper">
				<el-table :data="tableData">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column prop="_id" label="订单编号" align="center" />
					<el-table-column prop="orderType" label="订单类型" align="center">
						<template #default="scope">
							<div flex>
								<div>{{ orderType[scope.row.orderType] }}</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="nickName" label="用户" align="center">
						<template #default="scope">
							<div flex>
								<img v-if="scope.row.avatarHttpsUrl" :src="scope.row.avatarHttpsUrl" w-10 h-10 />
								<div>{{ scope.row.nickName }}</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="phoneNumer" label="手机号" align="center" />
					<el-table-column prop="gradeCompany" label="评级公司" align="center" />
					<el-table-column prop="gradeLevel" label="评级档位" align="center" />
					<el-table-column prop="cardImgs" label="图片" align="center">
						<template #default="scope">
							<div flex>
								<img v-for="(item, index) in scope.row.fileList" w-40 h-40 :src="item?.tempFileURL" :key="index" />
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="cardNumber" label="卡片数量" align="center" />
					<el-table-column prop="orderStatus" label="订单状态" align="center">
						<template #default="scope">
							<div>
								{{ orderStatusMap[scope.row.orderStatus] }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="createTime" label="创建时间" align="center">
						<template #default="scope">
							<div>
								{{ scope.row.createTime }}
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="comment" label="备注" align="center" />
					<el-table-column fixed="right" label="操作" width="150" align="center">
						<template #default="scope">
							<!-- <span v-if="scope.row.orderStatus === 1">确认订单</span> -->
							<el-button type="primary" text bg size="small" @click="handleUpdate(scope.row)">查看详情及编辑</el-button>
							<!-- <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button> -->
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="pager-wrapper">
				<el-pagination
					background
					:layout="paginationData.layout"
					:total="paginationData.total"
					:page-size="10"
					:currentPage="paginationData.currentPage"
					@size-change="handleSizeChange"
					@current-change="handleCurrentChange($event, getOrderData)"
				/>
			</div>
		</el-card>
		<!-- 新增/修改 -->
		<el-dialog v-model="dialogVisible" title="订单详情" @close="resetForm" width="60%">
			<el-form ref="formRef" :model="formData" label-width="150px" label-position="left">
				<el-form-item prop="nickName" label="用户名及手机">
					<span mr-5>{{ formData.nickName }}</span>
					<span>{{ formData.phoneNumer }}</span>
				</el-form-item>
				<template v-if="formData.orderType == 1">
					<el-form-item prop="grade" label="评级公司及档位">
						<span mr-5>{{ formData.gradeCompany }}</span>
						<span>{{ formData.gradeLevel }}</span>
					</el-form-item>
					<el-form-item prop="cardNumber" label="卡片数量">
						<span>{{ formData.cardNumber }}</span>
					</el-form-item>
				</template>
				<template v-if="formData.orderType == 2">
					<el-form-item prop="sellType" label="代卖模式">
						<span>{{ sellTypes[formData.sellType] }}</span>
					</el-form-item>
					<el-form-item v-if="formData.sellType == 1" prop="sellDays" label="拍卖天数">
						<span>{{ formData.sellDays }}</span>
					</el-form-item>
					<el-form-item v-if="formData.sellType != 1" prop="hopePrice" label="期望价格">
						<span>{{ formData.hopePrice }}</span>
					</el-form-item>
				</template>
				<el-form-item prop="cardImgs" label="图片">
					<el-image
						:preview-src-list="formData.fileList.map((item) => item.tempFileURL)"
						v-for="(item, index) in formData.fileList"
						style="width: 150px; height: 150px; margin-right: 40px"
						mr-10
						:key="index"
						:src="item.tempFileURL"
					/>
				</el-form-item>
				<el-form-item prop="createTime" label="创建时间">
					<span>{{ formData.createTime }}</span>
				</el-form-item>
				<el-form-item prop="cardImgs" label="备注">
					<span>{{ formData.comment }}</span>
				</el-form-item>
				<el-form-item prop="orderStatus" label="订单状态">
					<el-select v-model="formData.orderStatus">
						<el-option
							v-for="(item, index) in orderStatusOptions"
							:key="index"
							:value="item.value"
							:label="item.label"
						/>
					</el-select>
				</el-form-item>
				<template v-if="formData.orderType == 1">
					<el-form-item prop="cardsDetail" label="卡片详情">
						<el-button @click="openAddCard" type="primary">添加</el-button>
						<div v-if="singleDetailList?.length > 0" flex>
							<div v-for="(item, index) in singleDetailList" class="singleCard" :key="index">
								<img :src="item.singleCardImgs[0]?.download_url" />
								<div>{{ item.cardName }}</div>
								<div flex>
									<div class="txt" @click="editSingleCards(item, index)">查看编辑</div>
									<div class="txt" @click="delelteSingleCards(item, index)">删除</div>
								</div>
							</div>
						</div>
					</el-form-item>
				</template>
				<el-form-item v-if="formData.orderType == 2" prop="sellNumber" label="ebay上架物品编号">
					<el-input v-model="formData.sellNumber" placeholder="请输入ebay上架物品编号" />
				</el-form-item>
				<el-form-item prop="customerComment" label="客服留言">
					<el-input v-model="formData.customerComment" :rows="4" type="textarea" placeholder="请输入留言..." />
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleCreate">确认</el-button>
			</template>
		</el-dialog>
		<el-dialog v-model="addCardDialogVisible" title="卡片详情" width="60%">
			<el-form ref="addCardRef" :model="addCardData" label-width="150px" label-position="left">
				<el-form-item prop="cardName" label="卡片名称">
					<el-input v-model="addCardData.cardName" placeholder="请输入卡片名称" />
				</el-form-item>
				<el-form-item prop="cardNo" label="评级编号">
					<el-input v-model="addCardData.cardNo" placeholder="请输入评级编号" />
				</el-form-item>
				<el-form-item prop="cardPoint" label="评级分数">
					<el-input v-model="addCardData.cardPoint" placeholder="请输入评级分数" />
				</el-form-item>
				<el-form-item prop="cardList" label="卡片图示">
					<el-upload
						ref="uploadRef"
						v-model:file-list="fileList"
						action="#"
						:on-change="handleChange"
						multiple
						:limit="2"
						:auto-upload="false"
						list-type="picture-card"
						:on-remove="handleRemove"
						:on-preview="handlePictureCardPreview"
					>
						<el-icon>
							<Plus />
						</el-icon>
					</el-upload>
				</el-form-item>
			</el-form>
			<template #footer>
				<el-button @click="addCardDialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleCreateCard">确认</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<style lang="scss" scoped>
.search-wrapper {
	margin-bottom: 20px;

	:deep(.el-card__body) {
		padding-bottom: 2px;
	}
}

.singleCard {
	display: flex;
	flex-direction: column;
	margin-right: 20px;
	flex-wrap: nowrap;
	border: 1px solid gainsboro;
	border-radius: 10px;
	padding: 20px;

	img {
		width: 80px;
		height: 80px;
	}

	.txt {
		color: rgb(51, 153, 199);
		cursor: pointer;
		margin-right: 20px;
	}
}

.toolbar-wrapper {
	display: flex;
	justify-content: space-between;
	margin-bottom: 20px;
}

.table-wrapper {
	margin-bottom: 20px;
}

.pager-wrapper {
	display: flex;
	justify-content: flex-end;
}
</style>
