import {App} from 'vue'
import FlyButton from '@component/button/button.vue';
import FlyIcon from '@component/icon/icon.vue';
import FormCtx from '@component/form/form.vue';
import FormCtxItem from '@component/form/form-item.vue';
import FlyCol from '@component/grid/col.vue';
import FlyRow from '@component/grid/row.vue';
import FlyTable from '@component/table/table.vue';

const components = {
    FlyButton,
    FlyIcon,
    FormCtx,
    FormCtxItem,
    FlyRow,
    FlyCol,
    FlyTable
}

export default function (app: App){
    Object.entries(components).forEach(entry => app.component(entry[1].name, entry[1]));
}
