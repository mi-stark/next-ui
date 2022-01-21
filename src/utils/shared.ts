
export function undefOr(val: any, def: any): any {
    return val === undefined ? def : val;
}

export function getPathValue(obj: Record<string, any> | undefined, path: String): any{
    if(!obj) return undefined;
    const keys = path.split('.');
    let val: any;
    for (let i in keys){
        if(!obj) break;
        val = obj[keys[i]];
        obj = val;
    }
    return val;
}

export function isObject(val: any){
    return val !== null && typeof val === 'object'
}

export function isFunction(v: any): boolean{
    return typeof v === 'function';
}

export function isArray(v: any): boolean{
    return Array.isArray(v);
}
