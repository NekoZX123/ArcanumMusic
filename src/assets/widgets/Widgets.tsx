import { defineComponent, reactive } from "vue";
import router from "../../router/index.ts";
import { getPlayer } from "../player/player";
import { hideArtistSelect, triggerRightMenu } from "../ui/elementControl.ts";
import { sizeFormat, timeFormat } from "../utilities/formatter";
import PlayingIndicator from "./PlayingIndicator.vue";

// 各平台图标
const platformIcons: Record<string, string> = {
    'netease': './images/platforms/netease.png',
    'qqmusic': './images/platforms/qqmusic.png',
    'kuwo': './images/platforms/kuwo.png',
    'kugou': './images/platforms/kugou.png'
}

// 自定义组件

// 歌单卡片右键点击事件处理
function handleSongListRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'collections');
}
// 歌单卡片
const SonglistCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        const platformName = props.id.replace('new_', '').split('-')[1];
        const platformIcon = platformIcons[platformName] || '';
        return () => (
            <span class="songlistCard medium" id={props.id} 
                onClick={(_) => router.push('/songlist/' + props.id)}
                onContextmenu={(event) => handleSongListRightClick(event, props)}>
                <span class="flex column">
                    <img class="songCover" src={props.coverUrl} alt="Playlist cover"/>
                    <label class="text small">{props.name}</label>
                </span>
                <button class="songlistPlatform" id={`${props.id}_platform`}>
                    <img src={platformIcon} alt={`From ${platformName}`}/>
                </button>
            </span>
        );
    },
});

// 歌曲卡片右键点击事件处理
function handleSongRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'song');
}
// 歌曲卡片
const SongCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String,
        authors: String,
        duration: Number
    },
    setup(props: { id: string, coverUrl: string, name: string, authors: string, duration: number }) {
        return () => (
            <span class="songCard flex row" onContextmenu={(event) => handleSongRightClick(event, props)}>
                <img class="songCover" src={props.coverUrl} 
                    onClick={() => router.push('/single/' + props.id)}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <button class="songPlay" onClick={() => getPlayer()?.playNow(props)}>
                    <img class="outlineImage" src="./images/player/play.dark.svg" alt="Play"/>
                </button>
            </span>
        );
    }
});

// 单行歌曲卡片右键点击事件处理
function handleSongLineRightClick(event: MouseEvent, props: any) {
    const menuType = props.id.includes('local_') ? 'playlistLocalItem' : (props.id.includes('playlist_') ? 'playlistItem' : 'song');
    if (event.button === 2) triggerRightMenu(event, props, menuType);
}
// 歌曲卡片 (单行)
const SongInfoLine = defineComponent({
    props: {
        id: String,
        name: String,
        authors: String,
        coverUrl: String,
        duration: Number
    },
    setup(props: { id: string, name: string, authors: string, coverUrl: string, duration: number }) {
        return () => (
            <span class="songLine flex row" onContextmenu={(event) => handleSongLineRightClick(event, props)}>
                <button class="songPlay" onClick={() => getPlayer()?.playNow(props)}>
                    <img src="./images/player/play.dark.svg"/>
                </button>
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <span class="text ultraSmall songLength">{props.duration === -1 ? '未知时长' : timeFormat(props.duration)}</span>
            </span>
        );
    }
});

// 本地歌曲卡片右键点击事件处理
function handleLocalSongLineRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'localAudio');
}
// 单行歌曲卡片 (本地)
const LocalSongLine = defineComponent({
    props: {
        id: String,
        name: String,
        authors: String,
        coverUrl: String,
        duration: Number,
        ext: String,
        sizeBytes: Number
    },
    setup(props: { id: string, name: string, authors: string, coverUrl: string, duration: number, sizeBytes: number, ext: string }) {
        return () => (
            <span class="songLine local flex row" onContextmenu={(event) => handleLocalSongLineRightClick(event, props)}>
                <button class="songPlay" onClick={() => getPlayer()?.playNow(props)}>
                    <img src="./images/player/play.dark.svg"/>
                </button>
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <span class="flex column localInfo">
                    <span class="text ultraSmall grey">{props.ext} | {sizeFormat(props.sizeBytes)}</span>
                    <span class="text ultraSmall songLength">{props.duration === -1 ? '未知时长' : timeFormat(props.duration)}</span>
                </span>
            </span>
        );
    }
});

