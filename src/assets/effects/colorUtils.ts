/**
 * RGB 转 HSV
 * @param r number - 红色
 * @param g number - 绿色
 * @param b number - 蓝色
 * @returns { h: number, s: number, v: number } - 转换后的 HSV 颜色
 */
function rgb2hsv(r: number, g: number, b: number): { h: number, s: number, v: number } {
    // RGB 归一至 [0, 1]
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const v = max; // 明度
    const d = max - min;
    const s = max === 0 ? 0 : d / max; // 饱和度
    let h = 0;

    if (max !== min) {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h, s, v };
}

function parseRGBString(rgbString: string) {
    const [r, g, b] = rgbString.replace('rgb(', '').replace(')', '').split(',')
        .map((value) => parseInt(value));
    
    if ([r, g, b].includes(NaN)) {
        console.error(`[Error] Failed to parse RGB string ${rgbString}`);
        return null;
    }

    return {r, g, b};
}

const MAX_BRIGHTNESS = 0.90; // 最大明度
const MIN_BRIGHTNESS = 0.10; // 最小明度
const MIN_SATURATION = 0.20; // 最小饱和度
const MAX_BRIGHTNESS_STRICT = 0.80 // 最大明度 (严格匹配模式)
const MIN_BRIGHTNESS_STRICT = 0.20; // 最小明度 (严格匹配模式)
const MIN_SATURATION_STRICT = 0.30; // 最小明度 (严格匹配模式)
/**
 * 判断颜色是否适合作为背景主色
 * @param r RGB - R
 * @param g RGB - G
 * @param b RGB - B
 * @param useStrict boolean - 是否启用严格模式
 * @returns boolean - 是否合适
 */
function isProperColor(r: number, g: number, b: number, useStrict: boolean = false) {
    const { s, v } = rgb2hsv(r, g, b);

    const minBrightness = useStrict ? MIN_BRIGHTNESS_STRICT : MIN_BRIGHTNESS;
    const maxBrightness = useStrict ? MAX_BRIGHTNESS_STRICT : MAX_BRIGHTNESS;
    const minSaturation = useStrict ? MIN_SATURATION_STRICT : MIN_SATURATION;

    return (v <= maxBrightness && v >= minBrightness && s >= minSaturation);
}

/**
 * 调整颜色使其符合主题深浅
 * @param rgbString RGB 字符串
 * @param darkEnabled 深色模式启用状态
 * @returns string | null - 调整过的 RGB 字符串 (若字符串不符合格式则返回 null)
 */
const COLOR_ADJUST_OFFSET = 50;
function fitColorMode(rgbString: string, darkEnabled: boolean) {
    const rgbObject = parseRGBString(rgbString);
    if (!rgbObject) return;

    if (darkEnabled) {
        rgbObject.r = Math.max(rgbObject.r - COLOR_ADJUST_OFFSET, 0);
        rgbObject.g = Math.max(rgbObject.g - COLOR_ADJUST_OFFSET, 0);
        rgbObject.b = Math.max(rgbObject.b - COLOR_ADJUST_OFFSET, 0);
    }
    else {
        rgbObject.r = Math.min(rgbObject.r + COLOR_ADJUST_OFFSET, 255);
        rgbObject.g = Math.min(rgbObject.g + COLOR_ADJUST_OFFSET, 255);
        rgbObject.b = Math.min(rgbObject.b + COLOR_ADJUST_OFFSET, 255);
    }

    return `rgb(${rgbObject.r},${rgbObject.g},${rgbObject.b})`;
}

class ParticleSpot {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null | undefined;
    x: number;
    y: number;
    size: number;
    speedX: number;
    speedY: number;
    color: string;

    constructor(color: string, x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.speedX = 0;
        this.speedY = 0;
        this.color = '';

        this.canvas = document.getElementById('dynamicBackground') as HTMLCanvasElement;
        if (!this.canvas) {
            console.error(`[Error] Failed to get element #dynamicBackground`);
            return;
        }
        this.context = this.canvas.getContext('2d', { willReadFrequently: false });

        this.size = (Math.random() * 0.4 + 0.6) * this.canvas.width;

        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;

        this.color = color;
    }

    update() {
        if (Math.random() < 0.02) {
            this.speedX += (Math.random() - 0.5) * 0.5;
            this.speedY += (Math.random() - 0.5) * 0.5;
        }

        this.speedX = Math.max(-2, Math.min(2, this.speedX));
        this.speedY = Math.max(-2, Math.min(2, this.speedY));

        this.x += this.speedX;
        this.y += this.speedY;
        
        // 边界反弹
        const borderDelta = this.size * 0.2;
        
        if (this.x < borderDelta || this.x > this.canvas.width - borderDelta) this.speedX *= -1;
        if (this.y < borderDelta || this.y > this.canvas.height - borderDelta) this.speedY *= -1;
    }

    draw() {
        if (!this.context) return;

        const gradient = this.context.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );

