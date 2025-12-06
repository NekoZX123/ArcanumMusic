import { getPlayer } from "../player/player";
import { fitColorMode, getMainColors } from "./colorUtils";

type colorThemeName = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

const themeConfig: { color: colorThemeName, darkState: number, darkEnabled: boolean, backgroundMode: windowBackgroundModeType } = {
    color: 'blue',
    darkState: 0,
    darkEnabled: false,
    backgroundMode: 0
};

const darkModeCheckList = window.matchMedia('(prefers-color-scheme:dark)');
function handleSystemDarkModeChange(_: any) {
    setThemeColor(themeConfig.color, themeConfig.darkState);
}

/**
 * 初始化主题控制器
 * 
 * @param themeName 主题颜色
 * @param darkEnabled 是否启用深色模式
 */
function initializeTheme(themeName: colorThemeName, darkState: number) {
    const themeElement = document.getElementById('globalTheme');
    if (themeElement) {
        console.error('[Error] Theme controller already initialized');
        return;
    }

    const controller = document.createElement('style');
    controller.id = 'globalTheme';
    document.head.appendChild(controller);

    setThemeColor(themeName, darkState);
}

/**
 * 设置主题
 * 
 * @param themeName 主题颜色
 * @param darkEnabled 是否启用深色模式
 */
function setThemeColor(themeName: colorThemeName, darkState: number) {
    const themeElement = document.getElementById('globalTheme');
    if (!themeElement) {
        console.error('[Error] Theme controller not initialized, please call initialize() first');
        return;
    }

    let darkEnabled: boolean;
    if (darkState === 2) { // 跟随系统
        darkEnabled = darkModeCheckList.matches;
        if (themeConfig.darkState !== 2) {
            darkModeCheckList.addEventListener('change', handleSystemDarkModeChange);
        }
    }
    else { // 用户指定
        darkEnabled = darkState !== 0;
        if (themeConfig.darkState === 2) {
            darkModeCheckList.removeEventListener('change', handleSystemDarkModeChange);
        }
    }

    console.log(`[Theme controller] darkState: ${darkEnabled}`);
    themeElement.innerHTML = `
    * {
        --interface-foreground: var(--text-${darkEnabled ? 'white' : 'black'});
        --interface-background: var(--background-${darkEnabled ? 'dark' : 'light'});
        --interface-foreground-grey: var(--default-${darkEnabled ? 'lightgrey' : 'grey'});
        --interface-background-grey: var(--background-grey-${darkEnabled ? 'dark' : 'light'});
        --interface-transparent: var(--transparent-${darkEnabled ? 'black' : 'white'});
        --interface-transparent-grey: var(--transparent-${darkEnabled ? 'dark' : 'light'}grey);
        --interface-contrast-background: var(----backgruond-ultra${darkEnabled ? 'dark' : 'light'});

        --theme-color-default: var(--color-${themeName}-default);
        --theme-color-light: var(--color-${themeName}-light);
        --theme-color-deep: var(--color-${themeName}-deep);
        --theme-color-ultradeep: var(--color-${themeName}-ultradeep);
        --theme-color-transparent: var(--color-${themeName}-transparent);
    }
    `;

    themeConfig.color = themeName;
    themeConfig.darkState = darkState;
    themeConfig.darkEnabled = darkEnabled;

    // 更新背景
    setWindowBackground(themeConfig.backgroundMode);
}

function setControlBarTheme(showThemeColor: boolean) {
    const controlBar = document.getElementById('windowControlBar');
    if (!controlBar) return;

    if (showThemeColor) {
        controlBar.style.background = 'var(--theme-color-light)';
    }
    else {
        controlBar.style.background = 'transparent';
    }
}

type windowBackgroundModeType = 0 | 1 | 2;
const windowBackgroundMode: Record<string, windowBackgroundModeType> = {
    FOLLOW_THEME: 0,
    FOLLOW_SONG_COVER: 1,
    FOLLOW_DARK_MODE: 2
};
/**
 * 跟随歌曲封面更改背景
 */
async function setBackgroundBasedOnCover() {
    const windowMain = document.getElementById('windowMain');
    if (!windowMain) return;

    const coverUrl = getPlayer()?.coverUrl;
    if (coverUrl) {
        const themeBackground = `var(--background-${themeConfig.darkEnabled ? 'dark' : 'light'})`;
        const coverMainColors: string[] = await getMainColors(coverUrl, 1, true) || [themeBackground];
        const spotColor = fitColorMode(coverMainColors[0], themeConfig.darkEnabled);
        windowMain.style.background = `radial-gradient(at 5% 5%, ${spotColor} 15rem, ${themeBackground}`;
    }
    else {
        windowMain.style.background = `var(--background-${themeConfig.darkEnabled ? 'dark' : 'light'})`;
    }
}
let coverHandlerListen = false;
function setWindowBackground(backgroundMode: windowBackgroundModeType) {
    const windowMain = document.getElementById('windowMain');
    if (!windowMain) return;

    const coverChangeHandler = (_: any) => {
        setBackgroundBasedOnCover();
    }

    if (backgroundMode === windowBackgroundMode.FOLLOW_THEME) { // 跟随颜色主题
        const darkModeText = themeConfig.darkEnabled ? 'dark' : 'light';
        const themeModeText = themeConfig.darkEnabled ? 'ultradeep' : 'light';
        windowMain.style.background = `radial-gradient(at 5% 5%, var(--theme-color-${themeModeText}) 15rem, var(--background-${darkModeText}))`;
    
        if (coverHandlerListen) {
            window.removeEventListener('cover-background-reload', coverChangeHandler);
            coverHandlerListen = false;
        }
    }
    if (backgroundMode === windowBackgroundMode.FOLLOW_SONG_COVER) { // 跟随歌曲封面
        coverHandlerListen = true;
        window.addEventListener('cover-background-reload', coverChangeHandler);

        setBackgroundBasedOnCover();
    }
    if (backgroundMode === windowBackgroundMode.FOLLOW_DARK_MODE) { // 跟随深色模式
        windowMain.style.background = `var(--background-${themeConfig.darkEnabled ? 'dark' : 'light'})`;

        if (coverHandlerListen) {
            window.removeEventListener('cover-background-reload', coverChangeHandler);
            coverHandlerListen = false;
        }
    }

    themeConfig.backgroundMode = backgroundMode;
}

export {
    type colorThemeName,
    type windowBackgroundModeType,
    initializeTheme,
    setThemeColor,
    setControlBarTheme,
    windowBackgroundMode,
    setWindowBackground
}
