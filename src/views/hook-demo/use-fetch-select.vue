<script lang="ts" setup>
import { reactive, ref, watch, onMounted } from "vue"
import { createTableDataApi, deleteTableDataApi, updateTableDataApi, getTableDataApi } from "@/api/table"
import { getOrderList, updateOrder, getNewOrderList, uploadImg, deleteFiles, createOrders } from "@/api/order"
import { getUserList } from "@/api/user"
import { type FormInstance, type FormRules, ElMessage, ElMessageBox } from "element-plus"
import { Search, Refresh, CirclePlus, Delete, Download, RefreshRight } from "@element-plus/icons-vue"
import { usePagination } from "@/hooks/usePagination"
import { orderStatusMap, orderStatusOptions, orderType, sellTypes, gradeConfigs } from "./constant"
import { formatDateTime } from "@/utils/index"
import type { UploadInstance, UploadProps } from 'element-plus'
import { Form } from "vxe-table"
import { ITEM_RENDER_EVT } from "element-plus/es/components/virtual-list/src/defaults"

const loading = ref<boolean>(false)
const { paginationData, handleCurrentChange, handleSizeChange } = usePagination()

//#region 增
const dialogVisible = ref<boolean>(false)
const currentOpenId = ref<any>('')
const addCardDialogVisible = ref<boolean>(false)
const formRef = ref<FormInstance | null>(null)
let formData = reactive<Record<string, any>>({})
let addCardRef = ref<FormInstance | null>(null)
let addCardData = reactive<Record<string, any>>({})
const uploadRef = ref<UploadInstance>()
let singleCardImgs = ref<any[]>([])
let singleDetailList = ref<any[]>([])
const fileList = ref<any[]>([])
const disabled = ref(false)

const openAddCard = () => {
	addCardRef.value?.resetFields()
	fileList.value = []
	addCardDialogVisible.value = true
}
const handleChange: UploadProps['onChange'] = (uploadFile, uploadFiles) => {
	fileList.value.push(uploadFile)
}

const createOrder = (row: any) => {
	dialogVisible.value = true
	currentOpenId.value = row
}

