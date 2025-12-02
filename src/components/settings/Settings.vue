<script setup lang="ts">
import { createApp, onMounted } from 'vue';

import { AccountCard } from '../../assets/widgets/Account.tsx';
import { HeadersText, NodeBlock, CheckBox, ColorPicker, Slider, TextInput, Dropbox } from '../../assets/widgets/Settings.tsx';

import './settingsStyle.css';
import { buttonTypes, showPopup } from '../../assets/notifications/popup.tsx';
import { showNotify } from '../../assets/notifications/Notification.ts';
import {setConfig} from "../../assets/utilities/configLoader.ts";
import { setControlBarTheme, setThemeColor, setWindowBackground, type colorThemeName } from '../../assets/utilities/themeControl.ts';

// 设置页面及内容
let settingsPage, settings: any;

/* 树形结构组件点击 */
// 当前选中节点
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

/* 展开切换 */
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

// 创建页面
let settingsContent: any; // 设置内容区域
const optionTypes = ['checkbox', 'colorpicker', 'slider', 'textinput', 'dropbox', 'account']; // 设置项目类型
const decorationTypes = ['info', 'warning', 'image', 'link', 'label']; // 装饰元素类型

// 设置页面初始化
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

            // 复选框 - 选中状态
            if (element.getAttribute('type') === 'checkbox') {
                element.checked = optionValue;
            }

            // 颜色选择器 - 附加输入框
            if (element.classList.contains('colorpicker')) {
                let nextElement = document.getElementById(`${optionId}_text`) as HTMLInputElement;
                nextElement.value = optionValue;
            }

            // 滑动条 - 附加输入框类型 & 范围限制
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

// 读取当前设置
function readCurrentSettings(depth: string[], originalSettings: any) {
    let optionKeys = Object.keys(originalSettings);
    let modifiedSettings: { [type: string]: any } = {};

    for (let i = 0; i < optionKeys.length; i++) {
        const optionKey = optionKeys[i];
        const optionValue = originalSettings[optionKey];

        depth.push(optionKey);
        if (typeof optionValue !== 'object') {
            let optionId = depth.join('.');
            let element = document.getElementById(optionId) as HTMLInputElement;

            if (!element) continue;

            // 复选框 - 选中状态
            if (element.getAttribute('type') === 'checkbox') {
                modifiedSettings[optionKey] = element.checked;
            }
            // 颜色选择器 - 附加输入框
            else if (element.classList.contains('colorpicker')) {
                let colorInputBox = document.getElementById(`${optionId}_text`) as HTMLInputElement;
                modifiedSettings[optionKey] = colorInputBox.value;
            }
            // 滑动条 - 附加输入框类型 & 范围限制
            else if (element.classList.contains('slider')) {
                let sliderInputBox = document.getElementById(`${optionId}_text`) as HTMLInputElement;
                modifiedSettings[optionKey] = sliderInputBox.value;
            }
            else {
                modifiedSettings[optionKey] = element.value;
            }
        }
        else {
            modifiedSettings[optionKey] = readCurrentSettings(depth, optionValue);
        }
        depth.pop();
    }

    return modifiedSettings;
}

