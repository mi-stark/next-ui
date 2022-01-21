<template>
  <div ref="table" class="msk-table">
    <div ref="header"
         class="msk-table__header-wrapper"
         v-mousewheel="handleHeaderMousewheel">
      <table-header :header-rows="headRows"
                    :row-syncers="headRowSyncers"
                    :width="leafsWidth"/>
    </div>
    <scrollbar class="msk-table__body-wrapper"
               :get-view="getCenterBody"
               @scroll="handleBodyScroll">
      <table-body :columns="leafs"
                  :data-syncers="dataSyncers"
                  :width="leafsWidth"/>
    </scrollbar>
    <div v-if="leafsLeft.length" :class="leftFixedClass">
      <div class="msk-table__header-wrapper">
        <table-header fixed="left"
                      :header-rows="headLeftRows"
                      :row-syncers="headRowSyncers"
                      :width="leafsLeftWidth"/>
      </div>
      <div ref="leftBody"
           class="msk-table__body-wrapper"
           v-mousewheel="handleFixedBodyMousewheel">
        <table-body fixed="left"
                    :columns="leafsLeft"
                    :data-syncers="dataSyncers"
                    :width="leafsLeftWidth"/>
      </div>
    </div>
    <div v-if="leafsRight.length" :class="rightFixedClass">
      <div class="msk-table__header-wrapper">
        <table-header fixed="right"
                      :header-rows="headRightRows"
                      :row-syncers="headRowSyncers"
                      :width="leafsRightWidth"/>
      </div>
      <div ref="rightBody"
           class="msk-table__body-wrapper"
           v-mousewheel="handleFixedBodyMousewheel">
        <table-body fixed="right"
                    :columns="leafsRight"
                    :data-syncers="dataSyncers"
                    :width="leafsRightWidth"/>
      </div>
    </div>
    <div class="msk-table_col-resizer" :style="colResizerStyle"></div>
  </div>
</template>

<script lang="tsx">
import {ref, watch, onMounted, computed, onBeforeUnmount, provide} from "vue";
import Mousewheel from "@/directives/mousewheel";
import {useMouseScroll} from "@utils/mouse";
import {ColumnConfig, extractColumns, TableKey, updateLeafWidth} from "@component/table/table";
import {createRowSyncer} from "@component/table/row-syncer";
import TableHeader from "@component/table/table-header.vue";
import TableBody from "@component/table/table-body.vue";
import Scrollbar from "@component/scrollbar/scrollbar.vue";
import {useEventListener, useResizeObserver} from "@vueuse/core";
export default {
  name: "msk-table",
  props: {
    columns: Array,
    data: Array
  },
  components: {TableHeader, TableBody, Scrollbar},
  directives: {Mousewheel},
  setup(props: Record<string, any>, ctx: Record<string, any>){

    const table = ref<HTMLElement>();
    const header = ref<HTMLElement>();
    const centerBody = ref<HTMLElement>();
    const leftBody = ref<HTMLElement>();
    const rightBody = ref<HTMLElement>();
    const headRows = ref<ColumnConfig[][]>([]);
    const headLeftRows = ref<ColumnConfig[][]>([]);
    const headRightRows = ref<ColumnConfig[][]>([]);
    const headRowSyncers = ref<any[]>([]);
    const leafs = ref<ColumnConfig[]>([]);
    const leafsLeft = ref<ColumnConfig[]>([]);
    const leafsRight = ref<ColumnConfig[]>([]);
    const scrollX = ref(0);
    const scrollY = ref(0);
    const tableWidth = ref(0);
    const tableScrollWidth = ref(0);
    const colResizerVisible = ref(false);
    const colResizerLeft = ref(0);

    function getCenterBody(el: HTMLElement) {
      centerBody.value = el;
      if(!el) return;
      tableWidth.value = el.offsetWidth;
      tableScrollWidth.value = el.scrollWidth;
    }

    const leftFixedClass = computed(()=> ({
      'msk-table__fixed-left': true,
      'msk-table__fixed-shadow': scrollX.value > 0
    }));

    const rightFixedClass = computed(()=> ({
      'msk-table__fixed-right': true,
      'msk-table__fixed-shadow': scrollX.value + tableWidth.value < tableScrollWidth.value
    }));

    const colResizerStyle = computed(()=> ({
      display: colResizerVisible.value ? '' : 'none',
      left: `${colResizerLeft.value}px`
    }));

    function calcWidth(cols: ColumnConfig[]){
      return cols.reduce((a:number, b:ColumnConfig)=> a+b.width, 0);
    }
    const leafsWidth = computed(()=> calcWidth(leafs.value));
    const leafsLeftWidth = computed(()=> calcWidth(leafsLeft.value));
    const leafsRightWidth = computed(()=> calcWidth(leafsRight.value));
    const dataSyncers = computed(()=> props.data?.map((row:any) => createRowSyncer(row)));

    function parseColumns(){
      const ret = extractColumns(props.columns);
      updateLeafWidth(ret.leafs, table.value?.clientWidth || 0);
      headRowSyncers.value = ret.hdCenter.map((t,i)=> createRowSyncer(i));
      headRows.value = ret.hdCenter;
      headLeftRows.value = ret.hdLeft;
      headRightRows.value = ret.hdRight;
      leafs.value = ret.leafs;
      leafsLeft.value = ret.leafsLeft;
      leafsRight.value = ret.leafsRight;
    }

    function handleBodyScroll(e: Event){
      if(!e || !e.currentTarget) return;
      const el = e.currentTarget as HTMLElement;
      scrollX.value = el.scrollLeft;
      scrollY.value = el.scrollTop;
      header.value && (header.value.scrollLeft = el.scrollLeft);
      leftBody.value && (leftBody.value.scrollTop = el.scrollTop);
      rightBody.value && (rightBody.value.scrollTop = el.scrollTop);
    }

    function handleHeaderMousewheel(e: WheelEvent){
      if(!centerBody.value) return;
      useMouseScroll(e, centerBody.value, true);
    }

    function handleFixedBodyMousewheel(e: WheelEvent){
      if(!centerBody.value) return;
      useMouseScroll(e, centerBody.value);
    }

    watch(()=> props.columns, ()=> parseColumns());

    let stopResizeObserver: Function;
    let stopResizeListener: Function;

    function onResize(){
      if(!table.value) return;
      updateLeafWidth(leafs.value, table.value.clientWidth);
    }

    onMounted(()=> {
      ({stop: stopResizeObserver} = useResizeObserver(table, onResize));
      stopResizeListener = useEventListener('resize', onResize);
      parseColumns();
    });

    onBeforeUnmount(()=>{
      stopResizeListener();
      stopResizeObserver();
    });

    provide(TableKey, {
      updateColResizer: (visible: boolean, left: number) => {
        if (!table.value) return;
        const rect = table.value?.getBoundingClientRect();
        colResizerVisible.value = visible;
        colResizerLeft.value = left - rect.left;
        onResize();
      }
    })

    return {
      table,
      header,
      getCenterBody,
      leftBody,
      rightBody,
      headRows,
      headLeftRows,
      headRightRows,
      headRowSyncers,
      leftFixedClass,
      rightFixedClass,
      leafs,
      leafsLeft,
      leafsRight,
      leafsWidth,
      leafsLeftWidth,
      leafsRightWidth,
      dataSyncers,
      colResizerStyle,
      handleBodyScroll,
      handleHeaderMousewheel,
      handleFixedBodyMousewheel
    }
  }
}
</script>

