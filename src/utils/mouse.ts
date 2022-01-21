
export function useMouseDrag(onMouseMove?: (e: MouseEvent)=> void, onMouseUp?: (e: MouseEvent)=> void){
    const onselectstartBackup = document.onselectstart
    document.onselectstart = () => false
    const handleMouseMove = function (e: MouseEvent){
        if(!onMouseMove) return;
        onMouseMove(e);
    };
    const handleMouseUp = function (e: MouseEvent){
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.onselectstart = onselectstartBackup;
        if(onMouseUp){
            onMouseUp(e);
        }
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

export function useMouseScroll(e: WheelEvent, el: HTMLElement, horizontal: boolean = false){
    let delta = horizontal? e.deltaX : e.deltaY;
    if(!delta && e.detail){
        delta = e.detail * 40;
    }
    if(!delta || !el) return;
    const current = horizontal ? el.scrollLeft : el.scrollTop;
    if (delta < 0 && current !== 0) {
        e.preventDefault();
    }
    if (delta > 0 && ( horizontal ?
            el.scrollLeft - el.scrollWidth > current
            : el.scrollHeight - el.clientHeight > current)) {
        e.preventDefault();
    }
    let step = 0;
    let timeId = setInterval(()=>{
        step += 5;
        if(horizontal) {
            el.scrollLeft +=  delta > 0 ? 5 : -5;
        }else {
            el.scrollTop +=  delta > 0 ? 5 : -5;
        }
        if(step >= Math.abs(delta)){
            clearInterval(timeId);
            timeId = 0;
        }
    }, 5);
}
