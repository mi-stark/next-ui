<template>
  <svg class="msk-icon" aria-hidden="true">
    <use :xlink:href="`#icon-${icon}`"></use>
  </svg>
</template>

<script>
import '//at.alicdn.com/t/font_3063706_88s9fn8fi8d.js';
export default {
  name: "msk-icon",
  props: {
    icon: String
  }
}
</script>

<style>
.msk-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  display: inline-block;
}
</style>
