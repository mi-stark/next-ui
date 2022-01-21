import {isArray} from "./shared";
import {VNode} from "@vue/runtime-core";

export function loopSubTree(subTree: VNode | null | undefined, callback: Function): void{
    if(subTree?.component){
        if(!callback(subTree.component)) return;
        loopSubTree(subTree.component.subTree, callback);
    }else if(isArray(subTree?.children)){
        (subTree?.children as Array<VNode>).forEach(t => loopSubTree(t, callback));
    }
}

