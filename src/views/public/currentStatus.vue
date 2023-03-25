<template>
  <div class="current-status" v-if="captureStatus">
    <div class="content-layout">
      <a-card class="content-left">
        <template #title>
          <div class="card-title">
            <img src="@/assets/img/currentStatus/currentCameraCapture.svg" alt="currentCameraCapture">
            <span>实时监控画面</span>
          </div>
        </template>
        <template #extra>
          <span style="color: #818488;font-size: 16px;">累计人数：{{ recognitionInfo.total_recognition_count }}人</span>
        </template>
        <div class="capture-img">
          <img :src="captureInfo.img_path" alt="cameraCapture">
        </div>
      </a-card>
      <div class="current-info">
        <a-card>
          <template #title>
            <div class="card-title">
              <img src="@/assets/img/currentStatus/currentCameraInfo.svg" alt="currentCameraInfo">
              <span>实时监控信息</span>
            </div>
          </template>
          <div class="current-info-card">
            <div class="current-info-status">
              <img src="../../assets/img/currentStatus/status0.png" alt="status0" v-if="maskRate === 0">
              <img src="../../assets/img/currentStatus/status2.png" alt="status0" v-else-if="maskRate === 2">
              <img src="../../assets/img/currentStatus/status3.png" alt="status0" v-else-if="maskRate === 3">
            </div>
            <div class="current-info-content">
              <img src="@/assets/img/currentStatus/maskPerson.svg" alt="maskPerson">
              <span>佩戴口罩人数</span>
              <span>{{ captureInfo.acmask_count }}</span>
            </div>
            <div class="current-info-content">
              <img src="@/assets/img/currentStatus/unMaskPerson.svg" alt="unMaskPerson">
              <span>未佩戴口罩人数</span>
              <span>{{ captureInfo.acunmask_count }}</span>
            </div>
          </div>
        </a-card>
        <a-card>
          <template #title>
            <div class="card-title">
              <img src="@/assets/img/currentStatus/dutyInfo.svg" alt="dutyInfo">
              <span>现在天气</span>
            </div>
          </template>
          <div class="duty-layout">
            <div class="duty-info">
              <div class="duty-info-title">
                <img src="@/assets/img/currentStatus/nextDutyPerson.svg" alt="nextDutyPerson">
                <span>当前天气</span>
              </div>
              <div class="duty-info-content">{{ weatherInfo.temperature }} ℃ | {{ weatherInfo.text }}</div>
            </div>
            <div class="duty-info">
              <div class="duty-info-title">
                <img src="@/assets/img/currentStatus/nextDutyTime.svg" alt="nextDutyTime">
                <span>天气更新时间</span>
              </div>
              <div class="duty-info-content">{{ dayjs(weatherInfo.obs_time).format("YY-MM-DD HH:mm:ss") }}</div>
            </div>
          </div>
        </a-card>
      </div>
    </div>
    <div class="chart-status">
      <a-card class="mask-rate">
        <template #title>
          <div class="card-title">
            <img src="@/assets/img/currentStatus/pieChart.svg" alt="pieChart">
            <span>1小时佩戴比率</span>
          </div>
        </template>
        <v-chart :option="pieChart" :autoresize="true"/>
      </a-card>
      <a-card class="previous-rate">
        <template #title>
          <div class="card-title">
            <img src="@/assets/img/currentStatus/latelyIdentifyRate.svg" alt="pieChart">
            <span>1小时佩戴比率</span>
          </div>
        </template>
        <v-chart :option="lineChart" :autoresize="true"/>
      </a-card>
    </div>
  </div>
  <div class="loading" v-else>
    <a-spin :tip="spinText"/>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, reactive, ref, provide, onUnmounted, computed } from "vue";
import dayjs from "dayjs";
import { TitleComponent, TooltipComponent, GridComponent } from "echarts/components";
import { PieChart, LineChart } from "echarts/charts";
import { CanvasRenderer } from "echarts/renderers";
import { LabelLayout } from "echarts/features";
import { use } from "echarts/core";
import VChart, { THEME_KEY } from "vue-echarts";
import xhr, { baseURL } from "@/xhr";

type captureInfo = {
  id: number
  img_path: string
  img_file_name: string
  update_time: string
}

interface Capture {
  id: number;
  img_path: string;
  img_file_name: string;
  acmask_count: number;
  acunmask_count: number;
  update_time: string;
}

interface OneHourInfo {
  oneHourIdentityCount: number;
  oneHourMaskedCount: number;
}

interface RecognitionInfo {
  id: number;
  total_recognition_count: number;
  no_wearing_mask_count: number;
  wearing_mask_count: number;
  update_time: string;
}

interface WeatherInfo {
  country_name: string;
  id: number
  obs_time: string;
  temperature: number
  text: string
}

