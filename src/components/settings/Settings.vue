<script setup lang="ts">
import { createApp, onMounted, ref } from 'vue';

import { AccountCard } from '../../assets/widgets/Account.tsx';
import { HeadersText, NodeBlock, CheckBox, ColorPicker, Slider, TextInput, Dropbox } from '../../assets/widgets/Settings.tsx';

import './settingsStyle.css';
import { buttonTypes, showPopup } from '../../assets/notifications/popup.tsx';
import { showNotify } from '../../assets/notifications/Notification.ts';
import {setConfig} from "../../assets/utilities/configLoader.ts";
import { getThemeConfig, setControlBarTheme, setThemeColor, setWindowBackground, type colorThemeName } from '../../assets/effects/themeControl.ts';
import { runtime } from '../../runtime';

// 璁剧疆椤甸潰鍙婂唴瀹?
let settingsPage, settings: any;
const capabilities = runtime.getCapabilities();

/* 鏍戝舰缁撴瀯缁勪欢鐐瑰嚮 */
// 褰撳墠閫変腑鑺傜偣
let currentPageId = '';

function setCurrentPage(pageId: string) {
    // console.log(`${currentPageId}; ${pageId}`);
    if (currentPageId) {
        let previousCurrent = document.getElementById(`selector.${currentPageId}`);
        let previousCurPage = document.getElementById(currentPageId);

        if (!previousCurrent || !previousCurPage) return;

        previousCurrent.classList.remove('current');
        previousCurPage.classList.remove('current');
    }

    let targetNode = document.getElementById(`selector.${pageId}`);
    if (!targetNode) return;
    targetNode.classList.add('current');

    currentPageId = pageId;
    let currentId = currentPageId.replace('selector.', '')
    let curPage = document.getElementById(currentId);
    if (!curPage) return;
    curPage.classList.add('current');
}
function onNodeClick(event: any) {
    let node = event.target;
    if (node.tagName === 'IMG') node = node.parentNode.parentNode;
    if (node.tagName === 'LABEL') node = node.parentNode;

    let targetId = node.parentNode.id.replace('selector.', '');
    setCurrentPage(targetId);
}

/* 灞曞紑鍒囨崲 */
function toggleExpand(event: any) {
    let node = event.target;
    if (node.tagName === 'IMG') node = node.parentNode;
    if (node.tagName === 'LABEL') node = node.parentNode.childNodes[0];
    
    let treeNode = node.parentNode.parentNode;
    if (!treeNode.classList.contains('expandable')) return;

    let parentNode = node.closest('.treeNode');
    if (parentNode.classList.contains('expanded')) {
        node.classList.remove('expanded');
        parentNode.classList.remove('expanded');
    }
    else {
        node.classList.add('expanded');
        parentNode.classList.add('expanded');
    }
}

// 鍒涘缓椤甸潰
let settingsContent: any; // 璁剧疆鍐呭鍖哄煙
const optionTypes = ['checkbox', 'colorpicker', 'slider', 'textinput', 'dropbox', 'account']; // 璁剧疆椤圭洰绫诲瀷
const decorationTypes = ['info', 'warning', 'image', 'link', 'label']; // 瑁呴グ鍏冪礌绫诲瀷

