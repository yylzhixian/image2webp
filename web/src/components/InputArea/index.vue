<script setup lang="ts">
import { ref } from 'vue';
import { DEFUALT_QUALITY } from '../../utilities/constant';

interface VscodeTextFieldEvent extends InputEvent {
    target: HTMLInputElement
}

defineProps({
    enabled: {
        type: Boolean,
        default: true,
    }
});

const emits = defineEmits<{ (event: 'change', val: Number): void }>();
const quality = ref({ q: 0 });
const onInputChange = (e: VscodeTextFieldEvent) => {
    const newVal = +e.target.value;

    if (newVal < 0) {
        quality.value = { q: 0 };
    } else if (newVal > 100) {
        quality.value = { q: 100 };
    } else {
        quality.value = { q: newVal };
    }
};
const onConvert = () => {
    emits('change', quality.value.q || DEFUALT_QUALITY);
};
</script>

<template>
    <div class="input-area">
        <span class="input-name">quality:</span>
        <vscode-text-field size="20" type="number" placeholder="please input the quality"
            :value="quality.q || DEFUALT_QUALITY" @input="onInputChange" />
        <vscode-button class="btn" @click="onConvert" :disabled="!enabled">Convert</vscode-button>
    </div>
</template>

<style scoped>
.input-area {
    display: flex;
    justify-content: center;
    align-items: center;
}

.input-name {
    margin-right: 5px;
    user-select: none;
}

.btn {
    margin-left: 3px;
    font-size: 14px;
}
</style>