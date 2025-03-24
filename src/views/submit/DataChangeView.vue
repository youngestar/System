<script lang="ts" setup>
import { reactive, ref } from 'vue'
import type { ComponentSize, FormInstance, FormRules } from 'element-plus'

interface RuleForm {
  name: string
  region: string
  count: string
  date1: string
  date2: string
  date3: string
  date4: string
  delivery: boolean
  location: string
  type: string[]
  resource: string
  desc: string
}

const formSize = ref<ComponentSize>('default')
const ruleFormRef = ref<FormInstance>()
const ruleForm = reactive<RuleForm>({
  name: '',
  region: '',
  count: '',
  date1: '',
  date2: '',
  date3: '',
  date4: '',
  delivery: false,
  location: '',
  type: [],
  resource: '',
  desc: '',
})

const locationOptions = ['云端', '本地', '混合']

const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '请输入域名', trigger: 'blur' },
    { min: 3, max: 50, message: '域名长度应在3到50个字符之间', trigger: 'blur' },
  ],
  region: [
    {
      required: true,
      message: '请选择保护区域',
      trigger: 'change',
    },
  ],
  count: [
    {
      required: true,
      message: '请选择保护等级',
      trigger: 'change',
    },
  ],
  date1: [
    {
      type: 'date',
      required: true,
      message: '请选择保护开始日期',
      trigger: 'change',
    },
  ],
  date2: [
    {
      type: 'date',
      required: true,
      message: '请选择保护开始时间',
      trigger: 'change',
    },
  ],
  date3: [
    {
      type: 'date',
      required: true,
      message: '请选择保护结束日期',
      trigger: 'change',
    },
  ],
  date4: [
    {
      type: 'date',
      required: true,
      message: '请选择保护结束时间',
      trigger: 'change',
    },
  ],
  location: [
    {
      required: true,
      message: '请选择保护位置',
      trigger: 'change',
    },
  ],
  type: [
    {
      type: 'array',
      required: true,
      message: '请选择至少一个保护类型',
      trigger: 'change',
    },
  ],
  resource: [
    {
      required: true,
      message: '请选择保护资源',
      trigger: 'change',
    },
  ],
  desc: [{ required: true, message: '请输入保护描述', trigger: 'blur' }],
})

const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      console.log('保护申请成功！')
    } else {
      console.log('保护申请失败', fields)
    }
  })
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

const options = [
  { value: '低', label: '低保护' },
  { value: '中', label: '中保护' },
  { value: '高', label: '高保护' },
  { value: '关键', label: '关键保护' },
]
</script>

<template>
  <div id="home">
    <el-form
      ref="ruleFormRef"
      style="min-width: 600px"
      :model="ruleForm"
      :rules="rules"
      label-width="auto"
      class="demo-ruleForm"
      :size="formSize"
      status-icon
    >
      <h1 style="text-align: center; font-size: 4vh">域名配置</h1>
      <el-form-item label="域名" prop="name" class="item">
        <el-input v-model="ruleForm.name" placeholder="请输入域名" />
      </el-form-item>
      <el-form-item label="保护区域" prop="region">
        <el-select v-model="ruleForm.region" placeholder="选择保护区域">
          <el-option label="北美" value="north-america" />
          <el-option label="欧洲" value="europe" />
          <el-option label="亚洲" value="asia" />
          <el-option label="澳大利亚" value="australia" />
          <el-option label="非洲" value="africa" />
        </el-select>
      </el-form-item>
      <el-form-item label="保护等级" prop="count">
        <el-select v-model="ruleForm.count" placeholder="选择保护等级" :options="options">
          <el-option
            v-for="(item, index) in options"
            :lable="item.label"
            :value="item.value"
            :key="index"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="开始时间" required>
        <el-col :span="11">
          <el-form-item prop="date1">
            <el-date-picker
              v-model="ruleForm.date1"
              type="date"
              aria-label="选择开始日期"
              placeholder="开始日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col class="text-center" :span="2">
          <span class="text-gray-500">----</span>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="date2">
            <el-time-picker
              v-model="ruleForm.date2"
              aria-label="选择开始时间"
              placeholder="开始时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="结束时间" required>
        <el-col :span="11">
          <el-form-item prop="date3">
            <el-date-picker
              v-model="ruleForm.date3"
              type="date"
              aria-label="选择结束日期"
              placeholder="结束日期"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col class="text-center" :span="2">
          <span class="text-gray-500">----</span>
        </el-col>
        <el-col :span="11">
          <el-form-item prop="date4">
            <el-time-picker
              v-model="ruleForm.date4"
              aria-label="选择结束时间"
              placeholder="结束时间"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-form-item>
      <el-form-item label="即时保护" prop="delivery">
        <el-switch v-model="ruleForm.delivery" />
      </el-form-item>
      <el-form-item label="保护位置" prop="location">
        <el-segmented v-model="ruleForm.location" :options="locationOptions" />
      </el-form-item>
      <el-form-item label="保护类型" prop="type">
        <el-checkbox-group v-model="ruleForm.type">
          <el-checkbox value="防火墙保护" name="type" style="color: #56667c">
            防火墙保护
          </el-checkbox>
          <el-checkbox value="DDoS攻击防护" name="type" style="color: #56667c">
            DDoS攻击防护
          </el-checkbox>
          <el-checkbox value="入侵检测" name="type" style="color: #56667c"> 入侵检测 </el-checkbox>
          <el-checkbox value="数据加密" name="type" style="color: #56667c"> 数据加密 </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      <el-form-item label="保护资源" prop="resource">
        <el-radio-group v-model="ruleForm.resource">
          <el-radio value="云服务" style="color: #56667c">云服务</el-radio>
          <el-radio value="本地解决方案" style="color: #56667c">本地解决方案</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="保护描述" prop="desc">
        <el-input v-model="ruleForm.desc" type="textarea" placeholder="描述保护内容" />
      </el-form-item>
      <el-form-item style="padding-bottom: 3vh">
        <el-button
          style="position: absolute; right: 12vh"
          type="primary"
          @click="submitForm(ruleFormRef)"
        >
          应用保护
        </el-button>
        <el-button style="position: absolute; right: 3vh" @click="resetForm(ruleFormRef)"
          >重置</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.el-form {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  width: 60%;
  margin: 1vh auto;
  /* 背景白色卡片 */
  background-color: rgba(255, 255, 255, 0.3);
  border: 0.25vh solid #fff;
  border-radius: 2vh;
  font-size: 1.5vh;

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    content: '';
    height: 100%;
    width: 100%;
    background-image: url(@/assets/2_gif_2.gif);
    background-size: cover;
    opacity: 1;
    z-index: -1;

    border-radius: 2vh;
  }

  .el-form-item {
    padding: 1.5vh;
  }
}
</style>

<style>
.el-form-item .el-form-item__label {
  color: #56667c; /* 改变标签颜色为白色 */
}
</style>