<style lang="scss">
.msk-table {
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  height: fit-content;
  width: 100%;
  max-width: 100%;
  font-size: 14px;
  color: get-color(regular);
  display: flex;
  flex-direction: column;
  &:hover {
    .msk-scrollbar__ybar,
    .msk-scrollbar__xbar{
      opacity: 1;
    }
  }
  thead th{
    color: get-color(regular);
    font-weight: 500;
  }
  .msk-table__column {
    min-width: 0;
    box-sizing: border-box;
    text-overflow: ellipsis;
    vertical-align: middle;
    position: relative;
    text-align: left;
    border-bottom: 1px solid get-color(border);
    &.is-center {
      text-align: center;
    }
    &.is-right {
      text-align: right;
    }
    &.gutter {
      width: 15px;
      border-right-width: 0;
      border-bottom-width: 0;
      padding: 0;
    }
    &.is-hidden {
      & > * {
        visibility: hidden;
      }
    }
  }
  .msk-table__cell {
    box-sizing: border-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-all;
    padding-left: 10px;
    padding-right: 10px;
    line-height: 3;

    &.msk-tooltip {
      white-space: nowrap;
      min-width: 50px;
    }
  }
  .msk-table__syncer{
    visibility: hidden;
    .msk-table__cell{
      padding-left: 0!important;
      padding-right: 0!important;
    }
  }
  .msk-table__header-wrapper{
    position: relative;
    overflow: hidden;
  }
  .msk-table__body-wrapper{
    position: relative;
    overflow: hidden;
    flex: 1;
  }
  .msk-table__fixed-left{
    position: absolute;
    left: 0;
    top: 0;
    background-color: #fff;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .msk-table__fixed-right{
    position: absolute;
    right: 0;
    top: 0;
    background-color: #fff;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .msk-table__fixed-shadow{
    box-shadow: get-var(fixed-box-shadow);
  }
  .msk-table_col-resizer{
    position: absolute;
    top: 0;
    height: 100%;
    width: 0;
    border-right: 1px dashed get-color(border);
  }
}
</style>
