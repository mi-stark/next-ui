<template>
  <button :class="{
    'msk-button': true,
    [`msk-button--${type}`]: type,
    'is-outline': outline,
    'is-text': text,
    'is-block': block,
    'is-round': round,
    'is-circle': circle,
    'is-disabled': isDisabled}"
          :disabled="isDisabled"
          :autofocus="autofocus"
          @click="handleClick">
    <Icon v-if="icon" :icon="icon"/>
    <Loading v-if="loading || isLoading"/>
    <slot/>
  </button>
</template>

<script lang="tsx">
import { ref, computed, getCurrentInstance} from 'vue'
import {isArray} from "@utils/shared";
import Icon from '@component/icon/icon.vue';
import Loading from '@component/loading/loading.vue';
const MODE = {THROTTLE: 'throttle', DEBOUNCE: 'debounce'};
export default {
  name: "msk-button",
  components: {Icon, Loading},
  props: {
    type: {type: String},
    icon: String,
    block: Boolean,
    outline: Boolean,
    text: Boolean,
    round: Boolean,
    circle: Boolean,
    disabled: Boolean,
    loading: Boolean,
    delay: {type: Number, default: 500},
    mode: {type: String, default: MODE.THROTTLE},
    autofocus: Boolean
  },
  emits: ['click'],
  setup(props: Record<string, any>){

    const isLoading = ref(false);

    const isDisabled = computed(()=> {
      const disabled = props.disabled!==undefined ? props.disabled : false;
      return props.loading || isLoading.value || disabled;
    });

    const stepDelay = computed(()=> {
      const delay = parseInt(props.delay);
      return isNaN(delay) ? 0 : delay;
    });

    let ins = getCurrentInstance() as Record<string, any>;

    function triggerClick(e: any){
      if(isDisabled.value) return;
      let promises = [];
      try {
        const vnodeProps = ins?.vnode.props || {};
        let handler = vnodeProps.onClick;
        if(handler){
          promises = isArray(handler) ? (handler as Array<Function>).map(fc => fc(e)) : [handler(e)];
        }
        const onceHandler = vnodeProps.onClickOnce;
        if(onceHandler){
          !ins?.emitted && (ins.emitted = {});
          if(!ins.emitted.onClickOnce){
            ins.emitted.onClickOnce = true;
            const oncePromises = isArray(onceHandler) ? (onceHandler as Array<Function>).map(fc => fc(e)) : [onceHandler(e)];
            promises = promises.concat(oncePromises);
          }
        }
        promises = promises.filter(t => t instanceof Promise);
        if(promises.length>0){
          isLoading.value = true;
          Promise.all(promises).finally(()=> isLoading.value = false);
        }
      }catch (e){
        isLoading.value = false;
      }
    }

    let timer = 0;
    function handleClick(e: any){
      const delay = stepDelay.value;
      if(delay>0){
        if(props.mode === MODE.THROTTLE){
          if(timer) return;
          timer = setTimeout(()=> timer=0, delay);
        }else if(props.mode === MODE.DEBOUNCE){
          if(timer) clearTimeout(timer);
          timer = setTimeout(()=> triggerClick(e), delay);
          return;
        }
      }
      triggerClick(e);
    }

    return {
      isDisabled,
      isLoading,
      handleClick
    }
  }
}
</script>

<style lang="scss">
.msk-button{
  padding: 10px 12px;
  cursor: pointer;
  line-height: 1;
  font-size: 14px;
  border: 1px solid get-color(border);
  border-radius: 4px;
  background-color: #fff;
  color: get-color(regular);
  &:hover{
    border-color: get-color(primary);
    color: get-color(primary);
    opacity: 0.8;
  }
  &:active{
    opacity: 1;
  }
  &.is-round{
    border-radius: 18px;
  }
  &.is-block{
    display: block;
    width: 100%;
  }
  &.is-circle{
    border-radius: 50%;
  }
  &.is-disabled{
    cursor: not-allowed;
  }
  &.is-text{
    padding-left: 0;
    padding-right: 0;
  }
  .msk-loading{
    margin-right: 4px;
  }
}
$types: (primary,secondary,success,info,warning,danger,dark,purple,pink,brown,grey);
@each $type in $types {
  $name: "" + $type;
  .msk-button--#{$name}{
    background-color: get-color($name);
    border-color: get-color($name);
    color: #fff;
    &:hover{
      border-color: get-color($name);
      color: #fff;
    }
    &.is-outline{
      color: get-color($name);
      border-color: get-color($name);
      background-color: #fff;
      &:hover{
        background-color: get-color($name);
        border-color: get-color($name);
        color: #fff;
      }
    }
    &.is-text{
      color: get-color($name);
      border: 0;
      background-color: unset;
    }
  }
}
</style>
