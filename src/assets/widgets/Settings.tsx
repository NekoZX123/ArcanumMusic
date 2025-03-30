import { defineComponent } from "vue";

// 页首提示文字
const HeadersText = defineComponent({
    props: {
        id: String,
        type: String,
        level: String,
        content: String
    },
    setup(props: { id: string, type: string, level: String, content: string }) {
        const className = `${props.type}Text ${props.level} text small`;
        return () => (
            <span class={className} id={props.id}>{props.content}</span>
        );
    }
});

// 页面标题
const NodeTitle = defineComponent({
    props: {
        title: String
    },
    setup(props: { title: string }) {
        return () => (
            <span class="paragraphTitle text large bold">{props.title}</span>
        );
    }
});

// 页面副标题
const NodeSubTitle = defineComponent({
    props: {
        title: String
    },
    setup(props: { title: string }) {
        return () => (
            <span class="paragraphSubtitle text medium">{props.title}</span>
        );
    }
});

// 复选框
const CheckBox = defineComponent({
    props: {
        name: String,
        id: String,
        checked: Boolean,
    },
    setup(props: { name: string, id: string, checked: boolean }) {
        return () =>(
            <span class="checkboxElement optionBox" id={`${props.id}_container`}>
                <label class="optionName" for={props.id}>{props.name}</label>
                <input name="checkbox" class="switchbox" type="checkbox" id={props.id} value={props.checked}/>
            </span>
        );
    }
});

// 颜色选择器
const ColorPicker = defineComponent({
    props: {
        name: String,
        id: String,
        color: String,
    },
    setup(props: { name: string, id: string, color: string }) {
        let afInputId = `${props.id}_text`;
        return () => (
            <span class="colorpickerElement optionBox" id={`${props.id}_container`}>
                <label class="optionName" for={props.id}>{props.name}</label>
                <input name="colorpicker" class="colorpicker" type="color" id={props.id} value={props.color}/>
                <input name="colorpicker_text" class="textinput affiliated" type="text"
                    id={afInputId} value={props.color}/>
            </span>
        );
    }
});

// 滑动条
const Slider = defineComponent({
    props: {
        name: String,
        id: String,
        min: Number,
        max: Number,
        unit: String,
        value: Number
    },
    setup(props: { name: string, id: string, min: number, max: number, unit: string, value: number }) {
        let afInputId = `${props.id}_text`;
        return () => (
            <span class="sliderElement optionBox" id={`${props.id}_container`}>
                <label class="optionName" for={props.id}>{props.name}</label>
                <input name="slider" class="slider" type="range" id={props.id} 
                    min={props.min} max={props.max} step="1" value={props.value}/>
                <input name="slider_text" class="textinput affiliated" type="text" id={afInputId}
                    value={props.value}/>
                <label class="optionUnit">{props.unit}</label>
            </span>
        );
    }
});

// 文字输入框
const TextInput = defineComponent({
    props: {
        name: String,
        id: String,
        value: String
    },
    setup(props: { name: string, id: string, value: string }) {
        return () => (
            <span class="textinputElement optionBox" id={`${props.id}_container`}>
                <label class="optionName" for={props.id}>{props.name}</label>
                <input name="textinput" class="textinput" type="text" id={props.id} value={props.value}/>
            </span>
        );
    }
});

// 下拉选择框
const Dropbox = defineComponent({
    props: {
        name: String,
        id: String,
        options: Array
    },
    setup(props: { name: string, id: string, options: Array<any> }) {
        return () => (
            <span class="dropboxElement optionBox" id={`${props.id}_container`}>
                <label class="optionName" for={props.id}>{props.name}</label>
                <select name="dropbox" class="dropbox" id={props.id}>
                    {props.options.map((option: { id: string, text: string }) => (
                        <option value={option.id}>{option.text}</option>
                    ))}
                </select>
            </span>
        );
    }
});

export {
    HeadersText, 
    NodeTitle, 
    NodeSubTitle, 
    CheckBox, 
    ColorPicker, 
    Slider, 
    TextInput, 
    Dropbox 
};
