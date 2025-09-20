/**
 * 应用内弹窗功能
 */

import { createApp, defineComponent } from "vue";

// 弹窗按钮返回常量
const buttonTypes = {
    BUTTON_CLOSE: -1,
    BUTTON_OK: 0,
    BUTTON_CANCEL: 1,
    BUTTON_CONFIRM: 2,
    BUTTON_NO: 3,
    BUTTON_YES: 4,
}
const buttonTexts = ['OK', '取消', '确认', '否', '是'];

const options: { [key: string]: number[] } = {
    'notice': [buttonTypes.BUTTON_OK],
    'confirm': [buttonTypes.BUTTON_CANCEL, buttonTypes.BUTTON_CONFIRM],
    'yesno': [buttonTypes.BUTTON_NO, buttonTypes.BUTTON_YES],
    'yesnoCancel': [buttonTypes.BUTTON_CANCEL, buttonTypes.BUTTON_NO, buttonTypes.BUTTON_YES],
    'cancel': [buttonTypes.BUTTON_CANCEL]
}
const PopupOptions = defineComponent({
    props: {
        type: String,
        highlights: Array<string>,
        callback: Function,
    },
    setup(props: { type: string, highlights: string[], callback: Function }) {
        return () => (
            <div class="popupOptions flex row">
                {options[props.type].map((option, index) => (
                    <button class={`popupButton text small ${ props.highlights[index] || '' }`} onClick={() => props.callback(option)}>
                        {buttonTexts[option]}
                    </button>
                ))}
            </div>
        );
    }
});

// 弹窗关闭时回调
function closePopup(code: number, callback: Function) {
    // 关闭弹窗
    let popup = document.getElementById("popupWindow");
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => {
            popup.remove();

            // 隐藏弹窗背景
            let popupArea = document.getElementById('popupArea') as HTMLDivElement;
            if (popupArea) {
                popupArea.classList.remove('show');
            }
        }, 500);

        callback(code);
    }
}

// 显示弹窗
type popupType = 'success' | 'info' | 'warning' | 'error';
type optionType = 'notice' | 'confirm' | 'yesno' | 'yesnoCancel' | 'cancel';
function showPopup(type: popupType, optionsType: optionType, title: string, content: string, highlights: string[], callback: Function) {
    let popupArea = document.getElementById('popupArea') as HTMLDivElement;
    if (popupArea) {
        let popup = createApp(PopupWindow, {
            type: type,
            optionsType: optionsType,
            title: title,
            content: content,
            highlights: highlights,
            callback: callback
        });
        popup.mount(popupArea);

        popupArea.classList.add('show');
    }
}

/**
 * 弹窗组件
 * 
 * @param type 弹窗类型
 * - `info`: 信息提示
 * - `error`: 错误提示
 * - `warning`: 警告提示
 * - `success`: 成功提示
 * 
 * @param optionsType 弹窗按钮类型
 * - `notice`: ['OK']
 * - `confirm`: ['取消', '确认']
 * - `yesno`: ['否', '是']
 * - `yesnoCancel`: ['取消', '否', '是']
 * - `cancel`: ['取消']
 * 
 * @param title 弹窗标题
 * @param content 弹窗内容
 * @param highlights 弹窗按钮高亮
 * `highlights` 参数:
 * - 传入的数组长度必须和 `optionsType` 对应的按钮数量一致
 * - 列表中的第 `i` 项对应第 `i` 个按钮的高亮颜色 (若为默认则留空)
 * - 支持的值: 
 *   - `red`: 红色高亮
 *   - `green`: 绿色高亮
 *   - `''`: 默认无高亮
 */
const PopupWindow = defineComponent({
    props: {
        type: String,
        optionsType: String,
        title: String,
        content: String,
        highlights: Array<string>,
        callback: Function
    },
    setup(props: { type: string, optionsType: string, title: string, content: string, highlights: string[], callback: Function }) {
        // 配置好后显示弹窗
        setTimeout(() => {
            let popup = document.getElementById("popupWindow");
            if (popup) {
                popup.classList.add('show');
            }
        }, 200);

        return () => (
            <div class="popup flex column" id="popupWindow">
                <div class="popupTitle flex row">
                    <img class="popupIcon" src={`./images/notification/${props.type}.svg`} />
                    <label class="popupLabel text medium bold">{props.title}</label>
                    <button class="popupClose" onClick={
                        () => {closePopup(buttonTypes.BUTTON_CLOSE, props.callback)}
                    }>
                        <img src="./images/windowControl/close.svg"/>
                    </button>
                </div>
                <div class="popupContent text ultraSmall" innerHTML={props.content}></div>
                <PopupOptions type={props.optionsType} highlights={props.highlights} callback={
                    (code: number) => {closePopup(code, props.callback)}
                } />
            </div>
        );
    }
});

export { 
    buttonTypes, 
    showPopup,
    closePopup 
};
