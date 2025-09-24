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

const MAX_BRIGHTNESS = 0.85; // 最大明度
const MIN_BRIGHTNESS = 0.15; // 最小明度
const MIN_SATURATION = 0.15; // 最小饱和度
/**
 * 判断颜色是否适合作为背景主色
 * @param r RGB - R
 * @param g RGB - G
 * @param b RGB - B
 * @returns boolean - 是否合适
 */
function isProperColor(r: number, g: number, b: number) {
    const { s, v } = rgb2hsv(r, g, b);

    return v <= MAX_BRIGHTNESS && v >= MIN_BRIGHTNESS && s >= MIN_SATURATION;
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

    constructor(color: string) {
        this.x = 0;
        this.y = 0;
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

        this.x = (Math.random() * 0.5 + 0.2) * this.canvas.width;
        this.y = (Math.random() * 0.5 + 0.2) * this.canvas.height;

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
        this.colors.forEach((color) => {
            this.spots.push(new ParticleSpot(color));
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
 */
function getMainColors(imgUrl: string, count: number = 3) {
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
            const step = Math.max(1, Math.floor(pixels.length / 10000));

            // 获取颜色频率
            for (let i = 0; i < pixels.length; i += 4 * step) {
                const [r, g, b] = [pixels[i], pixels[i + 1], pixels[i + 2]];

                if (isProperColor(r, g, b)) {
                    // 简化颜色
                    const simplefiedColor = `${Math.floor(r/COLOR_STEP)*COLOR_STEP},${Math.floor(g/COLOR_STEP)*COLOR_STEP},${Math.floor(b/COLOR_STEP)*COLOR_STEP}`;
                    
                    colorMap.set(simplefiedColor, (colorMap.get(simplefiedColor) || 0) + 1);
                }
            }

            // 按频率返回主要颜色
            let mainColors: string[] = [];

            const sortedColors = Array.from(colorMap.entries())
                .sort((a, b) => b[1] - a[1])
                .slice(0, count)
                .map(([color]) => color);

            mainColors = sortedColors.map((color) => {
                const [r, g, b] = color.split(',');
                return `rgb(${r},${g},${b})`;
            });

            resolve(mainColors);
        };

        img.onerror = () => reject(new Error('Failed to load image resource'));

        img.src = imgUrl;
    });
}

export {
    rgb2hsv,
    isProperColor,
    getMainColors,
    ParticleSpot,
    ParticleManager
}