// 设置页面结构
async function setPageStructure(depth: string[], node: any) {
    // 跳过换行符
    if (!node.nodeName || node.nodeName === '#text') return;

    // 末级组件 - 配置后返回
    if (optionTypes.includes(node.nodeName)) {
        const targetId = `${depth.join('.')}_container`;
        const widgetId = depth.join('.');
        const targetElement = document.getElementById(targetId);

        if (!targetElement) {
            console.error(`[Error] Widget element #${targetId} not found.`);
            return;
        }

        targetElement.childNodes.forEach((element) => targetElement.removeChild(element));

        // 开始设置元素

        // 账户登录框
        if (node.nodeName === 'account') {
            let platform = node.getAttribute('id');

            createApp(AccountCard, { platform: platform }).mount(targetElement);
        }
        // 候选框
        else if (node.nodeName === 'checkbox') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                checked: false
            };
            createApp(CheckBox, widgetProps).mount(targetElement);
        }
        // 颜色选择器
        else if (node.nodeName === 'colorpicker') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                color: '#0077FF'
            };
            createApp(ColorPicker, widgetProps).mount(targetElement);
        }
        // 滑动条
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
        // 文字输入框
        else if (node.nodeName === 'textinput') {
            const widgetProps = {
                name: node.getAttribute('text'),
                id: widgetId,
                unit: node.getAttribute('unit'),
                value: 'test'
            };
            createApp(TextInput, widgetProps).mount(targetElement);
        }
        // 下拉选择框
        else if (node.nodeName === 'dropbox') {
            // 处理子项
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

        // 提示 / 警告信息
        if (node.nodeName === 'info' || node.nodeName === 'warning') {
            const child = document.createElement('div');
            targetElement.appendChild(child);

            // 警告提示框
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
                            // 显示警告弹窗
                            showPopup('warning', 'yesno', '警告: 是否继续?', node.innerHTML, ['', 'red'], (code: number) => {
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
        // 图片
        else if (node.nodeName === 'image') {
            const child = document.createElement('img');
            child.id = node.getAttribute('id');
            child.src = node.getAttribute('src');
            targetElement.appendChild(child);
        }
        // 链接
        else if (node.nodeName === 'link') {
            const child = document.createElement('a');
            child.id = node.getAttribute('id');
            child.innerHTML = node.getAttribute('text');
            child.href = node.getAttribute('href');
            targetElement.appendChild(child);
        }
        // 文字
        else if (node.nodeName === 'label') {
            const child = document.createElement('label');
            child.id = node.getAttribute('id');
            child.innerHTML = node.getAttribute('text');
            targetElement.appendChild(child);
        }

        return;
    }

    // 非末级组件 - 递归创建
    const children = node.childNodes;
    for (let i = 0; i < children.length; i++) {
        const targetChild = children[i];

        if (targetChild.nodeName === '#text') continue; // 跳过换行符

        // console.log(targetChild);
        // 创建子组件
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

// 绘制页面内容
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

    // 创建页面结构
    setPageStructure(depthList, pageXml);
}

// 加载设置页面树
function loadPageTree(pageData: any) {
    const tabs = document.getElementById('settingsTabs') as HTMLElement;

    let initNode = document.getElementById('initialNode') as HTMLElement;
    let pageboxes = pageData.childNodes[0].childNodes;
    let loadedPages: string[] = [];

    for (let i = 0; i < pageboxes.length; i++) {
        const elem = pageboxes[i];
        if (elem.nodeName !== 'pagebox' && elem.nodeName !== 'page') continue;

        let node = initNode.cloneNode(true) as HTMLElement;
        node.id = `selector.${elem.getAttribute('id')}`; // 设置节点ID

        let nodeContent = node.childNodes[0] as HTMLElement;

        (nodeContent.childNodes[1] as HTMLElement).innerText = elem.getAttribute('name'); // 设置节点显示名称
        // nodeContent.childNodes[1].id = elem.getAttribute('id');

        if (elem.nodeName === 'pagebox') { // 页面组
            node.classList.add('expandable');
            // 添加点击展开触发器 (箭头 + 文字)
            nodeContent.childNodes[0].addEventListener('click', toggleExpand);
            nodeContent.childNodes[1].addEventListener('click', toggleExpand);

            let pages = elem.childNodes;
            // 添加子页面
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
        else if (elem.nodeName === 'page') { // 页面
            // 移除展开按钮
            let expandButton = nodeContent.childNodes[0];
            expandButton.removeChild(expandButton.childNodes[0]);

            // 添加点击触发器 (整个元素)
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

// 丢弃设置更改
function discardChanges(_: MouseEvent) {
    setupPage([], settings);
}
// 保存设置更改
function saveChanges(_: MouseEvent) {
    const modifiedSettings = readCurrentSettings([], settings);
    settings = modifiedSettings;
    const settingsText =  JSON.stringify(modifiedSettings);
    
    window.electron.getAppData()
        .then((appDataPath: string) => {
            // 部分设置立即生效
            // 开机自启
            const autoLaunchFlag = settings.generic.system.start.startOnBoot;
            window.electron.setAutoLaunch(autoLaunchFlag);

            // 颜色主题及深色模式
            const themeList: colorThemeName[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
            const colorIndex = settings.generic.appearance.colors.themeColor;
            const themeColor = themeList[colorIndex];
            const darkEnabled = parseInt(settings.generic.appearance.colors.darkMode);
            const windowBackgroundMode: any = parseInt(settings.generic.appearance.colors.backgroundColor);
            setThemeColor(themeColor, darkEnabled !== 0);
            setWindowBackground(windowBackgroundMode);

            // 窗口标题栏显示主题色
            const showColorInBorders = settings.generic.appearance.colors.showColorInBorders;
            setControlBarTheme(showColorInBorders);

            // 保存设置文件
            console.log(appDataPath);
            const targetFile = `${appDataPath}/ArcanumMusic_data/settings.json`;

            window.electron.writeLocalFile(targetFile, settingsText);

            showNotify('arcanummusic.settings.filemodify', 'success', '设置已保存', '设置文件已保存');

            // 重新加载设置文件
            setConfig(modifiedSettings);
        });
}

onMounted(async () => {
    settingsContent = document.getElementById('settingsContent') as HTMLElement;

    // 获取设置页面
    let appEnv = await window.electron.getAppEnvironment();
    let asarPath = await window.electron.getAsarLocation();
    if (appEnv === 'dev') {
        asarPath += '/public';
    }
    else {
        asarPath += '/dist';
    }
    const pagePath = `${asarPath}/data/AppSettings.xml`;
    const pageStructureString: string = await window.electron.readLocalFile(pagePath);
    const parser = new DOMParser();
    settingsPage = parser.parseFromString(pageStructureString, 'text/xml');
    // console.log(settingsPage);

    // 读取设置内容
    const settingsText = await window.electron.getAppConfig();
    settings = JSON.parse(settingsText);

    loadPageTree(settingsPage);
    setupPage([], settings);

    // 浏览器打开 <a> 标签
    document.addEventListener('click', function (event) {
        const target = event.target as HTMLElement;
        const url = target.getAttribute('href');
        if (target.tagName === 'A' && url) {
            event.preventDefault();
            window.electron.openExternal(url);
        }
    });

    console.log('Settings.vue loaded');
});
</script>

<template>
    <div id="musicSettings">
        <div class="flex column">
            <div class="flex row">
                <!-- 设置标签页区域 -->
                <div id="settingsTabs" class="tree">
                    <div class="treeNode expandable" id="initialNode">
                        <div class="nodeContent">
                            <i class="nodeExpandButton">
                                <img src="/images/windowControl/treeExpand.svg" class="nodeExpandImage" alt="">
                            </i>
                            <label class="nodeLabel">NodeLabel</label>
                        </div>
                        <div class="nodeChildren"></div>
                    </div>
                </div>
                <!-- 设置内容区域 -->
                <div id="settingsContent">
                </div>
            </div>
        </div>

        <!-- 设置更改保存及丢弃 -->
        <div class="flex row" id="changesControl">
            <button class="changesOption" id="discardButton" @click="discardChanges">
                <img src="/images/fileControl/discard.svg" alt="Discard"/>
                <label class="text small bold">丢弃</label>
            </button>
            <button class="changesOption" id="saveButton" @click="saveChanges">
                <img src="/images/fileControl/save.svg" alt="Save"/>
                <label class="text small bold">保存</label>
            </button>
        </div>
        
        <!-- 页面底部占位 -->
        <div id="settingsBlock"></div>
    </div>
</template>