// 璁剧疆椤甸潰鍒濆鍖?
function setupPage(depth: string[], settingsObject: any) {
    let optionKeys = Object.keys(settingsObject);

    for (let i = 0; i < optionKeys.length; i++) {
        const optionKey = optionKeys[i];
        const optionValue = settingsObject[optionKey];

        depth.push(optionKey);
        if (typeof optionValue !== 'object') {
            let optionId = depth.join('.');
            let element = document.getElementById(optionId) as HTMLInputElement;

            if (!element) continue;

            // 澶嶉€夋 - 閫変腑鐘舵€?
            if (element.getAttribute('type') === 'checkbox') {
                element.checked = optionValue;
            }

            // 棰滆壊閫夋嫨鍣?- 闄勫姞杈撳叆妗?
            if (element.classList.contains('colorpicker')) {
                let nextElement = document.getElementById(`${optionId}_text`) as HTMLInputElement;
                nextElement.value = optionValue;
            }

            // 婊戝姩鏉?- 闄勫姞杈撳叆妗嗙被鍨?& 鑼冨洿闄愬埗
            if (element.classList.contains('slider')) {
                let nextElement = document.getElementById(`${optionId}_text`) as HTMLInputElement;
                nextElement.value = optionValue;

                nextElement.setAttribute('type', 'number');
                nextElement.addEventListener('input', (event) => {
                    let numberElem = event.target as HTMLInputElement;
                    let sliderElem = document.getElementById(numberElem.id.replace('_text', '')) as HTMLInputElement;

                    let curValue = numberElem.value;
                    let minValue = sliderElem.getAttribute('min');
                    let maxValue = sliderElem.getAttribute('max');
                    // console.log(`Value: ${curValue}, Min: ${minValue}, Max: ${maxValue}`);
                    if (minValue && maxValue) {
                        if (curValue < minValue) curValue = minValue;
                        if (curValue > maxValue) curValue = maxValue;
                    }

                    numberElem.value = curValue;
                    sliderElem.value = curValue;
                });
            }

            element.value = optionValue;
        }
        else {
            setupPage(depth, optionValue);
        }
        depth.pop();
    }
}

/**
 * 鏍规嵁椤甸潰鍏冪礌璇诲彇璁剧疆
 * @param pageElement 椤甸潰鍏冪礌
 */
function readSettingsThroughPage(pageElement: HTMLElement) {
    // 鑾峰彇鎵€鏈?<input/> <select/> 鍏冪礌
    const inputs = pageElement.getElementsByTagName('input');
    const optionElems = [...inputs, ...pageElement.getElementsByTagName('select')];

    const settingsObject: any = {};

    function setSettingsValue(parseList: string[], value: any) {
        let targetObject = settingsObject;
        for (let i = 0; i < parseList.length - 1; i++) { // 璁剧疆瀵硅薄缁撴瀯
            const key = parseList[i];
            if (!targetObject[key]) {
                targetObject[key] = {};
            }
            targetObject = targetObject[key];
        }
        targetObject[parseList[parseList.length - 1]] = value;
    }

    optionElems.forEach((element) => {
        const idParseList = element.id.split('.');

        // 鎺掗櫎闄勫睘杈撳叆鎺т欢
        if (element.classList.contains('affiliated')) {
            return;
        }

        if (element.tagName === 'INPUT') {
            if (element.type === 'checkbox') { // 澶嶉€夋
                const checked = element.checked;
                setSettingsValue(idParseList, checked);
            }
            if (element.type === 'color') { // 棰滆壊閫夋嫨
                const color = element.value;
                setSettingsValue(idParseList, color);
            }
            if (element.type === 'range') { // 婊戝姩鏉?
                const value = parseInt(element.value);
                if (!value) {
                    console.error(`[Error] Unknown value on slider detected: ${value} (${element.id})`);
                    return;
                }
                setSettingsValue(idParseList, value);
            }
            if (element.type === 'text') { // 鏂囨湰杈撳叆
                const value = element.value;
                setSettingsValue(idParseList, value);
            }
        }
        if (element.tagName === 'SELECT') { // 涓嬫媺閫夋嫨妗?
            const index = parseInt(element.value);
            setSettingsValue(idParseList, index);
        }
    });

    return settingsObject;
}

