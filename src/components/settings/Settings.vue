<script setup lang="ts">
import { onMounted } from 'vue';

import { AccountCard } from '../../assets/widgets/Account.tsx';
import { HeadersText, NodeTitle, NodeSubTitle, CheckBox, ColorPicker, Slider, TextInput, Dropbox } from '../../assets/widgets/Settings.tsx';

import './settingsStyle.css';

/* 树形结构组件点击 */
// 当前选中节点
var currentPageId = '';
var firstPageId = '';

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
var paraTitle: HTMLElement; // 标题 & 子标题
var settingsContent: any; // 设置内容区域
const optionTypes = ['checkbox', 'colorpicker', 'slider', 'textinput', 'dropbox']; // 设置项目类型
const decorationTypes = ['image', 'link', 'label']; // 装饰元素类型
var optionElements: any = {
    'checkbox': null,
    'colorpicker': null,
    'slider': null,
    'textinput': null,
    'dropbox': null
}; // 设置元素模板
var decorationElements: any = {
    'image': null,
    'link': null,
    'label': null
}; // 装饰元素模板


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

// 获取节点结构
function getNodeStructure(depth: string[], node: any) {
    // 换行符 - 跳过
    if (!node.nodeName) return;

    // 末级组件 - 配置后返回
    // 设置项目
    if (optionTypes.includes(node.nodeName)) {
        // 选择设置项目类型
        let optionElem, optionId, subItems;
        
        optionElem = optionElements[node.nodeName].cloneNode(true); // 创建新设置元素
        optionElem.id = '';
        depth.push(node.getAttribute('id'));
        optionId = depth.join('.');
        // console.log(optionId);
        subItems = optionElem.childNodes;

        // 设置输入控件参数
        subItems[0].setAttribute('for', optionId);
        subItems[0].innerText = node.getAttribute('text');
        subItems[1].setAttribute('id', optionId);
        subItems[1].setAttribute('name', optionId);
        if (node.nodeName === 'slider' || node.nodeName === 'colorpicker') {
            subItems[2].setAttribute('id', `${optionId}_text`);
            subItems[2].setAttribute('name', `${optionId}_text`);

            // 绑定输入框与滑动条
            subItems[1].addEventListener('input', () => {
                subItems[2].value = subItems[1].value;
            });
            subItems[2].addEventListener('input', () => {
                subItems[1].value = subItems[2].value;
            });

            depth.pop();
        }

        // 特例
        if (node.nodeName === 'slider') { // 滑动条 - 最值 & 单位 & 绑定文本输入设置
            subItems[1].min = node.getAttribute('min');
            subItems[1].max = node.getAttribute('max');
            subItems[3].innerText = node.getAttribute('unit');
        }
        if (node.nodeName === 'dropbox') { // 下拉选择框 - 添加选项
            let dropOptions = node.childNodes;
            let dropboxMain = subItems[1];
            for (let i = 0; i < dropOptions.length; i++) { // 添加下拉选项
                let dropOpt = dropOptions[i];
                
                if (dropOpt.nodeName !== 'item') continue; // 跳过换行符

                let optionNode = document.createElement('option');
                optionNode.value = dropOpt.getAttribute('id');
                optionNode.innerText = dropOpt.getAttribute('text');

                dropboxMain.appendChild(optionNode);
            }
        }
        
        return optionElem;
    }

    // 装饰项目
    if (decorationTypes.includes(node.nodeName)) {
        let optionElem = decorationElements[node.nodeName].cloneNode(true); // 创建新设置元素
        optionElem.id = node.getAttribute('id');

        // 链接
        if (node.nodeName === 'link') {
            optionElem.href = node.getAttribute('href');
            optionElem.innerHTML = node.getAttribute('text');
        }

        // 应用图标
        if (node.getAttribute('id') === 'appIcon') {
            optionElem.src = '/AppIcon/Icon_transparent.png';
        }

        // 文字
        if (node.nodeName === 'label') {
            optionElem.innerHTML = node.getAttribute('text').replace(/NekoZX/g, '<b>NekoZX</b>');
        }

        return optionElem;
    }

    // 非末级组件 - 递归配置子节点
    depth.push(node.getAttribute('id'));
    let optionBlock = document.createElement('div');
    optionBlock.id = depth.join('.');
    for (let i = 0; i < node.childNodes.length; i++) {
        const subnode = node.childNodes[i];

        if (subnode.nodeName === '#text') continue; // 跳过换行符

        if (subnode.nodeName === 'node') { // 添加段落子标题
            let subtitleNode = document.createElement('span');
            subtitleNode.className = 'paragraphSubtitle';
            subtitleNode.innerText = subnode.getAttribute('title');
            optionBlock.appendChild(subtitleNode);
        }

        let children = getNodeStructure([...depth], subnode); // 递归创建子节点
        if (children) {
            optionBlock.appendChild(children);
        }
    }
    depth.pop();

    return optionBlock;
}

