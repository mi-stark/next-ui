import {RuleItem} from "async-validator";
import {InjectionKey} from "vue";

export declare interface FormCtx{
    model?: Record<string, any>,
    rules?: Record<string, FormRule> | FormRule[],
    labelSuffix?: string,
    labelWidth?: string | number,
    showMessage?: boolean
    inlineMessage?: boolean,
    disabled?: boolean,
    emit: (evt: string, ...args: any[]) => void,
    addField: (item: FormItemCtx) => void,
    removeField: (item: FormItemCtx) => void,
    shareLabelWidth: (uid: number | undefined, width: number) => void,
    unShareLabelWidth: (uid: number | undefined) => void,
    sharedLabelMinWidth: number
}


export declare interface FormItemCtx{
    prop?: string,
    label?: string,
    labelWidth?: string | number,
    showMessage?: boolean,
    inlineMessage?: Boolean,
    rules?: Record<string, FormRule> | FormRule[],
    required?: boolean,
    disabled?: boolean,
    emit: (evt: string, ...args: any[]) => void,
    validate: (trigger?: string, callback?: Function) => Promise<boolean>,
    clearValidate: ()=>void,
    uid: string
}

export declare interface FormRule extends RuleItem{
    field?: string,
    trigger?: Array<String> | string
}

export const FormKey: InjectionKey<FormCtx> = Symbol('FormCtx')
export const FormItemKey: InjectionKey<FormItemCtx> = Symbol('FormCtxItem')
