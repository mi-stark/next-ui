<template>
  <table :style="{width: `${width}px`}">
    <thead>
      <table-row v-for="(columns, index) in headerRows"
                 type="header"
                 :fixed="fixed"
                 :columns="columns"
                 :row-syncer="rowSyncers[index]"
                 :index="index"/>
    </thead>
  </table>
</template>

<script lang="tsx">
import TableRow from "@component/table/table-row";
export default {
  name: "table-header",
  props: {
    headerRows: Array,
    width: Number,
    fixed: String,
    rowSyncers: Array
  },
  components: {TableRow},
}
</script>

<style lang="scss">

</style>
