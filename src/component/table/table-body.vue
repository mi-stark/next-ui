<template>
  <table :style="{width: `${width}px`}">
    <tbody>
      <table-row v-for="(syncer,index) in dataSyncers"
                 :fixed="fixed"
                 :row="syncer.data"
                 :index="index"
                 :columns="columns"
                 :row-syncer="syncer"/>
    </tbody>
  </table>
</template>

<script lang="tsx">
import TableRow from "@component/table/table-row";
export default {
  name: "table-body",
  props: {
    columns: Array,
    dataSyncers: Array,
    width: Number,
    fixed: String
  },
  components: {TableRow}
}
</script>

<style lang="scss">

</style>
