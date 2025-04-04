<script setup lang="ts" name="Notification">
import { defineProps, onMounted, ref } from 'vue';

const props = defineProps({
    type: {
        type: String,
        required: false,
        default: 'info'
    },
    id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: false,
        default: 'Notification'
    },
    content: {
        type: String,
        required: false,
        default: 'This is a notification message.'
    },
    duration: {
        type: Number,
        required: false,
        default: 3000
    }
});

var timer = props.duration;
var countdown = ref(`width: 100%`);

onMounted(() => {
    // 定时器
    setInterval(() => {
        timer -= 10;
        countdown.value = `width: ${timer / props.duration * 100}%`;
    }, 10);
});
</script>

<template>
    <div :class="`notification ${props.type} flex column`" :id="props.id">
        <div class="notifyContainer flex row">
            <span class="notifyIcon">
                <img :src="`/images/notification/${props.type}.svg`" />
            </span>
            <span class="notifyContent flex column">
                <span class="text small bold">{{ props.title }}</span>
                <span class="text ultraSmall">{{ props.content }}</span>
            </span>
            <span class="notifyClose">
                <img src="/images/windowControl/close.svg" />
            </span>
        </div>
        <div class="notifyCountDown">
            <div class="countDownBar" :style="countdown"></div>
        </div>
    </div>
</template>
