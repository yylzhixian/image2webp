<script setup lang="ts">
import ImageBox from '../ImageBox/index.vue';

defineProps<{
    imageRatio: number,
    original: { uri: string, size: string, loading: boolean },
    webp: { uri: string, size: string, loading: boolean },
}>();
</script>

<template>
    <div class="img-row">
        <ImageBox class="img-item" title="Original" :imageRatio="imageRatio" :uri="original.uri" :size="original.size"
            :loading="original.loading" />
        <ImageBox class="img-item" title="WebP" :imageRatio="imageRatio" :uri="webp.uri" :size="webp.size" :loading="webp.loading" />
    </div>
</template>

<style scoped>
.img-row {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
}

.img-item {
    width: 49%;
}

.gap {
    width: 30px;
}
</style>