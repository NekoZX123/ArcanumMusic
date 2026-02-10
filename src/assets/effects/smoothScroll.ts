/**
 * 平滑滚动元素至指定位置 (仅垂直滚动)
 * @param element 需要滚动的元素
 * @param target 目标滚动位置 (px)
 * @param duration 滚动时间 (ms)
 */
function smoothScroll(element: HTMLElement, target: number, duration: number) {
    const start = element.scrollTop;
    const change = target - start;
    const startTime = performance.now();

    const easeOutCubic = (t: number): number => {
        return 1 - Math.pow(1 - t, 3);
    };

    function animateScroll(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = easeOutCubic(progress);
        const scrollPosition = start + change * ease;

        element.scrollTo({ top: scrollPosition });

        if (elapsed < duration) {
            requestAnimationFrame(animateScroll);
        }
    }

    requestAnimationFrame(animateScroll);
}

export {
    smoothScroll
}
