import { createApp } from "vue";
import { ArtistCard, ArtistLine, SongCard, SongInfoLine, SonglistCard } from "../widgets/Widgets.tsx";
import Menu from "../widgets/Menu.vue";

/**
 * 添加歌单卡片
 * @param target 目标容器
 * @param id 歌单ID
 * @param name 歌单名称
 * @param coverUrl 歌单封面
 * @param isNew 是否为新内容 (影响ID命名)
 */
function addSonglistCard(target: HTMLElement, id: string, name: string, coverUrl: string, isNew: boolean = false) {
    const container = document.createElement('div');
    container.classList.add('songlistContainer', 'medium');
    container.id = `${isNew ? 'new_': ''}${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name
    };

    createApp(SonglistCard, listProps).mount(`#${isNew ? 'new_': ''}${id}_container`);
}

/**
 * 添加歌曲卡片
 * @param target 目标容器
 * @param id 歌曲ID
 * @param name 歌曲名称
 * @param coverUrl 歌曲封面
 * @param authors 歌曲作者
 * @param duration 歌曲时长 (秒)
 * @param isNew 是否为新内容 (影响ID命名)
 */
function addSongCard(target: HTMLElement, id: string, name: string, coverUrl: string, authors: string, duration: number, isNew: boolean = false) {
    const container = document.createElement('div');
    container.classList.add('songContainer', 'medium');
    container.id = `${isNew ? 'new_' : ''}${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name,
        authors: authors,
        duration: duration
    };

    createApp(SongCard, listProps).mount(`#${isNew ? 'new_' : ''}${id}_container`);
}

/**
 * 添加单行歌曲卡片
 * @param target 目标容器
 * @param id 歌曲ID
 * @param name 歌曲名称
 * @param coverUrl 歌曲封面
 * @param authors 歌曲作者
 * @param duration 歌曲时长 (秒)
 */
function addSongLine(target: HTMLElement, id: string, name: string, coverUrl: string, authors: string, duration: number) {
    const container = document.createElement('div');
    container.classList.add('songLineContainer');
    container.id = `${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name,
        authors: authors,
        duration: duration
    };

    createApp(SongInfoLine, listProps).mount(container);
}

/**
 * 添加歌手卡片
 * @param target 目标容器
 * @param id 歌手ID
 * @param name 歌手名称
 * @param coverUrl 歌手封面
 */
function addArtistCard(target: HTMLElement, id: string, name: string, coverUrl: string) {
    const container = document.createElement('div');
    container.classList.add('artistContainer', 'medium');
    container.id = `${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name
    };

    createApp(ArtistCard, listProps).mount(`#${id}_container`);
}
/**
 * 添加单行歌手卡片
 * @param target 目标容器
 * @param id 歌手ID
 * @param name 歌手名称
 * @param coverUrl 歌手封面
 */
function addArtistLine(target: HTMLElement, id: string, name: string, coverUrl: string) {
    const container = document.createElement('div');
    container.classList.add('artistLineContainer', 'medium');
    container.id = `${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name
    };

    createApp(ArtistLine, listProps).mount(`#${id}_container`);
}

// 显示右键菜单
type MenuType = 'collections' | 'song' | 'playlistItem' | 'platformSelect';
function triggerRightMenu(event: MouseEvent, info: any, menuType: MenuType) {
    // 获取容器
    const menuContainer = document.getElementById('rightClickMenuContainer') as HTMLElement;
    if (menuContainer.innerHTML !== '') {
        menuContainer.innerHTML = '';
    }
    
    // 设置组件
    if ((menuContainer as any).__vue_app__) {
        (menuContainer as any).__vue_app__.unmount();
        delete (menuContainer as any).__vue_app__;
    }
    const menuProps = { targetInfo: info, menuType: menuType };
    const menuApp = createApp(Menu, menuProps);
    menuApp.mount(menuContainer);
    (menuContainer as any).__vue_app__ = menuApp;

    // 调整位置
    let xOffset = event.clientX;
    let yOffset = event.clientY;
    // 防止溢出边缘
    const menuWidth = menuContainer.offsetWidth;
    const menuHeight = menuContainer.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (xOffset + menuWidth >= windowWidth) xOffset -= menuWidth;
    if (yOffset + menuHeight >= windowHeight) yOffset -= menuHeight;
    menuContainer.style.left = `${xOffset}px`;
    menuContainer.style.top = `${yOffset}px`;

    menuContainer.style.display = 'block';
    setTimeout(() => {
        menuContainer.classList.add('show'); 
    }, 50);
    
}
// 隐藏右键菜单
function hideRightMenu() {
    const menuContainer = document.getElementById('rightClickMenuContainer') as HTMLElement;
    menuContainer.classList.remove('show');
    setTimeout(() => {
        menuContainer.style.display = 'none';
    }, 250);
}

// 显示歌手选取弹窗
function showArtistSelect(artistList: any[]) {
    const containerWindow = document.getElementById('artistSelect') as HTMLElement;
    const selectContainer = document.getElementById('artistSelectContent') as HTMLElement;
    selectContainer.innerHTML = '';

    artistList.forEach((artistInfo) => {
        addArtistLine(selectContainer, artistInfo.id, artistInfo.name, artistInfo.coverUrl);
    });

    containerWindow.classList.add('show');
    setTimeout(() => {
        containerWindow.classList.add('anim');
    }, 50);
}
// 隐藏歌手选取弹窗
function hideArtistSelect() {
    const containerWindow = document.getElementById('artistSelect') as HTMLElement;

    containerWindow.classList.remove('anim');
    setTimeout(() => {
        containerWindow.classList.remove('show');
    }, 200);
}

export {
    addSonglistCard, 
    addSongCard,
    addSongLine, 
    addArtistCard,
    addArtistLine,
    triggerRightMenu,
    hideRightMenu,
    showArtistSelect,
    hideArtistSelect
}