const getOrderData = async () => {
	loading.value = true
	// const getRes: any = await getOrderList()
	const newRes: any = await getUserList({
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

const handlePictureCardPreview = () => { }

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

const handleRemove = () => { }

const handleCreateCard = async () => {
	for (let i = 0; i < fileList.value.length; i++) {
		const formData = new FormData()
		formData.append('file', fileList.value[i].raw)
		const result: any = await uploadImg(formData)
		if (result.code == 0) {
			singleCardImgs.value.push(result.data)
		}
	}
}

const handleCreate = async () => {
	await handleCreateCard()
	const { customerComment, orderStatus, _id, sellNumber } = formData
	const updateRes: any = await createOrders({
		...formData,
		fileIds: singleCardImgs.value.map(item => item.fileid),
		fileList: singleCardImgs.value.map(item => {
			return {
				tempFileURL: item.download_url,
				fileID: item.fileid,
			}
		}),
		openid: currentOpenId.value.openid,
		nickName: currentOpenId.value.nickName,
		avatarHttpsUrl: currentOpenId.value.avatarHttpsUrl,
		phoneNumer: currentOpenId.value.phoneNumer,
		isPc: true
	})
	singleCardImgs.value = []
	debugger
	// if (updateRes?.data?.modified > 0) {
	// 	ElMessage.success("更新成功")
	// 	dialogVisible.value = false
	// 	getOrderData()
	// } else {
	// 	ElMessage.success("更新失败")
	// }
}
const resetForm = () => {
	currentUpdateId.value = undefined
	formData.username = ""
	formData.password = ""
}
//#endregion
//#endregion

//#region 改
const currentUpdateId = ref<undefined | string>(undefined)
const handleUpdate = (row: any) => {
	row.orderStatus = row.orderStatus?.toString()
	formData = row
	if (row.singleDetailList) {
		singleDetailList.value = JSON.parse(row.singleDetailList || [])
	}
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
	_id: ''
})

const handleSearch = () => {
	getOrderData()
}
const resetSearch = async () => {
	searchFormRef.value?.resetFields()
	getOrderData()
}

const getTableData = () => { }

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
				<el-form-item prop="_id" label="用户标识">
					<el-input v-model="searchData._id" placeholder="请输入" />
				</el-form-item>
				<el-form-item prop="nickName" label="用户名">
					<el-input v-model="searchData.nickName" placeholder="请输入" />
				</el-form-item>
				<el-form-item prop="phoneNumer" label="手机号">
					<el-input v-model="searchData.phoneNumer" placeholder="请输入" />
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
					<el-tooltip content="刷新表格">
						<el-button type="primary" :icon="RefreshRight" circle @click="handleRefresh" />
					</el-tooltip>
				</div>
			</div>
			<div class="table-wrapper">
				<el-table :data="tableData">
					<el-table-column type="selection" width="50" align="center" />
					<el-table-column prop="_id" label="用户标识" align="center" />
					<el-table-column prop="nickName" label="用户" align="center">
						<template #default="scope">
							<div flex>
								<img v-if="scope.row.avatarHttpsUrl" :src="scope.row.avatarHttpsUrl" w-10 h-10 />
								<div>{{ scope.row.nickName }}</div>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="phoneNumer" label="手机号" align="center" />
					<el-table-column prop="createTime" label="创建时间" align="center">
						<template #default="scope">
							<div>
								{{ scope.row.createTime }}
							</div>
						</template>
					</el-table-column>
					<el-table-column fixed="right" label="操作" width="150" align="center">
						<template #default="scope">
							<!-- <span v-if="scope.row.orderStatus === 1">确认订单</span> -->
							<el-button type="primary" text bg size="small"
								@click="handleUpdate(scope.row)">查看详情及编辑</el-button>
							<el-button type="primary" text bg size="small"
								@click="createOrder(scope.row)">为用户创建订单</el-button>
							<!-- <el-button type="danger" text bg size="small" @click="handleDelete(scope.row)">删除</el-button> -->
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="pager-wrapper">
				<el-pagination background :layout="paginationData.layout" :total="paginationData.total" :page-size="10"
					:currentPage="paginationData.currentPage" @size-change="handleSizeChange"
					@current-change="handleCurrentChange($event, getOrderData)" />
			</div>
		</el-card>
		<!-- 新增/修改 -->
		<el-dialog v-model="dialogVisible" title="新增订单" @close="resetForm" width="60%">
			<el-form ref="formRef" :model="formData" label-width="150px" label-position="left">
				<el-form-item prop="gradeCompany" label="选择评级公司">
					<el-select v-model="formData.gradeCompany">
						<el-option value="psa" label="psa" />
						<el-option value="bgs" label="bgs" />
						<el-option value="hga" label="hga" />
					</el-select>
				</el-form-item>
				<el-form-item v-if="formData.gradeCompany" prop="gradeLevel" label="选择评级档位">
					<el-select v-model="formData.gradeLevel">
						<el-option v-for="(item, index) in gradeConfigs[formData.gradeCompany].data" :value="item.name" :label="item.name" />
					</el-select>
				</el-form-item>
				<template v-if="formData.gradeCompany">
					<el-form-item prop="cardNumber" label="卡片数量">
						<el-input v-model="formData.cardNumber"></el-input>
					</el-form-item>
					<el-form-item prop="deliveryCompany" label="物流公司">
						<el-input v-model="formData.deliveryCompany"></el-input>
					</el-form-item>
					<el-form-item prop="deliveryOrderNumbe" label="快递单号">
						<el-input v-model="formData.deliveryOrderNumbe"></el-input>
					</el-form-item>
					<el-form-item prop="comment" label="备注">
						<el-input v-model="formData.comment"></el-input>
					</el-form-item>
				</template>
				<el-form-item prop="cardImgs" label="图片">
					<el-upload
						ref="uploadRef"
						v-model:file-list="fileList"
						action="#"
						:on-change="handleChange"
						multiple
						:limit="6"
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
				<el-button @click="dialogVisible = false">取消</el-button>
				<el-button type="primary" @click="handleCreate">确认</el-button>
			</template>
		</el-dialog>
		<!-- <el-dialog v-model="addCardDialogVisible" title="卡片详情" width="60%">
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
					<el-upload ref="uploadRef" v-model:file-list="fileList" action="#" :on-change="handleChange" multiple
						:limit="2" :auto-upload="false" list-type="picture-card" :on-remove="handleRemove"
						:on-preview="handlePictureCardPreview">
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
		</el-dialog> -->
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
