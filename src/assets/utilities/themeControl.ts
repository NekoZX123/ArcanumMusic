type colorThemeName = 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple';

/**
 * 初始化主题控制器
 * 
 * @param themeName 主题颜色
 */
function initializeTheme(themeName: colorThemeName) {
    const themeElement = document.getElementById('globalTheme');
    if (themeElement) {
        console.error('[Error] Theme controller already initialized');
        return;
    }

    const controller = document.createElement('style');
    controller.id = 'globalTheme';
    document.head.appendChild(controller);

    setThemeColor(themeName);
}

function setThemeColor(themeName: colorThemeName) {
    const themeElement = document.getElementById('globalTheme');
    if (!themeElement) {
        console.error('[Error] Theme controller not initialized, please call initialize() first');
        return;
    }

    themeElement.innerHTML = `
    * {
        --theme-color-default: var(--color-${themeName}-default);
        --theme-color-light: var(--color-${themeName}-light);
        --theme-color-deep: var(--color-${themeName}-deep);
        --theme-color-ultradeep: var(--color-${themeName}-ultradeep);
        --theme-color-transparent: var(--color-${themeName}-transparent);
    }
    `;
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

export {
    type colorThemeName,
    initializeTheme,
    setThemeColor,
    setControlBarTheme
}
