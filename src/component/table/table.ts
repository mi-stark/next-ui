import {isArray, isObject} from "@utils/shared";
import {InjectionKey} from "vue";

export declare interface FlyTableCtx{
    updateColResizer: (visible: boolean, left: number)=> void,
}

export declare type ColumnConfig = Record<string, any>;

export function isLeaf(cfg: any): boolean{
    return isObject(cfg) && (!isArray(cfg.children) || cfg.children.length<1);
}

export function extractColumns(columns: Array<Record<string, any>>): Record<string, Array<any>>{
    const headers: ColumnConfig[][] = [];
    const center: ColumnConfig[] = [];
    const fixed: Record<string, ColumnConfig[]> = {
        left: [],
        right: []
    };
    (function loopColumns(columns: Array<Record<string, any>>, level:number=0, fix?: string){
        return columns?.map(cfg => {
            cfg = {...cfg, _width: cfg.width};
            level>0 && (cfg.fixed = fix || null);
            (headers[level] || (headers[level]=[])).push(cfg);
            if(isLeaf(cfg)){
                cfg.isLeaf = true;
                if(fixed[cfg.fixed]){
                    fixed[cfg.fixed].push(cfg);
                    cfg.isFixed = true;
                }else {
                    center.push(cfg);
                }
            }else {
                cfg.children = loopColumns([...cfg.children], level+1, cfg.fixed);
            }
            return cfg;
        });
    })(columns, 0);

    // header
    let hdCenter: ColumnConfig[][] = [];
    let hdLeft: ColumnConfig[][] = [];
    let hdRight: ColumnConfig[][] = [];
    const maxRowSpan = headers.length;
    for (let i = headers.length-1;i>=0;i--){
        hdCenter[i] = [];
        hdLeft[i] = [];
        hdRight[i] = [];
        headers[i].forEach(cfg => {
            (cfg.fixed === 'left'
                ? hdLeft[i]
                : cfg.fixed === 'right'
                    ? hdRight[i]
                    : hdCenter[i]).push(cfg);
            cfg.rowSpan = cfg.isLeaf ? maxRowSpan - i : 1;
            cfg.colSpan = cfg.isLeaf ? 1 : cfg.children.reduce((a: number, b: ColumnConfig)=> a+b.colSpan, 0)
        });
    }
    for (let i=0;i<headers.length;i++){
        hdCenter[i] = [...hdLeft[i], ...hdCenter[i],...hdRight[i]];
    }

    function isEmptyTh(hdRows: ColumnConfig[][]){
        return hdRows.every(cols => !cols.length);
    }

    isEmptyTh(hdLeft) && (hdLeft = []);
    isEmptyTh(hdRight) && (hdRight = []);

    const leafs: ColumnConfig[] = [...fixed.left, ...center, ...fixed.right];

    return {
        hdCenter,
        hdLeft,
        hdRight,
        leafs,
        leafsLeft: fixed.left,
        leafsRight: fixed.right,
    }
}

export function updateLeafWidth(leafs: ColumnConfig[], width: number){
    let widthTotal: number = 0;
    let fitColumns: ColumnConfig[] = [];
    leafs.forEach(cfg => {
        let columnWidth = parseFloat(cfg._width);
        if(isNaN(columnWidth)){
            fitColumns.push(cfg);
        }else {
            cfg.width = cfg._width;
            widthTotal+=columnWidth;
            return;
        }
        const columnMinWidth = parseFloat(cfg.minWidth);
        cfg.width = columnWidth = !isNaN(columnMinWidth) ? columnMinWidth : 80;
        widthTotal+=columnWidth;
    });
    if(widthTotal<width && fitColumns.length){
        let bonus = width - widthTotal;
        const step = Math.round(bonus/fitColumns.length);
        fitColumns.forEach((cfg, idx) => {
            let addup = (idx<fitColumns.length-1) ? step : bonus;
            addup = addup <0 ? 0 :addup;
            cfg.width += addup;
            bonus-= addup;
        });
    }
}

export const TableKey: InjectionKey<FlyTableCtx> = Symbol('FlyTable')
