import { createApp } from "vue";
import { ArtistCard, SongCard, SongInfoLine, SonglistCard } from "../widgets/Widgets.tsx";

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
function addSongCard(target: HTMLElement, id: string, name: string, coverUrl: string, authors: string, isNew: boolean = false) {
    const container = document.createElement('div');
    container.classList.add('songContainer', 'medium');
    container.id = `${isNew ? 'new_' : ''}${id}_container`;
    target.appendChild(container);

    const listProps = {
        id: id,
        coverUrl: coverUrl,
        name: name,
        authors: authors
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

export {
    addSonglistCard, 
    addSongCard,
    addSongLine, 
    addArtistCard
}
