<script setup lang="ts">
import { onMounted } from 'vue';
import { AccountCard } from '../../assets/widgets/Account';
import './accountsStyle.css';

onMounted(() => {
    console.log('Account.vue loaded');
});
</script>
<template>
    <div class="flex column" id="musicAccounts">
        <div class="flex column" id="accountHeaders">
            <label class="text large bold">音乐平台账户</label>
            <label class="text small">
                部分音乐平台需要用户登录以使用其功能, 请在下面进行登录
            </label>
            <label class="text small">
                建议登录 2 个及以上平台以获得更好的体验
            </label>
            <label class="text small" id="safeNotice">
                Arcanum Music不会向除登录的平台外的任何第三方发送您的数据, &NewLine;
                我们获取到的所有用户数据均在本地加密储存
            </label>
        </div>
        <div class="flex column" id="accountCardContainer">
            <div class="flex column" id="accountCards">
                <AccountCard platform="netease"></AccountCard>
                <AccountCard platform="qqmusic"></AccountCard>
                <AccountCard platform="kuwo"></AccountCard>
                <AccountCard platform="kugou"></AccountCard>
            </div>
        </div>
    </div>
</template>
