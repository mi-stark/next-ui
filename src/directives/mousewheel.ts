import type { ObjectDirective, DirectiveBinding } from 'vue'
import {isFirefox} from "@utils/env";
import {isFunction} from "@utils/shared";

const event = isFirefox ? 'DOMMouseScroll' : 'mousewheel';

const Mousewheel: ObjectDirective = {
  beforeMount(el: HTMLElement, binding: DirectiveBinding) {
    if(!el || !isFunction(binding.value)) return;
    el.addEventListener(event, binding.value);
  },
  beforeUnmount(el: HTMLElement, binding: DirectiveBinding){
    if(!el || !isFunction(binding.value)) return;
    el.removeEventListener(event, binding.value);
  }
}

export default Mousewheel
