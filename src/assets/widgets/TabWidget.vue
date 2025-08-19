<script lang="ts">
import { defineComponent, ref, computed, useSlots } from "vue";

export interface TabItem {
    title: string;
    icon?: string;
}

/**
 * 标签页组件
 */
const TabWidget =  defineComponent({
    name: 'TabWidget',
    props: {
        id: {
            type: String,
            required: true
        },
        tabs: {
            type: Array as () => TabItem[],
            required: true,
            validator: (value: unknown) =>
                Array.isArray(value) && value.every(item =>
                    typeof item === 'object' && 'title' in item
                )
        },
        scrollOnClick: {
            type: Boolean,
            required: false,
            default: false
        },
        useSmallTabs: {
            type: Boolean,
            required: false,
            default: false
        },
        onTabSwitch: {
            type: Function,
            required: false,
            default: () => {}
        }
    },
    setup(props) {
        const currentIndex = ref(0);
        const slots = useSlots();

        // 获取所有标签页内容
        const tabContents = computed(() => {
            return slots.default?.() || [];
        });

        // 切换标签页
        const switchTab = (index: number) => {
            currentIndex.value = index;

            if (props.scrollOnClick) {
                const container = document.querySelector(`#${props.id}`);
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }

            props.onTabSwitch({ widgetId: props.id, current: index });
        };

        return {
            currentIndex,
            tabContents,
            switchTab
        };
    }
});

export default TabWidget;

</script>
<template>
    <div :id="id" class="flex column tabsContainer">
        <!-- 标签页标题区域 -->
        <div class="tabSwitcher flex row">
            <div v-for="(tab, index) in tabs" :key="index" 
                :class="[
                    'flex row tabItem',
                    useSmallTabs ? 'smallTab' : '',
                    { current: currentIndex === index }
                ]" 
                @click="switchTab(index)">
                <!-- 图标 -->
                <img v-if="tab.icon" class="tabIcon" :src="tab.icon"></img>
                <label class="text small bold">{{ tab.title }}</label>
            </div>
        </div>

        <!-- 标签页内容区域 -->
        <div class="tabContent">
            <transition name="switchAnimation" mode="out-in">
                <div :key="currentIndex" class="currentTab">
                    <component :is="tabContents[currentIndex]" />
                </div>
            </transition>
        </div>
    </div>
</template>
