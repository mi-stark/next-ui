<template>
  <div style="margin: 20px;position: relative">
    <msk-table :columns="columns" :data="data" style="height: 400px;"/>
  </div>
</template>

<script lang="tsx">

import {ref, h} from "vue";

export default {
  name: "test",
  setup(){
    const text = ref('dddd')
    const columns =  [
      { label: '支行名称', field: 'branchName' },
      { label: '支行名称', field: 'branchName' },
      { label: '支行名称', field: 'branchName' },
      { label: '支行名称', field: 'branchName' },
      { label: '签约状态', field: 'signStatusName' },
      { label: '在职状态', field: 'jobStatusName', fixed: 'right'},
      { label: '在职状态', field: 'jobStatusName', fixed: 'right'},
      { label: '在职状态', field: 'jobStatusName', fixed: 'right'},
    ];

    const row: Record<string, any> = {};
    columns.forEach(col => row[col.field] = col.label)

    const seed = ref<number>(0)
    return {
      seed,
      columns,
      text,
      data: new Array(100).fill(row)
    }
  }
}
</script>

<style scoped lang="scss">
.panel{
  padding: 20px 0;
  color: get-color(primary);
}
.msk-button + .msk-button{
  margin-left: 20px;
}
</style>