// 播放列表卡片右键处理
function handlePlaylistLineRightClick(event: MouseEvent, props: any) {
    const menuType = props.id.includes('local_') ? 'playlistLocalItem' : (props.id.includes('playlist_') ? 'playlistItem' : 'song');
    if (event.button === 2) triggerRightMenu(event, props, menuType);
}
// 单行歌曲卡片 (播放列表)
const PlaylistSongLine = defineComponent({
    props: {
        id: String,
        name: String,
        authors: String,
        coverUrl: String,
        duration: Number,
        index: {
            type: Number,
            required: false,
            default: -1
        },
        isCurrent: {
            type: Boolean,
            required: false,
            default: false
        },
        highlightCurrent: {
            type: Boolean,
            required: false,
            default: false
        },
        isHistory: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    setup(props: { id: string, name: string, authors: string, coverUrl: string, duration: number, index: number, isCurrent: boolean, highlightCurrent: boolean, isHistory: boolean }) {
        const dragState = reactive({
            isDragging: false,
            ghostEl: null as HTMLElement | null,
            fromIndex: -1,
            dropIndex: -1
        });

        function handleDragStart(event: MouseEvent, elementIndex: number) {
            if (props.isCurrent || elementIndex < 0) return;
            event.preventDefault();

            const lineEl = (event.currentTarget as HTMLElement).closest('.playlistLine') as HTMLElement;
            if (!lineEl) return;

            dragState.isDragging = true;
            dragState.fromIndex = elementIndex;

            // 隐藏原项目
            lineEl.style.opacity = '0.15';
            lineEl.classList.add('dragging');

            // 创建跟随鼠标的半透明虚影
            const rect = lineEl.getBoundingClientRect();
            const ghost = lineEl.cloneNode(true) as HTMLElement;
            ghost.style.position = 'fixed';
            ghost.style.pointerEvents = 'none';
            ghost.style.opacity = '0.85';
            ghost.style.width = rect.width + 'px';
            ghost.style.zIndex = '114';
            ghost.style.borderRadius = '8px';
            ghost.style.left = rect.left + 'px';
            ghost.style.top = (event.clientY - rect.height / 2) + 'px';
            ghost.style.boxShadow = '0 6px 16px rgba(0,0,0,0.25)';
            ghost.style.transition = 'none';
            document.body.appendChild(ghost);
            dragState.ghostEl = ghost;

            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        }

        function handleDragMove(event: MouseEvent) {
            if (!dragState.isDragging || !dragState.ghostEl) return;

            // 移动虚影
            const ghostHeight = dragState.ghostEl.offsetHeight;
            dragState.ghostEl.style.top = (event.clientY - ghostHeight / 2) + 'px';

            // 选择性自动滚动
            const container = document.getElementById('pageContainer');
            if (container) {
                const scrollThreshold = 60;
                const containerRect = container.getBoundingClientRect();
                if (event.clientY - containerRect.top < scrollThreshold) {
                    container.scrollTop -= 12;
                } else if (containerRect.bottom - event.clientY < scrollThreshold) {
                    container.scrollTop += 12;
                }
            }

            // 检测悬停的目标行, 添加视觉指示
            const playlistLines = document.querySelectorAll('.playlistLine:not(.dragging)');
            let dropIndex = -1;
            playlistLines.forEach((line) => {
                const rect = line.getBoundingClientRect();
                if (event.clientY >= rect.top && event.clientY <= rect.bottom) {
                    dropIndex = parseInt((line as HTMLElement).dataset.index || '-1');
                    (line as HTMLElement).style.borderTop = '2px solid var(--theme-color-default)';
                } else {
                    (line as HTMLElement).style.borderTop = '';
                }
            });
            dragState.dropIndex = dropIndex;
        }

        function handleDragEnd(_event: MouseEvent) {
            if (!dragState.isDragging) return;

            // 移除虚影
            if (dragState.ghostEl) {
                document.body.removeChild(dragState.ghostEl);
                dragState.ghostEl = null;
            }

            // 恢复原项目
            const origLine = document.querySelector(`.playlistLine[data-index="${dragState.fromIndex}"]`) as HTMLElement;
            if (origLine) {
                origLine.style.opacity = '1';
                origLine.classList.remove('dragging');
            }

            // 清除所有视觉指示
            document.querySelectorAll('.playlistLine').forEach((el) => {
                (el as HTMLElement).style.borderTop = '';
            });

            // 执行排序
            if (dragState.dropIndex >= 0 && dragState.dropIndex !== dragState.fromIndex) {
                getPlayer()?.reorderPlaylist(dragState.fromIndex, dragState.dropIndex);
            }

            dragState.isDragging = false;
            dragState.fromIndex = -1;
            dragState.dropIndex = -1;

            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
        }

        return () => {
            const lineClasses = ['playlistLine', 'flex', 'row'];
            if (props.highlightCurrent) lineClasses.push('repeatSingle');
            if (props.isHistory) lineClasses.push('history');
            if (props.isCurrent) lineClasses.push('currentItem');
            return (
            <span class={lineClasses.join(' ')}
                data-index={props.index}
                onContextmenu={(event) => handlePlaylistLineRightClick(event, props)}>
                {props.isCurrent ? (
                    <PlayingIndicator />
                ) : (
                    <div class="dragPoint"
                        onMousedown={(e) => handleDragStart(e, props.index)}
                        style={{cursor: 'grab'}}>
                        <img src="./images/player/drag.svg"/>
                    </div>
                )}
                <img class="songCover" src={props.coverUrl}></img>
                <span class="songInfo flex column">
                    <label class="text small bold">{props.name}</label>
                    <label class="text ultraSmall grey">{props.authors}</label>
                </span>
                <span class="text ultraSmall songLength">{props.duration === -1 ? '未知时长' : timeFormat(props.duration)}</span>
            </span>
        );
        }
    }
});

// 歌手卡片右键点击事件处理
function handleArtistRightClick(event: MouseEvent, props: any) {
    if (event.button === 2) triggerRightMenu(event, props, 'collections');
}
// 歌手卡片
const ArtistCard = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        return () => (
            <span class="artistCard flex column" 
            onClick={() => router.push('/artist/' + props.id)}
            onContextmenu={(event) => handleArtistRightClick(event, props)}>
                <img class="artistCover" src={props.coverUrl}></img>
                <label class="text small">{props.name}</label>
            </span>
        );
    }
});
// 单行歌手卡片
const ArtistLine = defineComponent({
    props: {
        id: String,
        coverUrl: String,
        name: String
    },
    setup(props: { id: string, coverUrl: string, name: string }) {
        return () => (
            <span class="artistLine flex row" 
            onClick={() => {
                hideArtistSelect();
                router.push('/artist/' + props.id);
            }} 
            onContextmenu={(event) => handleArtistRightClick(event, props)}>
                <img class="artistCover" src={props.coverUrl}></img>
                <label class="text small">{props.name}</label>
            </span>
        );
    }
});

export { SonglistCard, SongCard, SongInfoLine, LocalSongLine, PlaylistSongLine, ArtistCard, ArtistLine };
