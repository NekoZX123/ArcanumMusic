import { defineComponent } from "vue";
import { changePage, getCurrentPage } from "../utilities/pageSwitcher";

// 页面挂载切换器
function onTabChange(event: any) {
    let target = event.target;
    let currentPage = getCurrentPage();
    if (event.target.tagName === 'IMG' || event.target.tagName === 'LABEL') target = event.target.parentElement;
    if (target.id !== currentPage) {
        changePage(target.id);
    }
}

const PageButton = defineComponent({
    props: {
        id: String,
        icon: String,
        text: String
    },
    setup(props: { id: string, icon: string, text: string }) {
        return () => (
            <button class="pageButton" id={props.id} onClick={onTabChange}>
                <img class="pageSwitcherImg" src={props.icon}></img>
                <label class="text small">{props.text}</label>
            </button>
        );
    }
});

export { PageButton };
