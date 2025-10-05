<script setup lang="ts">
import { ref, computed, useSlots } from "vue";

export interface TabItem {
    title: string;
    icon?: string;
}

interface Props {
    id: string;
    tabs: TabItem[];
    scrollOnClick?: boolean;
    useSmallTabs?: boolean;
    onTabSwitch?: (args: { widgetId: string; current: number }) => void;
}
const props = defineProps<Props>();

const currentIndex = ref(0);
const slots = useSlots();

// 获取所有标签页内容
const tabContents = computed(() => {
    return slots.default?.() || [];
});

// 切换标签页
function switchTab(index: number) {
    currentIndex.value = index;

    if (props.scrollOnClick) {
        const container = document.querySelector(`#${props.id}`) as HTMLElement | null;
        const pageElement = document.getElementById('pageContainer') as HTMLElement | null;
        if (container && pageElement) {
            const offset = container.offsetTop - pageElement.scrollTop;
            pageElement.scrollTo({ top: offset, behavior: 'smooth' });
        }
    }

    if (typeof props.onTabSwitch === 'function') {
        props.onTabSwitch({ widgetId: props.id, current: index });
    }
}
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