// 璁剧疆椤甸潰缁撴瀯
async function setPageStructure(depth: string[], node: any) {
    // 璺宠繃鎹㈣绗?
    if (!node.nodeName || node.nodeName === '#text') return;

    // 鏈骇缁勪欢 - 閰嶇疆鍚庤繑鍥?
    if (optionTypes.includes(node.nodeName)) {
        const targetId = `${depth.join('.')}_container`;
        const widgetId = depth.join('.');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error(`[Error] Widget element #${targetId} not found.`);
            return;
        }

        targetElement.childNodes.forEach((element) => targetElement.removeChild(element));

        // 寮€濮嬭缃厓绱?

        // 璐︽埛鐧诲綍妗?
        if (node.nodeName === 'account') {
            let platform = node.getAttribute('id');

            createApp(AccountCard, { platform: platform }).mount(targetElement);
        }
        // 鍊欓€夋
        else if (node.nodeName === 'checkbox') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                checked: false
            };
            createApp(CheckBox, widgetProps).mount(targetElement);
        }
        // 棰滆壊閫夋嫨鍣?
        else if (node.nodeName === 'colorpicker') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                color: '#0077FF'
            };
            createApp(ColorPicker, widgetProps).mount(targetElement);
        }
        // 婊戝姩鏉?
        else if (node.nodeName === 'slider') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                min: node.getAttribute('min'),
                max: node.getAttribute('max'),
                unit: node.getAttribute('unit'),
                value: node.getAttribute('min'),
            };
            createApp(Slider, widgetProps).mount(targetElement);
        }
        // 鏂囧瓧杈撳叆妗?
        else if (node.nodeName === 'textinput') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                unit: node.getAttribute('unit'),
                value: 'test'
            };
            createApp(TextInput, widgetProps).mount(targetElement);
        }
        // 涓嬫媺閫夋嫨妗?
        else if (node.nodeName === 'dropbox') {
            // 澶勭悊瀛愰」
            const items = node.childNodes;
            let options:  Array<{ id: string, text: string }>= [];
            items.forEach((item: any) => {
                if (item.nodeName === '#text') return;

                options.push({
                    id: item.getAttribute('id'),
                    text: item.innerHTML
                });
            });

            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                options: options
            };
            createApp(Dropbox, widgetProps).mount(targetElement);
        }

        return;
    }
    if (decorationTypes.includes(node.nodeName)) {
        // if (node.nodeName === 'label' || node.nodeName === 'link') console.log(node);
        const targetId = `${depth.join('.')}_container`;
        const widgetId = depth.join('.');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error(`[Error] Widget element #${targetId} not found.`);
            return;
        }

        targetElement.childNodes.forEach((element) => targetElement.removeChild(element));

        // 鎻愮ず / 璀﹀憡淇℃伅
        if (node.nodeName === 'info' || node.nodeName === 'warning') {
            const child = document.createElement('div');
            targetElement.appendChild(child);

            // 璀﹀憡鎻愮ず妗?
            if (node.getAttribute('type') === 'critical') {
                setTimeout(() => {
                    let targetId = `selector.${node.parentNode.getAttribute('id')}`;
                    let targetNode = document.getElementById(targetId);

                    if (targetNode) {
                        targetNode.removeEventListener('click', onNodeClick);

                        targetNode.addEventListener('click', (event) => {
                            let selector = event.target as HTMLElement;
                            if (!selector || !selector.parentNode) return;
                            if (selector.tagName === 'IMG') selector = selector.parentNode.parentNode as HTMLElement;
                            if (selector.tagName === 'LABEL') selector = selector.parentNode as HTMLElement;
                            if (!selector || !selector.parentNode) return;

                            let targetId = (selector.parentNode as HTMLElement).id.replace('selector.', '');
                            if (targetId === currentPageId) return;
                            // 鏄剧ず璀﹀憡寮圭獥
                            showPopup('warning', 'yesno', '璀﹀憡: 鏄惁缁х画?', node.innerHTML, ['', 'red'], (code: number) => {
                                if (code === buttonTypes.BUTTON_YES) {
                                    onNodeClick(event);
                                } else {
                                    console.log('[Arcanum Music - Debug] Page change cancelled');
                                }
                            });
                        });
                    }
                }, 500);

                return;
            }

            const decorationProps = {
                id: widgetId,
                type: node.nodeName,
                level: node.getAttribute('type') || 'normal',
                content: node.innerHTML
            };
            createApp(HeadersText, decorationProps).mount(child);
        }
        // 鍥剧墖
        else if (node.nodeName === 'image') {
            const child = document.createElement('img');
            child.id = node.getAttribute('id');
            child.src = node.getAttribute('src');
            targetElement.appendChild(child);
        }
        // 閾炬帴
        else if (node.nodeName === 'link') {
            const child = document.createElement('a');
            child.id = node.getAttribute('id');
            child.innerHTML = node.getAttribute('text');
            child.href = node.getAttribute('href');
            targetElement.appendChild(child);
        }
        // 鏂囧瓧
        else if (node.nodeName === 'label') {
            const child = document.createElement('label');
            child.id = node.getAttribute('id');
            child.innerHTML = node.getAttribute('text');
            targetElement.appendChild(child);
        }

        return;
    }

    // 闈炴湯绾х粍浠?- 閫掑綊鍒涘缓
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const targetChild = children[i];

        if (targetChild.nodeName === '#text') continue; // 璺宠繃鎹㈣绗?

        // console.log(targetChild);
        // 鍒涘缓瀛愮粍浠?
        const targetMountId = `${depth.join('.')}_children`;
        const childrenContainer = document.getElementById(targetMountId);
        const childrenMountPoint = document.createElement('div');
        childrenContainer?.appendChild(childrenMountPoint);

        if (!childrenContainer) {
            console.error(`[Error] Element #${targetMountId} for widgets to mount not found.`);
            continue;
        }

        depth.push(targetChild.getAttribute('id'));

        const childProps = {
            id: depth.join('.'),
            isSubtitle: true,
            title: targetChild.getAttribute('title')
        };
        createApp(NodeBlock, childProps).mount(childrenMountPoint);
        setPageStructure(depth, targetChild);

        depth.pop();
    }
}

