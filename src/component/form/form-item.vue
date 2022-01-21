<template>
  <div :class="classList">
    <div class="msk-form-item__label-wrap" :style="labelWrapStyle">
      <label ref="label" class="msk-form-item__label" :style="labelStyle">
        <slot :labelText="labelText">{{labelText}}</slot>
      </label>
    </div>
    <div class="msk-form-item__content">
      <slot></slot>
      <transition name="zoom-in-top">
        <slot v-if="isMessageShow" name="error" :error="validateMessage">
          <div :class="{
            'msk-form-item__error': true,
            'msk-form-item__error--inline': isInlineMessage}">
            {{ validateMessage }}
          </div>
        </slot>
      </transition>
    </div>
  </div>
</template>

<script lang="tsx">
import {
  ref,
  reactive,
  toRefs,
  computed,
  watch,
  inject,
  provide,
  onMounted,
  onBeforeUnmount,
  getCurrentInstance,
  nextTick,
  onUpdated,
  CSSProperties
} from "vue";
import {undefOr, getPathValue, isFunction, isArray} from "@utils/shared";
import {FormItemCtx, FormCtx, FormRule, FormKey, FormItemKey} from "@component/form/form";
import AsyncValidator from 'async-validator';
import {Rules} from "async-validator/dist-types/interface";
export default {
  name: "msk-form-item",
  props: {
    field: String,
    label: String,
    labelWidth: [String, Number],
    showMessage: {type: Boolean, default: true},
    inlineMessage: Boolean,
    rules: [Object, Array],
    required: Boolean,
    disabled: Boolean
  },
  setup(props: Record<string, any>, ctx: Record<string, any>){

    const FormCtx = inject(FormKey, {} as FormCtx);

    function getRules(){
      let rules = isArray(props.rules) ? [].concat(props.rules) : [props.rules];
      let formRules: any = FormCtx?.rules;
      if(formRules){
        formRules = isArray(formRules)
            ? (formRules as Array<FormRule>).filter(r => r.field === props.field)
            : (formRules as Record<string, FormRule>)[props.field];
        rules = rules.concat(isArray(formRules) ? formRules : [formRules]);
      }
      props.required && (rules.push({ required: true }));
      rules = rules.filter(t => !!t);
      return rules;
    }

    const isRequired = computed(()=> getRules().find(r => r.required));

    const isDisabled = computed(()=> undefOr(props.disabled, FormCtx?.disabled));

    const validateState = ref('pp');

    const classList = computed(()=> ({
      'msk-form-item': true,
      'is-required': isRequired.value,
      'is-disabled': isDisabled.value,
      'is-error': validateState.value === 'error',
      'is-success': validateState.value === 'success'
    }));

    const labelText = computed(()=> `${props.label || ''}${FormCtx.labelSuffix || ''}`);
    const labelStyle = computed(()=> {
      const ret:CSSProperties = {};
      let width = undefOr(props.labelWidth, FormCtx.labelWidth);
      width && (ret.width = `${width}px`);
      return ret;
    });
    const labelWrapStyle = computed(()=> {
      const ret:CSSProperties = {};
      if(FormCtx?.sharedLabelMinWidth){
        ret.minWidth = `${FormCtx.sharedLabelMinWidth}px`;
      }
      return ret;
    });

    const validateMessage = ref('');
    const isMessageShow = computed(()=>{
      if(validateState.value !== 'error') return false;
      return undefOr(props.showMessage, FormCtx.showMessage);
    });
    const isInlineMessage = computed(()=> undefOr(props.inlineMessage, FormCtx.inlineMessage));

    const fieldValue = computed(()=> getPathValue(FormCtx?.model, props.field));

    function clearValidate(){
      validateState.value = '';
      validateMessage.value = '';
    }

    async function validate(trigger?:string, callback?:Function) {
      let rules = getRules();
      rules = rules.filter(r => {
        if(!trigger || !r.trigger) return true;
        return isArray(r.trigger)
            ? r.trigger.includes(trigger)
            : r.trigger === trigger;
      });
      if(!rules.length) {
        clearValidate();
        return true;
      }
      validateState.value = 'validating';
      const descriptor = {} as Rules;
      descriptor[props.field] = rules.map(r => {
        const rule = Object.assign({}, r);
        delete rule.prop;
        delete rule.trigger;
        return rule;
      });
      const validator = new AsyncValidator(descriptor)
      const model = {[props.field]: fieldValue.value};
      const {errors, fields} = await new Promise(rs => {
        validator.validate(
            model,
            { firstFields: true },
            (errors, fields)=> rs({errors, fields}))
      });
      validateState.value = !errors ? 'success' : 'error';
      validateMessage.value = errors
          ? errors[0].message || `${props.field} is required`
          : '';
      if(callback){
        callback(validateMessage.value, errors ? fields : {});
      }
      if(isFunction(FormCtx.emit)){
        FormCtx.emit('validate', props.field, !errors, validateMessage.value || null);
      }
      if(errors){
        throw new Error(validateMessage.value);
      }
      return true;
    }

    const instance = getCurrentInstance() as Record<string, any>;
    const FormCtxItem = reactive<FormItemCtx>({
      ...toRefs(props),
      emit: ctx.emit,
      validate,
      clearValidate,
      uid: instance.uid
    });

    provide(FormItemKey, FormCtxItem);

    let labelWidth = ref(0);
    watch(labelWidth, v => FormCtx?.shareLabelWidth(instance?.uid, v));
    function updateLabelWidth(){
      nextTick(()=> labelWidth.value = (instance?.refs.label as Element).scrollWidth);
    }

    onMounted(()=> {
      FormCtx?.addField(FormCtxItem);
      updateLabelWidth();
    });

    onUpdated(()=> {
      updateLabelWidth();
    })

    onBeforeUnmount(() => {
      FormCtx?.removeField(FormCtxItem);
      FormCtx?.unShareLabelWidth(instance?.uid);
    });

    return {
      classList,
      labelText,
      labelStyle,
      labelWrapStyle,
      isMessageShow,
      isInlineMessage,
      validateMessage,
      validate
    }
  }
}
</script>

