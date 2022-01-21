<template>
  <div :class="{'msk-scrollbar': true, 'is-draging': isDraging}">
    <div :ref="setView"
         class="msk-scrollbar__view"
         @scroll="handleScroll">
      <div ref="wrap" class="msk-scrollbar__wrap">
        <slot></slot>
      </div>
    </div>
    <div ref="ybar"
         v-show="isOverflowY"
         class="msk-scrollbar__ybar"
         @mousedown="yBarClick">
      <div class="msk-scrollbar__thumb"
           @mousedown="yThumbClick"
           :style="yThumbStyle"></div>
    </div>
    <div ref="xbar"
         v-show="isOverflowX"
         class="msk-scrollbar__xbar"
         @mousedown="xBarClick">
      <div class="msk-scrollbar__thumb"
           @mousedown="xThumbClick"
           :style="xThumbStyle"></div>
    </div>
  </div>
</template>

<script lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from "vue";
import {useResizeObserver, useEventListener} from "@vueuse/core";
import {isFunction} from "@utils/shared";
import {useMouseDrag} from "@utils/mouse";

export default {
  name: "scrollbar",
  props: {
    minSize: {type: [Number, String], default: 20},
    getView: Function,
    content: [Object, String]
  },
  setup(props: Record<string, any>, ctx: Record<string, any>){

    const view = ref<HTMLElement>();
    const wrap = ref<HTMLElement>();
    const ybar = ref<HTMLElement>();
    const xbar = ref<HTMLElement>();
    const isOverflowX = ref(false);
    const isOverflowY = ref(false);
    const moveX = ref(0);
    const moveY = ref(0);
    const ratioY = ref(1);
    const ratioX = ref(1);
    const isDraging = ref(false);

    const ySize = ref(0);
    const xSize = ref(0);
    const GAP = 4;

    function setView(el: HTMLElement){
      view.value = el;
      if(isFunction(props.getView)){
        props.getView(el);
      }
    }

    const yThumbStyle = computed(()=> {
      return {
        height: `${ySize.value}px`,
        transform: `translateY(${moveY.value}%)`,
      }
    });

    const xThumbStyle = computed(()=> {
      return {
        width: `${xSize.value}px`,
        transform: `translateX(${moveX.value}%)`
      }
    });

    function handleScroll(e: Event){
      const el = e.target as HTMLElement;
      if(!el) return;
      const offsetHeight = el.offsetHeight - GAP;
      const offsetWidth = el.offsetWidth - GAP;

      moveY.value = ((el.scrollTop * 100) / offsetHeight) * ratioY.value;
      moveX.value = ((el.scrollLeft * 100) / offsetWidth) * ratioX.value;
      ctx.emit('scroll', e);
    }

    function update(){
      const el = view.value;
      if(!el) return;

      isOverflowX.value = el.scrollWidth > el.offsetWidth;
      isOverflowY.value = el.scrollHeight > el.offsetHeight;

      const offsetHeight = el.offsetHeight - GAP
      const offsetWidth = el.offsetWidth - GAP

      const originalHeight = offsetHeight ** 2 / el.scrollHeight
      const originalWidth = offsetWidth ** 2 / el.scrollWidth
      const height = Math.max(originalHeight, props.minSize)
      const width = Math.max(originalWidth, props.minSize)

      ratioY.value =
          originalHeight /
          (offsetHeight - originalHeight) /
          (height / (offsetHeight - height));

      ratioX.value =
          originalWidth /
          (offsetWidth - originalWidth) /
          (width / (offsetWidth - width));

      ySize.value = height + GAP < offsetHeight ? height : 0;
      xSize.value = width + GAP < offsetWidth ? width : 0;
    }

    function getHorizontalOffsetRatio(){
      if(!xbar.value || !view.value) return 0;
      return xbar.value.offsetWidth ** 2
      / view.value.scrollWidth
      / ratioX.value
      / xSize.value;
    }

    function getVerticalOffsetRatio(){
      if(!ybar.value || !view.value) return 0;
      return ybar.value.offsetHeight ** 2
          / view.value.scrollHeight
          / ratioY.value
          / ySize.value;
    }

    function yBarClick(e: MouseEvent){
      if(!view.value || !ybar.value) return;
      const el = e.target as HTMLElement;
      const offset = Math.abs(el.getBoundingClientRect().top - e.clientY);
      const thumbHalf = ySize.value / 2;
      const offsetRatio = getVerticalOffsetRatio();
      const percent =
          ((offset - thumbHalf) * 100 * offsetRatio)
          / ybar.value.offsetHeight;
      view.value.scrollTop = percent * view.value.scrollHeight /100;
    }

    function xBarClick(e: MouseEvent){
      if(!view.value || !xbar.value) return;
      const el = e.target as HTMLElement;
      const offset = Math.abs(el.getBoundingClientRect().left - e.clientX);
      const thumbHalf = xSize.value / 2;
      const offsetRatio = getHorizontalOffsetRatio();
      const percent =
          ((offset - thumbHalf) * 100 * offsetRatio)
          / xbar.value.offsetWidth;
      view.value.scrollLeft = percent * view.value.scrollWidth /100;
    }

    function yThumbClick(e: MouseEvent){
      e.stopImmediatePropagation();
      if(!view.value || !ybar.value) return;
      const viewEl = view.value;
      const el = e.currentTarget as HTMLDivElement;
      const bar = ybar.value;
      const startPos = el.offsetHeight - e.clientY + el.getBoundingClientRect().top;
      isDraging.value = true;
      useMouseDrag(
          e => {
            const offset = (bar.getBoundingClientRect().top - e.clientY) * -1;
            const clickPos = ySize.value - startPos;
            const offsetRatio = getVerticalOffsetRatio();
            const percent = ((offset - clickPos) * 100 * offsetRatio) / bar.offsetHeight;
            viewEl.scrollTop = percent * viewEl.scrollHeight /100;
          },
          ()=> isDraging.value = false
      );
    }

    function xThumbClick(e: MouseEvent){
      e.stopImmediatePropagation();
      if(!view.value || !xbar.value) return;
      const viewEl = view.value;
      const el = e.currentTarget as HTMLDivElement;
      const bar = xbar.value;
      const startPos = el.offsetWidth - e.clientX + el.getBoundingClientRect().left;
      isDraging.value = true;
      useMouseDrag(
          e => {
            const offset = (bar.getBoundingClientRect().left - e.clientX) * -1;
            const clickPos = xSize.value - startPos;
            const offsetRatio = getHorizontalOffsetRatio();
            const percent = ((offset - clickPos) * 100 * offsetRatio) / bar.offsetWidth;
            viewEl.scrollLeft = percent * viewEl.scrollWidth /100;
          },
          ()=> isDraging.value = false
      );
    }

    let stopResizeObserver: Function;
    let stopResizeListener: Function;

    onMounted(()=> {
      ({stop: stopResizeObserver} = useResizeObserver(wrap, update));
      stopResizeListener = useEventListener('resize', update);
      nextTick(()=> update());
    });

    onBeforeUnmount(()=>{
      stopResizeListener();
      stopResizeObserver();
    });

    return {
      ybar,
      xbar,
      setView,
      wrap,
      isOverflowX,
      isOverflowY,
      yThumbStyle,
      xThumbStyle,
      isDraging,
      handleScroll,
      yBarClick,
      xBarClick,
      yThumbClick,
      xThumbClick
    }
  }
}
</script>

<style lang="scss">
.msk-scrollbar{
  overflow: hidden;
  position: relative;
  &:hover, &.is-draging{
    .msk-scrollbar__ybar,
    .msk-scrollbar__xbar{
      opacity: 1;
    }
  }
}
.msk-scrollbar__view{
  overflow: auto;
  height: 100%;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
.msk-scrollbar__wrap{
  height: fit-content;
  width: fit-content;
}
.msk-scrollbar__thumb {
  position: relative;
  display: block;
  width: 0;
  height: 0;
  cursor: pointer;
  border-radius: inherit;
  background-color: get-color(scroll-bar);
  transition: get-var(transition-duration) background-color;
  opacity: 0.3;
  &:hover {
    opacity: 0.5;
  }
}
.msk-scrollbar__ybar{
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 6px;
  top: 2px;
  border-radius: 4px;
  z-index: 1;
  opacity: 0;
  > .msk-scrollbar__thumb{
    width: 100%;
  }
}
.msk-scrollbar__xbar{
  position: absolute;
  height: 6px;
  left: 2px;
  right: 2px;
  bottom: 2px;
  z-index: 1;
  border-radius: 4px;
  opacity: 0;
  > .msk-scrollbar__thumb{
    height: 100%;
  }
}

</style>
