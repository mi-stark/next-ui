<template>
  <form class="msk-form">
    <slot/>
  </form>
</template>

<script lang="tsx">
import {ref, provide, toRefs, reactive, getCurrentInstance, computed} from "vue";
import {isFunction} from "@utils/shared";
import {loopSubTree} from "@utils/emitter";
import {FormItemCtx, FormKey} from "@component/form/form";

export default {
  name: "msk-form",
  props: {
    model: Object,
    rules: Object,
    labelSuffix: {type: String, default: ''},
    labelWidth: [String, Number],
    showMessage: {type: Boolean, default: true},
    inlineMessage: Boolean,
    disabled: Boolean,
  },
  emits: ['validate'],
  setup(props: Record<string, any>, ctx: Record<string, any>){

    const fieldList = ref<FormItemCtx[]>([]);
    let seed: number = 0;

    function addField(item: FormItemCtx){
      fieldList.value.push(item);
      seed++;
    }

    function removeField(item: FormItemCtx){
      fieldList.value = fieldList.value.filter(t => t!==item);
    }

    const instance = getCurrentInstance();
    function sortFields(){
      let pool: Record<string, FormItemCtx> = {};
      let count = fieldList.value.length;
      const list:FormItemCtx[]  = [];
      fieldList.value.forEach(t => pool[t.uid]=t);
      loopSubTree(instance?.subTree, (component: Record<string, any>)=> {
        if(!pool[component.uid]) return true;
        list.push(pool[component.uid]);
        return --count>0;
      });
      fieldList.value = list;
      seed = 0;
    }

    async function validate(callback: Function){
      if(seed>0) sortFields();
      let valid = false;
      try {
        await Promise.all(fieldList.value.map(item => item.validate()))
        valid = true;
      }catch (e: any){
        console.error(e.message)
      }finally {
        isFunction(callback) && callback(valid);
      }
      return valid;
    }

    function clearValidate(){
      fieldList.value.forEach(item => item.clearValidate());
    }

    const sharedLabelWidths: Record<number, number> = reactive({});

    const sharedLabelMinWidth = computed(()=> {
      let width = Math.max.apply(null, Object.values(sharedLabelWidths));
      width = Math.ceil(width);
      const labelWidth = parseFloat(props.labelWidth);
      return !isNaN(labelWidth) ? Math.max(width, labelWidth) : width;
    });

    function shareLabelWidth(uid: number, width: number){
      sharedLabelWidths[uid] = width;
    }

    function unShareLabelWidth(uid: number){
      delete sharedLabelWidths[uid];
    }

    const FormCtx = reactive({
      ...toRefs(props),
      emit: ctx.emit,
      addField,
      removeField,
      sharedLabelMinWidth,
      shareLabelWidth,
      unShareLabelWidth
    });

    provide(FormKey, FormCtx);

    return {
      validate,
      clearValidate
    }
  }
}
</script>

<style lang="scss">
.msk-form {
}
.msk-form--label-left {
  .msk-form-item__label {
    text-align: left;
  }
}
.msk-form--label-top {
  .msk-form-item {
    display: block;
  }
  .msk-form-item__label {
    display: block;
    text-align: left;
    padding: 0 0 10px 0;
  }
}
.msk-form--inline {
  .msk-form-item {
    display: inline-flex;
    vertical-align: middle;
    margin-right: 10px;
  }
  &.msk-form--label-top {
    display: flex;
    flex-wrap: wrap;
    .msk-form-item {
      display: block;
    }
  }
}
</style>
