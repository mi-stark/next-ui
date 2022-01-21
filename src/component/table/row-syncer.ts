import {computed, Ref, ref, markRaw} from "vue";
import {ComputedRef} from "@vue/reactivity";

export class RowSyncer{

    data?: any;
    minHeight: ComputedRef<number>;
    heights: Ref<Record<string, number>>;

    constructor(data?: any) {
        this.data = data;
        this.heights = ref<Record<string, number>>({});
        this.minHeight = computed<number>(()=> Math.max.apply(null, Object.values(this.heights.value)));
    }

    public shareRowHeight(uid: number, height: number){
        if(isNaN(height)) return;
        this.heights.value[uid] = height;
    }

    public unShareRowHeight(uid: number){
        delete this.heights.value[uid];
    }
}

export function createRowSyncer(data: any): RowSyncer{
    return markRaw(new RowSyncer(data));
}
