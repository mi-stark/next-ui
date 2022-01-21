
export const inBrowser: boolean = typeof window !== 'undefined'
export const UA: string = inBrowser ? window.navigator.userAgent.toLowerCase() : '';
export const isIE = UA && /msie|trident/.test(UA)
export const isIE9 = UA && UA.indexOf('msie 9.0') > 0
export const isEdge = UA && UA.indexOf('edge/') > 0
export const isAndroid = (UA && UA.indexOf('android') > 0)
export const isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA))
export const isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge
export const isPhantomJS = UA && /phantomjs/.test(UA)
export const isFirefox = UA && UA.match(/firefox\/(\d+)/)