// 缁樺埗椤甸潰鍐呭
async function createPage(prefix: string[], pageXml: any) {
    if (pageXml.nodeName !== 'page') {
        console.error('[Error] Unrecognized page xml structure type: ' + pageXml.nodeName);
        return;
    }

    let depthList = [...prefix, pageXml.getAttribute('id')];
    let pageNode = document.createElement('div');
    pageNode.className = 'contentPage';
    pageNode.id = depthList.join('-');
    settingsContent.appendChild(pageNode);

    const targetSelector = `#${depthList.join('-')}`;
    const pageProps = {
        id: depthList.join('.'),
        isSubtitle: false,
        title: pageXml.getAttribute('name') || ''
    };
    createApp(NodeBlock, pageProps).mount(targetSelector);

    // 鍒涘缓椤甸潰缁撴瀯
    setPageStructure(depthList, pageXml);
}

// 鍔犺浇璁剧疆椤甸潰鏍?
function loadPageTree(pageData: any) {
    const tabs = document.getElementById('settingsTabs') as HTMLElement;

    let initNode = document.getElementById('initialNode') as HTMLElement;
    let pageboxes = pageData.childNodes[0].childNodes;
    let loadedPages: string[] = [];

    for (let i = 0; i < pageboxes.length; i++) {
        const elem = pageboxes[i];
        if (elem.nodeName !== 'pagebox' && elem.nodeName !== 'page') continue;

        let node = initNode.cloneNode(true) as HTMLElement;
        node.id = `selector.${elem.getAttribute('id')}`; // 璁剧疆鑺傜偣ID

        let nodeContent = node.childNodes[0] as HTMLElement;

        (nodeContent.childNodes[1] as HTMLElement).innerText = elem.getAttribute('name'); // 璁剧疆鑺傜偣鏄剧ず鍚嶇О
        // nodeContent.childNodes[1].id = elem.getAttribute('id');

        if (elem.nodeName === 'pagebox') { // 椤甸潰缁?
            node.classList.add('expandable');
            // 娣诲姞鐐瑰嚮灞曞紑瑙﹀彂鍣?(绠ご + 鏂囧瓧)
            nodeContent.childNodes[0].addEventListener('click', toggleExpand);
            nodeContent.childNodes[1].addEventListener('click', toggleExpand);

            let pages = elem.childNodes;
            // 娣诲姞瀛愰〉闈?
            for (let j = 0; j < pages.length; j++) {
                const pageElem = pages[j];

                if (pageElem.nodeName !== 'page') continue;

                const pageNodeId = `${elem.getAttribute('id')}-${pageElem.getAttribute('id')}`;
                let pageNode = node.cloneNode(true) as HTMLElement;
                pageNode.id = `selector.${pageNodeId}`;
                pageNode.classList.remove('expandable');
                let pageContent = pageNode.childNodes[0];

                (pageContent.childNodes[1] as HTMLElement).innerText = pageElem.getAttribute('name');
                pageNode.addEventListener('click', onNodeClick);
                // pageContent.childNodes[1].id = pageElem.getAttribute('id');
                pageNode.removeChild(pageNode.childNodes[1]);

                node.childNodes[1].appendChild(pageNode);

                createPage([elem.getAttribute('id')], pageElem);
                loadedPages.push(pageNodeId);
            }
        }
        else if (elem.nodeName === 'page') { // 椤甸潰
            // 绉婚櫎灞曞紑鎸夐挳
            let expandButton = nodeContent.childNodes[0];
            expandButton.removeChild(expandButton.childNodes[0]);

            // 娣诲姞鐐瑰嚮瑙﹀彂鍣?(鏁翠釜鍏冪礌)
            node.addEventListener('click', onNodeClick);
            node.removeChild(node.childNodes[1]);

            createPage([], elem);

            loadedPages.push(`${elem.getAttribute('id')}`);
        }

        tabs.appendChild(node);

        // console.log(loadedPages);
        setCurrentPage(loadedPages[0]);
    }
}