interface Data {
  capture: Capture;
  oneHourInfo: OneHourInfo;
  recognitionInfo: RecognitionInfo;
  weatherInfo: WeatherInfo
  serviceType: boolean;
}

interface wsCaptureObject {
  data: Data;
  type: string;
}

interface wsPingObject {
  time: string;
  type: string;
}


const time = ref(dayjs().format("YYYY-MM-DD HH:mm:ss"))
const captureInfo = reactive<Capture>({} as Capture)
const weatherInfo = reactive<WeatherInfo>({} as WeatherInfo)
const recognitionInfo = reactive<RecognitionInfo>({} as RecognitionInfo)
const captureStatus = ref(false)
const spinText = ref("正在加载，请稍等...")
let timeInterval: number
// 饼图
use(
  [TitleComponent, TooltipComponent, PieChart, CanvasRenderer, LabelLayout, GridComponent, LineChart]
);
provide(THEME_KEY, "light");
const pieChart = ref({
  backgroundColor: "",
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      name: 'Access From',
      type: 'pie',
      center: ["50%", "50%"],
      data: [
        {value: 0, name: '佩戴口罩人数'},
        {value: 0, name: '未佩戴口罩人数'}
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

const lineChart = reactive({
  grid: {
    x: 70,
    y: 30,
    x2: 30,
    y2: 30
  },
  tooltip: {
    trigger: 'axis',
    formatter(params: any) {
      let relVal = params[0].name
      for (let i = 0, l = params.length; i < l; i++) {
        relVal += '<br/>' + params[i].marker + (params[i].value * 100).toFixed(2) + '%'
      }
      return relVal
    }
  },
  xAxis: {
    type: 'category',
    data: [] as string[],
    axisTick: {
      show: false
    },
    axisLabel: {
      interval: 500,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter(value: number) {
        return (value * 100) + "%"
      }
    }
  },
  series: [
    {
      symbol: "none",
      data: [] as number[],
      type: 'line',
      lineStyle: {
        color: "#67e667"
      }
    }
  ]
})


let ws: WebSocket


const maskRate = computed(() => {
  // console.log(captureInfo.acmask_count / (captureInfo.acmask_count + captureInfo.acunmask_count))
  // console.log(captureInfo.acmask_count, captureInfo.acunmask_count + captureInfo.acmask_count)
  if (captureInfo.acmask_count >= 0 && captureInfo.acunmask_count === 0) {
    return 0
  } else if (captureInfo.acmask_count === 0 && captureInfo.acunmask_count >= 0) {
    return 3
  } else if (captureInfo.acmask_count / (captureInfo.acmask_count + captureInfo.acunmask_count) < 0.5) {
    return 3
  } else if (captureInfo.acmask_count / (captureInfo.acmask_count + captureInfo.acunmask_count) >= 0.5){
    return 2
  }
})

onMounted(async () => {
  ws = connectWs(captureInfo)
  timeInterval = setInterval(() => {
    time.value = dayjs().format("YYYY-MM-DD HH:mm:ss")
  }, 1000)

  const oneHourMaskRateList = await xhr.post("/public/getOneHourMaskRateList")
  if (oneHourMaskRateList.data.code === 0) {
    for (let i = 0; i < oneHourMaskRateList.data.data.length; i++) {
      lineChart.series[0].data.push(oneHourMaskRateList.data.data[i].mask_rate)
      lineChart.xAxis.data.push(dayjs(oneHourMaskRateList.data.data[i].time).format("HH:mm"))
    }
  }
})
onUnmounted(() => {
  ws.close()
  captureStatus.value = false
  clearInterval(timeInterval)
})


function connectWs(captureInfo: Capture) {
  const ws = new WebSocket(`wss://api.qtxd.xyz/mis/public/getCaptureNow`);

  let wsPingTime = dayjs().unix()
  let wsPingInterval: number
  let wsConnectCheck: number

  ws.onopen = () => {
    console.log('WebSocket connected');

    clearInterval(wsPingInterval)
    clearInterval(wsConnectCheck)

    wsPingInterval = setInterval(() => {
      ws.send('ping')
    }, 3000)

    wsConnectCheck = setInterval(() => {
      // 10秒内未收到pong消息，重连
      if (dayjs().unix() - wsPingTime > 10) {
        console.log('WebSocket reconnecting');
        ws.close();
        setTimeout(function () {
          connectWs(captureInfo)
        }, 1000)
      }
    }, 1000)
  };
  ws.onmessage = (event) => {
    const message: wsCaptureObject | wsPingObject = JSON.parse(event.data)
    switch (message.type) {
      case "pong":
        wsPingTime = dayjs().unix();
        break;
      case "capture":
        const msg = message as wsCaptureObject
        if (msg.data.serviceType) {
          captureStatus.value = true
          spinText.value = "正在加载，请稍等..."
        } else {
          captureStatus.value = false
          spinText.value = "设备离线，请检查设备"
        }

        // 实时照片信息
        captureInfo.id = msg.data.capture.id
        captureInfo.img_path = msg.data.capture.img_path
        captureInfo.img_file_name = msg.data.capture.img_file_name
        captureInfo.acmask_count = msg.data.capture.acmask_count
        captureInfo.acunmask_count = msg.data.capture.acunmask_count

        captureInfo.update_time = msg.data.capture.update_time

        // 一小时识别信息
        pieChart.value.series[0].data[0].value = msg.data.oneHourInfo.oneHourIdentityCount
        pieChart.value.series[0].data[1].value = msg.data.oneHourInfo.oneHourIdentityCount - msg.data.oneHourInfo.oneHourMaskedCount

        // 累计识别信息
        recognitionInfo.id = msg.data.recognitionInfo.id
        recognitionInfo.total_recognition_count = msg.data.recognitionInfo.total_recognition_count
        recognitionInfo.no_wearing_mask_count = msg.data.recognitionInfo.no_wearing_mask_count
        recognitionInfo.wearing_mask_count = msg.data.recognitionInfo.wearing_mask_count
        recognitionInfo.update_time = msg.data.recognitionInfo.update_time


        // 推送新信息到折线图
        if (msg.data.oneHourInfo.oneHourMaskedCount === 0) {
          lineChart.series[0].data.push(0)
        } else {
          lineChart.series[0].data.push(msg.data.oneHourInfo.oneHourMaskedCount / msg.data.oneHourInfo.oneHourIdentityCount)
        }
        lineChart.xAxis.data.push(dayjs().format("HH:mm"))
        // 从data头部删除一个数据
        lineChart.series[0].data.shift()
        lineChart.xAxis.data.shift()


        // 推送天气信息
        weatherInfo.temperature = msg.data.weatherInfo.temperature
        weatherInfo.text = msg.data.weatherInfo.text
        weatherInfo.obs_time = msg.data.weatherInfo.obs_time
        break;
    }
  };
  ws.onclose = () => {
    console.log('WebSocket disconnected');
    clearInterval(wsPingInterval)
    clearInterval(wsConnectCheck)
  };
  ws.onerror = (error) => {
    console.log(`WebSocket error: ${error}`);
  };
  return ws;
}


</script>
<style lang="less" scoped>
:deep(.arco-card-header) {
  border: 0;
}

:deep(.arco-card-body) {
  height: calc(100% - 46px);
}

.current-status {
  max-width: 1440px;
  margin: 0 auto;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 20px;

  .content-layout {
    display: grid;
    gap: 10px;
    grid-template-columns: minmax(600px, 50%) 1fr;

    .content-left {

      flex-basis: 768px;
      width: 100%;


      .capture-img {
        height: 100%;
        width: 100%;
        max-width: 875px;
        display: flex;
        justify-content: center;
        align-items: center;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
    }

    .content-right {
      flex-basis: 39%;
      display: flex;
      flex-direction: column;

      .current-time {
        text-align: center;
        font-size: 30px;
        margin: 10px 0;
      }

      .rows {
        flex: 1;
        display: flex;
        flex-direction: column;

        .row {
          flex: 1;
          display: flex;
          justify-content: space-between;
          align-items: center;

          .row-title {
            font-size: 20px;
          }

          .row-content {
            font-size: 20px;
          }
        }
      }
    }
  }

  .current-info {
    flex-basis: 45%;
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 10px;

    .current-info-card {
      display: grid;
      grid-template-columns: 150px 1fr;
      grid-template-rows: 1fr 1fr;
      grid-auto-flow: row;
      gap: 10px;

      .current-info-status {
        grid-row-start: 1;
        grid-row-end: 3;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        background-color: #F4F6F9;
        width: 150px;
        padding: 10px;

        img {
          width: 100%;
        }
      }

      .current-info-content {
        background-color: #F4F6F9;
        padding: 10px 20px;
        display: grid;
        grid-template-columns: 20px 1fr 1fr;
        align-items: center;
        gap: 10px;

        img {
          width: 25px;
        }

        span:last-child {
          text-align: right;
        }
      }
    }

    .duty-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      height: 100%;

      .duty-info {
        padding: 10px 20px;
        color: var(--color-text-2);
        background-color: #F4F6F9;
        display: flex;
        flex-direction: column;
        height: 100%;

        .duty-info-title {
          height: 30px;
          display: flex;
          align-items: center;
          font-size: 14px;

          img {
            width: 25px;
            margin-right: 5px;
          }
        }

        .duty-info-content {
          text-align: center;
          flex: 1;
          display: grid;
          place-items: center;
          font-size: 24px;
        }
      }
    }
  }

  .chart-status {
    margin-top: 10px;
    display: grid;
    gap: 10px;
    grid-template-columns: 4fr 6fr;
    min-height: 330px;
  }
}

.loading {
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
