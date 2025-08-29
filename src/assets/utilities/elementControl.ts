import { createApp } from "vue";
import { ArtistCard, SongCard, SongInfoLine, SonglistCard } from "../widgets/Widgets.tsx";
import Menu from "../widgets/Menu.vue";

// 添加歌单卡片
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

// 添加歌曲卡片
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

// 添加单行歌曲卡片
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

// 添加歌手卡片
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

    menuContainer.classList.add('show');
}
// 隐藏右键菜单
function hideRightMenu() {
    const menuContainer = document.getElementById('rightClickMenuContainer') as HTMLElement;
    menuContainer.classList.remove('show');
}

export {
    addSonglistCard, 
    addSongCard,
    addSongLine, 
    addArtistCard,
    triggerRightMenu,
    hideRightMenu
}
