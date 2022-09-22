<template>
    <h2>
        <slot />
    </h2>
</template>
<style scoped>
h2 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    user-select: none;
}
</style>