        const [r, g, b] = this.color.replace('rgb(', '').replace(')', '').split(',');
        gradient?.addColorStop(0, this.color);
        gradient?.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        this.context.fillStyle = gradient;
        this.context.beginPath();
        this.context.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        this.context.fill();
    }
}

class ParticleManager {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null | undefined;
    spots: Array<ParticleSpot> = [];
    colors: Array<string> = [];
    private lastUpdateFrame: number = 0;
    private animationId: number | null = null;
    private isRunning: boolean = false;
    private restartTimerId: number | null = null;

    constructor(colors: string[]) {
        this.canvas = document.getElementById('dynamicBackground') as HTMLCanvasElement;

        if (!this.canvas) {
            console.error(`[Error] Failed to get element #dynamicBackground`);
            return;
        }
        this.context = this.canvas.getContext('2d', { willReadFrequently: false });

        this.spots = [];
        this.colors = colors;
    }

    setColors(colors: string[]) {
        this.colors = colors;
    }

    /**
     * 创建光斑
     */
    createParticles() {
        this.spots = [];
        this.colors.forEach((color, index) => {
            const particleX = this.canvas.width * 0.333 * (index + 1);
            const particleY = this.canvas.height * 0.333 * (index + 1);
            this.spots.push(new ParticleSpot(color, particleX, particleY));
        });
    }

    update() {
        if (!this.context) return;
        
        this.context.fillStyle = 'rgb(0, 0, 0)';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.spots.forEach((spot) => {
            spot.update();
            spot.draw();
        });
    }

    startAnimation() {
        this.stopAnimation();
        this.isRunning = true;
        this.lastUpdateFrame = performance.now();

        const maxFramerate = 30;
        const frameInterval = 1000 / maxFramerate;

        const updateFrame = () => {
            if (!this.isRunning) return;

            const current = performance.now();
            if (current - this.lastUpdateFrame >= frameInterval) {
                this.update();
                this.lastUpdateFrame = current;
            }
            this.animationId = requestAnimationFrame(updateFrame);
        }
        this.animationId = requestAnimationFrame(updateFrame);

        // 每隔 30s 刷新动画
        if (this.restartTimerId) clearTimeout(this.restartTimerId);
        this.restartTimerId = window.setTimeout(() => {
            this.refreshAnimation();
        }, 30 * 1000);
    }

    stopAnimation() {
        this.isRunning = false;
        if (this.animationId !== null) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.restartTimerId !== null) {
            clearTimeout(this.restartTimerId);
            this.restartTimerId = null;
        }
    }

    refreshAnimation() {
        if (!this.isRunning) return;

        this.stopAnimation();

        setTimeout(() => {
            if (this.spots.length > 0) this.startAnimation();
        }, 100);
    }

    clearCanvas() {
        this.spots = [];
        this.update();
    }

    destroy() {
        this.stopAnimation();
        this.clearCanvas();
        this.spots = [];
        this.colors = [];
        this.context = null;
    }
}

const COLOR_STEP = 20;
/**
 * 获取图片主色
 * @param imgUrl 图片链接
 * @param count 需要提取的颜色数量
 * @param useStrict 是否启用严格模式
 * @returns Promise<string[]> 返回符合条件的颜色数组
 */
function getMainColors(imgUrl: string, count: number = 3, useStrict: boolean = false): Promise<string[]> | undefined {
    if (count > 10 || count < 1) {
        throw new Error(`getMainColors() received an unproper count value ${count}`);
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        img.onload = () => {
            // 创建画布并绘制图片
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (!context) return;

            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            // 获取图片像素数据
            const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
            const pixels = imgData.data;

            // 采样
            const colorMap = new Map<string, number>();
            const step = Math.max(1, Math.floor(pixels.length / 500)); // 采样步长

            for (let i = 0; i < pixels.length; i += 4 * step) {
                const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];

                if (isProperColor(r, g, b, useStrict)) {
                    // 简化颜色
                    const simplefiedColor = `${Math.round(r / COLOR_STEP) * COLOR_STEP},${Math.round(g / COLOR_STEP) * COLOR_STEP},${Math.round(b / COLOR_STEP) * COLOR_STEP}`;
                    colorMap.set(simplefiedColor, (colorMap.get(simplefiedColor) || 0) + 1);
                }
            }

            // 按频率排序并返回主要颜色
            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1]) // 按频率降序排序
                .map(([color]) => color);

            const mainColors = sortedColors.slice(0, count).map((color) => {
                const [r, g, b] = color.split(',');
                return `rgb(${r},${g},${b})`;
            });

            console.info(`[Main Color Extraction Algorithm] Extracted colors: ${mainColors}`);
            resolve(mainColors);
        };

        img.onerror = () => reject(new Error('Failed to load image resource'));

        img.src = imgUrl;
    });
}

export {
    rgb2hsv,
    isProperColor,
    fitColorMode,
    getMainColors,
    ParticleSpot,
    ParticleManager
}
