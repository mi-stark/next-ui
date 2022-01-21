<script lang="tsx">
import {computed, inject, h, renderSlot} from "vue";

export default {
  name: "msk-col",
  props: {
    tag: {
      type: String,
      default: 'div',
    },
    span: {
      type: Number,
      default: 24,
    },
    offset: {
      type: Number,
      default: 0,
    },
    pull: {
      type: Number,
      default: 0,
    },
    push: {
      type: Number,
      default: 0,
    },
    xs: {
      type: [Number, Object],
      default: () => {
      },
    },
    sm: {
      type: [Number, Object],
      default: () => {
      },
    },
    md: {
      type: [Number, Object],
      default: () => {
      },
    },
    lg: {
      type: [Number, Object],
      default: () => {
      },
    },
    xl: {
      type: [Number, Object],
      default: () => {
      },
    },
  },
  setup(props: Record<string, any>, ctx: Record<string, any>){
    const {gutter} = inject('FlyRow', {gutter: {value: 0}})

    const style = computed(() => {
      if (gutter.value) {
        return {
          paddingLeft: `${gutter.value / 2}px`,
          paddingRight: `${gutter.value / 2}px`,
        }
      }
      return {}
    });

    const classList = computed(() => {
      const classes = [];
      ['span', 'offset', 'pull', 'push'].forEach((prop) => {
        const size = props[prop]
        if (typeof size === 'number') {
          if (prop === 'span') classes.push(`msk-col-${props[prop]}`)
          else if (size > 0) classes.push(`msk-col-${prop}-${props[prop]}`)
        }
      });

      ['xs', 'sm', 'md', 'lg', 'xl'].forEach((size) => {
        if (typeof props[size] === 'number') {
          classes.push(`msk-col-${size}-${props[size]}`)
        } else if (typeof props[size] === 'object') {
          const sizeProps = props[size]
          Object.keys(sizeProps).forEach((prop) => {
            classes.push(
                prop !== 'span'
                    ? `msk-col-${size}-${prop}-${sizeProps[prop]}`
                    : `msk-col-${size}-${sizeProps[prop]}`
            )
          })
        }
      });

      // this is for the fix
      if (gutter.value) {
        classes.push('is-guttered')
      }
      return classes
    });

    return ()=> h(props.tag, {
          class: ['msk-col', classList.value],
          style: style.value,
        },[renderSlot(ctx.slots, 'default')])
  }
}
</script>

<style lang="scss">
[class*='msk-col-'] {
  float: left;
  box-sizing: border-box;
  &.is-guttered {
    display: block;
    min-height: 1px;
  }
}

.msk-col-0 {
  display: none;
  &.is-guttered {
    display: none;
  }
}
@include col-span(msk-col);
@each $size in ('xs', 'sm', 'md', 'lg', 'xl'){
  @include col-size(msk-col, $size);
}
</style>
