import {
    h,
    CSSProperties,
    computed,
    onMounted,
    onUpdated,
    nextTick,
    getCurrentInstance,
    ref,
    onBeforeUpdate,
    watch,
    inject
} from 'vue';
import {isFunction} from "@utils/shared";
import {ColumnConfig, FlyTableCtx, TableKey} from "@component/table/table";
import {useMouseDrag} from "@utils/mouse";
export default {
    name: "table-header-row",
    props: {
        type: String,
        columns: Array,
        row: Object,
        index: Number,
        fixed: String,
        rowSyncer: Object
    },
    setup(props: Record<string, any>){
        const isHeader = props.type === 'header';
        const CellTag = isHeader ? 'th' : 'td';
        const isFixedRight = props.fixed === 'right';
        const mskTableCtx = inject(TableKey, {} as FlyTableCtx);

        function getColumnClass(column: ColumnConfig){
            return {
                'msk-table__column': true,
                'is-leaf': column.isLeaf,
                'is-right': column.align === 'right',
                'is-center': column.align === 'center',
                'is-hidden': column.isFixed && column.fixed!==props.fixed
            }
        }

        function getColumnStyle(column: ColumnConfig){
            const style: CSSProperties = {};
            if(!isNaN(column.width)) {
                style.width = `${column.width}px`;
            }
            return style;
        }

        const syncerStyle = computed(()=> {
            const style: CSSProperties = {};
            const height = props.rowSyncer?.minHeight.value;
            if(!isNaN(height) && height>=0) {
                style.height = `${height}px`;
            }
            return style;
        });

        let cells: Element[] = [];

        function setCell(el: any){
            if(!el) return;
            cells.push(el);
        }

        const cellHeight = ref<number>(0);

        function updateCellHeight(){
            nextTick(()=> cellHeight.value = Math.max.apply(null, cells.map(el => (el as Element).clientHeight)));
        }

        const instance = getCurrentInstance();

        watch(cellHeight, v => props.rowSyncer?.shareRowHeight(instance?.uid, v));

        onMounted(()=> {
            updateCellHeight();
        });

        onBeforeUpdate(()=> {
            cells = [];
        });

        onUpdated(()=> {
            updateCellHeight();
        });

        let draging = false;
        let moveSeed = 0;
        let cursorBackup: string = '';
        let dragColumn: ColumnConfig | null = null;

        function backupCursor(){
            if(!moveSeed++){
                cursorBackup = document.body.style.cursor;
                document.body.style.cursor = 'col-resize';
            }
        }

        function restoreCursor(){
            if(moveSeed>0){
                document.body.style.cursor = cursorBackup;
                moveSeed = 0;
                dragColumn = null;
            }
        }

        function handleThMouseMove(e: MouseEvent, column: ColumnConfig){
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            if(!draging){
                if(isFixedRight && (e.pageX - rect.left < 8)
                    || !isFixedRight && (rect.right - e.pageX < 8)){
                    backupCursor();
                    dragColumn = column;
                }else {
                    restoreCursor();
                }

            }
        }

        function handleThMouseDown(e: MouseEvent, column: ColumnConfig){
            const el = e.currentTarget as HTMLElement;
            const rect = el.getBoundingClientRect();
            if(!draging && dragColumn){
                draging = true;
                const startX = e.clientX;
                const startWidth = column.width;
                const resizerX = isFixedRight ? rect.left : rect.right
                mskTableCtx.updateColResizer(true, resizerX);
                const delta = (e: MouseEvent) => e.clientX - startX;
                useMouseDrag(
                    e => {
                        column._width = startWidth + delta(e) * (isFixedRight ? -1 : 1);
                        mskTableCtx.updateColResizer(true, resizerX + delta(e));
                    },
                    e => {
                        draging = false;
                        mskTableCtx.updateColResizer(false, 0);
                        restoreCursor();
                    }
                );
            }
        }

        function handleThMouseleave(e: MouseEvent){
            if(!draging) restoreCursor();
        }

        function renderCell(column: ColumnConfig) {
            const isTh = isHeader;
            const row = props.row;
            let ret = isTh ? column.label : row[column.field];
            if(column.isFixed && column.fixed!==props.fixed){
                ret = '';
            }else {
                const index = props.index;
                if(isTh && column.headerRender){
                    if(isFunction(column.headerRender)){
                        ret = column.headerRender(column, index);
                    }else {
                        let bind:Record<string, any> = {};
                        if(isFunction(column.headerRenderData)){
                            bind = column.headerRenderData(column, index) || {};
                        }
                        bind = {...bind, column, index};
                        ret = h(column.headerRender, bind);
                    }
                }else if(!isTh && column.bodyRender){
                    if(isFunction(column.bodyRender)){
                        ret = column.bodyRender(row, index, column);
                    }else {
                        let bind:Record<string, any> = {};
                        if(isFunction(column.bodyRenderData)){
                            bind = column.bodyRenderData(column, index) || {};
                        }
                        bind = {...bind, column, index};
                        ret = h(column.bodyRender, bind);
                    }
                }
            }
            return <div ref={setCell} class="msk-table__cell">{ret}</div>
        }

        function renderTh(column: ColumnConfig){
            return <th style={getColumnStyle(column)}
                       class={getColumnClass(column)}
                       colspan={column.colSpan}
                       rowspan={column.rowSpan}
                       onMousedown={e=>handleThMouseDown(e, column)}
                       onMousemove={e=>handleThMouseMove(e, column)}
                       onMouseleave={handleThMouseleave}>
                {renderCell(column)}</th>;
        }

        function renderTd(column: ColumnConfig){
            return <td style={getColumnStyle(column)}
                       class={getColumnClass(column)}>
                {renderCell(column)}</td>;
        }

        function renderSyncer(){
            return <CellTag class={['msk-table__column', 'msk-table__syncer']}
                     style={{width: '0!important'}}>
                <div class="msk-table__cell" style={syncerStyle.value}></div>
            </CellTag>
        }

        return ()=> <tr>
            {
                props.columns?.map((col: ColumnConfig) => isHeader
                ? renderTh(col)
                : renderTd(col))
            }
            {renderSyncer()}
        </tr>;
    }
}