// 涓㈠純璁剧疆鏇存敼
function discardChanges(_: MouseEvent) {
    setupPage([], settings);
}
// 淇濆瓨璁剧疆鏇存敼
async function saveChanges(_: MouseEvent) {
    const settingsContent = document.getElementById('settingsContent');
    if (!settingsContent) {
        console.error(`[Error] Failed to get settings content`);
        return;
    }

    const modifiedSettings = readSettingsThroughPage(settingsContent);
    settings = modifiedSettings;
    const settingsText = JSON.stringify(modifiedSettings);

    if (runtime.isElectron()) {
        const autoLaunchFlag = settings.generic.system.start.startOnBoot;
        await runtime.setAutoLaunch(autoLaunchFlag);
    }

    const themeList: colorThemeName[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
    const colorIndex = settings.generic.appearance.colors.themeColor;
    const themeColor = themeList[colorIndex];
    const darkEnabled = parseInt(settings.generic.appearance.colors.darkMode);
    const windowBackgroundMode: any = parseInt(settings.generic.appearance.colors.backgroundColor);

    setThemeColor(themeColor, darkEnabled);
    setWindowBackground(windowBackgroundMode);
    refreshModifyImage();

    const showColorInBorders = settings.generic.appearance.colors.showColorInBorders;
    setControlBarTheme(showColorInBorders);

    await runtime.saveConfig(settingsText);
    showNotify('arcanummusic.settings.filemodify', 'success', '设置已保存', '设置文件已保存');
    setConfig(modifiedSettings);
}

// 保存 / 丢弃更改图片路径

// 淇濆瓨 / 涓㈠純鏇存敼鍥剧墖璺緞
const saveButtonImage = ref('./images/fileControl/save.svg');
const discardButtonImage = ref('./images/fileControl/discard.svg');

/**
 * 鏇存柊淇濆瓨 / 涓㈠純鏇存敼鍥剧墖璺緞
 */
function refreshModifyImage() {
    const theme = getThemeConfig();

    saveButtonImage.value = `./images/fileControl/save${theme.darkEnabled ? '.dark' : ''}.svg`;
    discardButtonImage.value = `./images/fileControl/discard${theme.darkEnabled ? '.dark' : ''}.svg`;
}

function applyCapabilityGates() {
    const hiddenTargets = [
        !capabilities.tray ? 'generic.system.start.startOnBoot' : '',
        !capabilities.windowControls ? 'generic.system.start.startMinimized' : '',
        !capabilities.tray ? 'generic.system.closeOptions.hideToTray' : '',
        !capabilities.windowControls ? 'generic.appearance.window.rememberSize' : '',
        !capabilities.windowControls ? 'generic.appearance.window.useSystemFrame' : '',
        !capabilities.windowControls ? 'developerOptions.application.enableDevtoolsHotkey' : '',
        !capabilities.windowControls ? 'developerOptions.application.devtoolsOnLaunched' : ''
    ].filter(Boolean);

    hiddenTargets.forEach((targetId) => {
        const element = document.getElementById(`${targetId}_container`) as HTMLElement | null;
        if (element) {
            element.style.display = 'none';
        }
    });
}

onMounted(async () => {
    settingsContent = document.getElementById('settingsContent') as HTMLElement;

    const pageStructureString: string = await runtime.getSettingsSchema();
    const parser = new DOMParser();
    settingsPage = parser.parseFromString(pageStructureString, 'text/xml');

    const settingsText = await runtime.getConfig();
    settings = JSON.parse(settingsText);

    loadPageTree(settingsPage);
    setupPage([], settings);
    applyCapabilityGates();

    document.addEventListener('click', function (event) {
        const target = event.target as HTMLElement;
        const url = target.getAttribute('href');
        if (target.tagName === 'A' && url) {
            event.preventDefault();
            runtime.openExternal(url);
        }
    });

    refreshModifyImage();

    const darkModeCheckList = window.matchMedia('(prefers-color-scheme:dark)');
    darkModeCheckList.addEventListener('change', () => setTimeout(() => {
        refreshModifyImage();
    }, 100));

    console.log('Settings.vue loaded');
});
</script>

<template>
    <div id="musicSettings">
        <div class="flex column">
            <div class="flex row">
                <!-- 璁剧疆鏍囩椤靛尯鍩?-->
                <div id="settingsTabs" class="tree">
                    <div class="treeNode expandable" id="initialNode">
                        <div class="nodeContent">
                            <i class="nodeExpandButton">
                                <img src="/images/windowControl/treeExpand.svg" class="outlineImage nodeExpandImage" alt="">
                            </i>
                            <label class="nodeLabel">NodeLabel</label>
                        </div>
                        <div class="nodeChildren"></div>
                    </div>
                </div>
                <!-- 璁剧疆鍐呭鍖哄煙 -->
                <div id="settingsContent">
                </div>
            </div>
        </div>

        <!-- 璁剧疆鏇存敼淇濆瓨鍙婁涪寮?-->
        <div class="flex row" id="changesControl">
            <button class="changesOption" id="discardButton" @click="discardChanges">
                <img :src="discardButtonImage" alt="Discard"/>
                <label class="text small bold">涓㈠純</label>
            </button>
            <button class="changesOption" id="saveButton" @click="saveChanges">
                <img :src="saveButtonImage" alt="Save"/>
                <label class="text small bold">淇濆瓨</label>
            </button>
        </div>
        
        <!-- 椤甸潰搴曢儴鍗犱綅 -->
        <div id="settingsBlock"></div>
    </div>
</template>



