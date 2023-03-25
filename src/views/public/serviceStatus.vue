<template>
  <div v-if="!pageLoadingStatus">
    <div class="banner">
      <div class="header-inner">
        <div class="title">平台服务</div>
        <div class="sub-title">设备服务状态</div>
      </div>
    </div>
    <div class="status-content">
      <a-card>
        <template #title>
          <div class="card-title">
            <img src="@/assets/img/serviceStatus/deviceStatus.svg" alt="">
            <span>设备状态</span>
          </div>
        </template>
        <div class="status-layout">
          <div class="left-item">
            <div class="service-item" v-if="deviceInfo.serviceWorkingStatus">
              <img src="@/assets/img/serviceStatus/serviceOnline.svg" alt="serviceOnline">
              <div class="status-text">
                <img src="@/assets/img/serviceStatus/serviceOnlineSmall.svg" alt="serviceOnlineSmall">
                <span>设备在线</span>
              </div>
            </div>
            <div class="service-item" v-else>
              <img src="@/assets/img/serviceStatus/serviceOffline.svg" alt="serviceOnline">
              <div class="status-text">
                <img src="@/assets/img/serviceStatus/serviceOfflineSmall.svg" alt="serviceOnlineSmall">
                <span>设备离线</span>
              </div>
            </div>
          </div>
          <div class="online-content">
            <div class="online-content-title">
              <img src="@/assets/img/serviceStatus/updateTime.svg" alt="updateTime">
              <span>更新时间</span>
            </div>
            <div class="online-content-info">
              {{ deviceInfo.statusUpdateTime }}
            </div>
          </div>
          <div class="online-content">
            <div class="online-content-title">
              <img src="@/assets/img/serviceStatus/lastOfflineTime.svg" alt="lastOfflineTime">
              <span v-if="deviceInfo.serviceWorkingStatus">设备连接时间</span>
              <span v-else>设备离线时间</span>
            </div>
            <div class="online-content-info">
              {{ deviceInfo.lastOfflineTime }}
            </div>
          </div>
        </div>
      </a-card>
      <a-card>
        <template #title>
          <div class="card-title">
            <img src="@/assets/img/serviceStatus/currentLatency.svg" alt="currentLatency">
            <span>实时延迟</span>
          </div>
        </template>
        <v-chart style="height: 100%" :option="visualChartOption" :autoresize="true"></v-chart>
      </a-card>
    </div>
  </div>
  <div class="loading" v-else>
    <a-spin tip="正在加载，请稍等..."/>
  </div>
</template>
<script lang="ts" setup>
import VChart, { THEME_KEY } from "vue-echarts";
import { GridComponent, TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { use } from "echarts/core";
import { provide, reactive, ref } from "vue";
import xhr from "@/xhr";
import dayjs from "dayjs";
import { Message } from "@arco-design/web-vue";

provide(THEME_KEY, "light");

use([GridComponent, TooltipComponent, LineChart, CanvasRenderer, UniversalTransition]);

const visualChartOption = reactive({
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
        if (typeof params[i].value !== 'number') {
          relVal += '<br/>' + "设备离线"
        } else {
          relVal += '<br/>' + params[i].marker + params[i].value + 'ms'
        }
      }
      return relVal
    }
  },
  xAxis: {
    type: 'category',
    axisTick: {
      show: false
    },
    axisLabel: {
      interval: 5,
    },
    data: [] as string[]
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      formatter: "{value} ms"
    }
  },
  series: [
    {
      symbol: "none",
      data: [] as (number | null)[],
      type: 'line',
      lineStyle: {
        color: {
          type: "linear",
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: "#FF4040"
            },
            {
              offset: 1,
              color: "#67E667"
            },
          ]
        }
      }
    }
  ]
})


const deviceInfo = reactive({
  lastOfflineTime: "",
  serviceWorkingStatus: false,
  statusUpdateTime: ""
})

const pageLoadingStatus = ref(true)

async function init() {
  try {
    // 获取设备信息
    const deviceInfoResponse = await xhr.post("/public/getDeviceInfoNow")
    if (deviceInfoResponse.data.code === 0) {
      const response = deviceInfoResponse.data.data
      deviceInfo.lastOfflineTime = dayjs(response.lastOfflineTime).format("YYYY-MM-DD HH:mm:ss")
      deviceInfo.serviceWorkingStatus = response.serviceWorkingStatus
      deviceInfo.statusUpdateTime = dayjs(response.statusUpdateTime).format("YYYY-MM-DD HH:mm:ss")
    } else {
      throw new Error("获取设备信息失败")
    }
    //  获取服务信息
    const serviceInfoResponse = await xhr.post("/public/getServiceInfo")
    if (serviceInfoResponse.data.code === 0) {
      for (let i = 0; i < serviceInfoResponse.data.data.length; i++) {
        // 设备状态0为离线，延迟大于5秒为离线
        if (serviceInfoResponse.data.data[i].device_online_type === 0 || serviceInfoResponse.data.data[i].device_latency <= 5) {
          visualChartOption.series[0].data.unshift(null)
        } else {
          visualChartOption.series[0].data.unshift(serviceInfoResponse.data.data[i].device_latency as number)
        }
        visualChartOption.xAxis!.data.unshift(dayjs(serviceInfoResponse.data.data[i].update_time).format("HH:mm"))
      }
    } else {
      throw new Error("获取服务信息失败")
    }
    pageLoadingStatus.value = false
  } catch (e) {
    Message.error("获取信息失败，请稍后重试！")
  }
}
init()


</script>
<style lang="less" scoped>
:deep(.arco-card-header) {
  border: 0;
}

:deep(.arco-card-body) {
  height: calc(100% - 46px);
}

.banner {
  height: 300px;
  background-color: #fefefe;
  color: #212121;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;

  .header-inner {
    height: 300px;
    max-width: 1440px;
    padding-left: 20px;
    padding-right: 20px;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;

    .title {
      font-size: 40px;
      font-weight: bold;
      margin-bottom: 20px;
    }

    .sub-title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 20px;
    }
  }
}

.status-content {
  max-width: 1440px;
  padding-left: 20px;
  padding-right: 20px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  height: 400px;

  .status-layout {
    height: 100%;
    display: grid;
    gap: 10px;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr;

    & > div {
      background-color: #F4F6F9;
      padding: 20px;
    }

    .left-item {
      grid-row-start: 1;
      grid-row-end: 3;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .service-item {
        img {
          width: 75%;
        }

        .status-text {
          margin-top: 30px;
          font-size: 20px;
          padding-right: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;

          img {
            height: 20px;
            width: 20px;
            margin-right: 5px;
            transform: translateY(2px);
          }
        }
      }
    }
    .online-content {
      display: flex;
      flex-direction: column;
      &-title {
        display: flex;
        align-items: center;
        img {
          height: 25px;
          margin-right: 5px;
        }
      }
      &-info {
        flex: 1;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    }
  }
}

.loading {
  height: calc(100vh - 60px);
  display: flex;
  justify-content: center;
  align-items: center;
}

</style>
