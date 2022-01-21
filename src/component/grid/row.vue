<script lang="tsx">
import {computed, provide, renderSlot, h} from "vue";
export default {
  name: "msk-row",
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    gutter: {
      type: Number,
      default: 0,
    },
    justify: {
      type: String,
      values: ['start', 'center', 'end', 'space-around', 'space-between'],
      default: 'start',
    },
    align: {
      type: String,
      values: ['top', 'middle', 'bottom'],
      default: 'top',
    }
  },
  setup(props: Record<string, any>, ctx: Record<string, any>){
    const gutter = computed(() => props.gutter);
    provide('FlyRow', {gutter});
    const classList = computed(()=> [
      'msk-row',
      props.justify !== 'start' ? `is-justify-${props.justify}` : '',
      props.align !== 'top' ? `is-align-${props.align}` : '',
    ]);
    const style = computed(() => {
      const ret = {
        marginLeft: '',
        marginRight: '',
      }
      if (props.gutter) {
        ret.marginLeft = `-${props.gutter / 2}px`
        ret.marginRight = ret.marginLeft
      }
      return ret
    })
    return () => h(props.tag, {
      class: classList.value,
      style: style.value
    }, [renderSlot(ctx.slots, 'default')]);
  }
}
</script>

<style lang="scss">
.msk-row{
  display: flex;
  flex-wrap: wrap;
  position: relative;
  box-sizing: border-box;
  &.is-justify-center {
    justify-content: center;
  }
  &.is-justify-end {
    justify-content: flex-end;
  }
  &.is-justify-space-between {
    justify-content: space-between;
  }
  &.is-justify-space-around {
    justify-content: space-around;
  }
}
</style>
