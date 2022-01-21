<template>
  <Icon class="msk-loading" icon="loading"/>
</template>

<script>
import Icon from '@component/icon/icon.vue';
export default {
  name: "msk-loading",
  components: {Icon}
}
</script>

<style lang="scss">
.msk-loading{
  animation: loading-rotate 1s linear infinite;
}
@keyframes loading-rotate {
  100% {
    transform: rotate(360deg);
  }
}
</style>