<style lang="scss">
.msk-form-item {
  display: flex;
  margin-bottom: 22px;
  .msk-form-item {
    margin-bottom: 0;
  }
  .msk-input__validateIcon {
    display: none;
  }
  &.is-error {
    .msk-input__validateIcon {
      color: get-color(danger);
    }
  }
}
.msk-form-item--medium {
  .msk-form-item__label {
    line-height: 36px;
  }
  .msk-form-item__content {
    line-height: 36px;
  }
}
.msk-form-item--small {
  .msk-form-item__label {
    line-height: 32px;
  }
  .msk-form-item__content {
    line-height: 32px;
  }
  &.msk-form-item {
    margin-bottom: 18px;
  }
  .msk-form-item__error {
    padding-top: 2px;
  }
}
.msk-form-item--mini {
  .msk-form-item__label {
    line-height: 28px;
  }
  .msk-form-item__content {
    line-height: 28px;
  }
  &.msk-form-item {
    margin-bottom: 18px;
  }
  .msk-form-item__error {
    padding-top: 1px;
  }
}
.msk-form-item__label-wrap {
  .msk-form-item__label {
    display: inline-block;
  }
}
.msk-form-item__label-wrap{
  text-align: right;
}
.msk-form-item__label {
  flex: 0 0 auto;
  text-align: right;
  color: get-color(regular);
  line-height: 36px;
  font-size: 14px;
  padding: 0 12px 0 0;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
}
.msk-form-item__content {
  flex: 1;
  line-height: 36px;
  position: relative;
  font-size: 14px;
  min-width: 0;
  .msk-input-group {
    vertical-align: top;
  }
}
.msk-form-item__error {
  color: get-color(danger);
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
  position: absolute;
  top: 100%;
  left: 0;
}
.msk-form-item__error--inline {
  position: relative;
  top: auto;
  left: auto;
  display: inline-block;
  margin-left: 10px;
}
.msk-form-item.is-required:not(.is-no-asterisk) > .msk-form-item__label-wrap > .msk-form-item__label:before,
.msk-form-item.is-required:not(.is-no-asterisk) > .msk-form-item__label:before {
  content: "*";
  color: get-color(danger);
  margin-right: 4px;
}
.msk-form-item.is-error .msk-input__inner,
.msk-form-item.is-error .msk-input__inner:focus,
.msk-form-item.is-error .msk-textarea__inner,
.msk-form-item.is-error .msk-textarea__inner:focus {
  border-color: get-color(danger);
}
.msk-form-item.is-error .msk-input-group__append .msk-input__inner,
.msk-form-item.is-error .msk-input-group__prepend .msk-input__inner {
  border-color: transparent;
}
.msk-form-item--feedback {
  .msk-input__validate-icon {
    display: inline-flex;
  }
}

</style>
