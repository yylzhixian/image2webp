<script setup lang="ts">
defineProps({
    title: String,
    uri: String,
    size: String,
    imageRatio: {
        type: Number,
        default: 1,
    },
    loading: {
        type: Boolean,
        default: false,
    },
});
</script>

<template>
    <div>
        <h4>{{title}}</h4>
        <div v-if="loading" class="loading" :style="{paddingBottom:`${imageRatio*100}%`}" />
        <template v-else>
            <img :src="uri" :alt="title">
            <span>{{size}}</span>
        </template>
    </div>
</template>

<style scoped>
div {
    display: flex;
    flex-direction: column;
    align-items: center;
}

h4 {
    margin: 0 0 10px;
    user-select: none;
}

.loading {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
}

.loading::after {
    position: absolute;
    top: 50%;
    left: 50%;
    content: '';
    width: 80%;
    height: 80%;
    background: url(../../imgs/loading.svg) no-repeat center;
    background-size: 50%;
    transform: translate(-50%, -50%);
    animation: rotate 1.5s linear infinite forwards;
}

@keyframes rotate {
    from {
        transform: translate(-50%, -50%) rotate(0deg);
    }

    to {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

img {
    position: relative;
    width: 100%;
}

img::after {
    position: absolute;
    top: 0;
    left: 0;
    overflow: hidden;
    content: 'Not Found';
    width: 100%;
    padding-top: calc(80% - 39px);
    background: url(../../imgs/404.svg) no-repeat center;
    background-size: 50%;
    text-align: center;
    font-size: 30px;
    white-space: nowrap;
    text-overflow: ellipsis;
}

img,
img::before,
img::after,
.loading {
    background-color: #ddd;
}

span {
    margin-top: 10px;
}
</style>