// 绘制页面内容
function createPage(prefix: string[], pageXml: any) {
    if (pageXml.nodeName !== 'page') {
        console.error('[Cube Widgets - Error] Unrecognized page xml structure type: ' + pageXml.nodeName);
        return;
    }

    let depthList = [...prefix, pageXml.getAttribute('id')];
    let parts = pageXml.childNodes;
    let pageNode = document.createElement('div');
    pageNode.className = 'contentPage';
    pageNode.id = pageXml.getAttribute('id');

    // 创建页面各部分
    for (let i = 0; i < parts.length; i++) {
        let node = parts[i];

        if (node.nodeName !== 'node') continue; // 跳过换行符

        // 设置段落标题
        depthList.push(node.getAttribute('id'));
        let partNode = document.createElement('div');
        let partTitle = paraTitle.cloneNode(true) as HTMLElement;
        partTitle.id = `${depthList.join('.')}_title`;
        partTitle.innerText = node.getAttribute('title');

        partNode.appendChild(partTitle);
        partNode.appendChild(getNodeStructure(depthList.slice(0, depthList.length - 1), node));

        pageNode.appendChild(partNode);

        depthList.pop();
    }

    settingsContent.appendChild(pageNode);
}

// 加载设置页面树
function loadPageTree(pageData: any) {
    const tabs = document.getElementById('settingsTabs') as HTMLElement;

    let initNode = document.getElementById('initialNode') as HTMLElement;
    let pageboxes = pageData.childNodes[0].childNodes;
    let loadedPages = 0;

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

                let pageNode = node.cloneNode(true) as HTMLElement;
                pageNode.id = `selector.${pageElem.getAttribute('id')}`;
                pageNode.classList.remove('expandable');
                let pageContent = pageNode.childNodes[0];

                (pageContent.childNodes[1] as HTMLElement).innerText = pageElem.getAttribute('name');
                pageNode.addEventListener('click', onNodeClick);
                // pageContent.childNodes[1].id = pageElem.getAttribute('id');
                pageNode.removeChild(pageNode.childNodes[1]);

                node.childNodes[1].appendChild(pageNode);

                createPage([elem.getAttribute('id')], pageElem);
                loadedPages++;
            }
        }
        else if (elem.nodeName === 'page') { // 页面
            // 添加点击触发器 (整个元素)
            node.addEventListener('click', onNodeClick);
            node.removeChild(node.childNodes[1]);

            createPage([], elem);

            loadedPages++;
        }

        tabs.appendChild(node);

        if (loadedPages === 1) {
            firstPageId = elem.getAttribute('id');
            setCurrentPage(firstPageId);
        }
    }
}

onMounted(async () => {
    let settingsPage;

    const pageReader = new XMLHttpRequest();
    let appEnv = await window.electron.getAppEnvironment(), asarPath = '';
    if (appEnv !== 'dev') {
        asarPath = await window.electron.getAsarLocation();
        asarPath += '/dist';
    }
    pageReader.open('GET', `${asarPath}/data/AppSettings.xml`, false);
    pageReader.overrideMimeType('text/xml;charset=UTF-8');
    pageReader.send(null);
    settingsPage = pageReader.responseXML;

    console.log(settingsPage);

    loadPageTree(settingsPage);
    setupPage([], window.electron.getAppConfig());

    console.log('Settings.vue loaded');
});
</script>

<template>
    <div class="flex row" id="musicSettings">
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
            <div class="contentPage" id="samplePage">
                <HeadersText type="info" level="normal" content="提示信息"></HeadersText>
                <HeadersText type="info" level="stressed" content="提示信息 (强调)"></HeadersText>
                <HeadersText type="warning" level="normal" content="警告信息"></HeadersText>

                <NodeTitle id="sampleTitle" title="标题"></NodeTitle>
                <NodeSubTitle id="sampleSubTitle" title="子标题"></NodeSubTitle>

                <CheckBox id="sampleCheckbox" name="复选框" :checked="true"></CheckBox>

                <ColorPicker id="sampleColorPicker" name="颜色选择器" color="#0088FF"></ColorPicker>

                <Slider id="sampleSlider" name="滑动条" :min="0" :max="100" unit="%" :value="50"></Slider>

                <TextInput id="sampleTextInput" name="文本输入框" value="114514"></TextInput>

                <Dropbox id="sampleDropbox" name="下拉选择框" :options="[]"></Dropbox>

                <AccountCard id="sampleAccount" platform="netease" avatar="/images/library/defaultAvatar.svg" user="未登录"></AccountCard>

                <img class="image" id="sampleImage">
                <a class="link" id="sampleLink" target="_blank">11111</a>
                <label class="label" id="sampleLabel">114514</label>
            </div>
        </div>
    </div>
</template>
