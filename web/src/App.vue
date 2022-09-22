<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import {
  provideVSCodeDesignSystem,
  vsCodeButton,
  vsCodeTextField
} from "@vscode/webview-ui-toolkit";
import { vscode } from "./utilities/vscode";
import {
  COMMAND_CONVERT,
  COMMAND_UPDATE_ORIGINAL,
  COMMAND_UPDATE_WEBP,
  COMMAND_RESPONSE_SUFFIX
} from "./utilities/constant";
import Header from './components/Header/index.vue';
import InputArea from './components/InputArea/index.vue';
import ImageRow from './components/ImageRow/index.vue';

provideVSCodeDesignSystem().register(
  vsCodeButton(),
  vsCodeTextField(),
);

const fileName = ref('');
const imageRatio = ref(1);
const original = reactive({ uri: '', size: '', loading: false });
const webP = reactive({ uri: '', size: '', loading: false });
const onInputChange = (quality: Number) => {
  webP.loading = true;
  vscode.postMessage({
    command: COMMAND_CONVERT,
    options: { quality },
  });
};

const handleMessage = (e: MessageEvent) => {
  switch (e.data.command) {
    case COMMAND_UPDATE_ORIGINAL:
      original.size = e.data.data.unit;
      original.uri = e.data.data.url;
      fileName.value = e.data.data.fileName;
      imageRatio.value = e.data.data.imageRatio;
      break;

    case COMMAND_UPDATE_WEBP:
      webP.size = e.data.data.unit;
      webP.uri = e.data.data.url + '?t=' + Date.now();
      break;

    case COMMAND_CONVERT + COMMAND_RESPONSE_SUFFIX:
      webP.loading = false;
      break;
  }
};

onMounted(() => {
  window.addEventListener('message', handleMessage);
});
onUnmounted(() => {
  window.removeEventListener('message', handleMessage);
});
</script>

<template>
  <main>
    <Header>{{fileName}}</Header>
    <InputArea :enabled="!webP.loading" @change="onInputChange" />
    <ImageRow :imageRatio="imageRatio" :original="original" :webp="webP" />
  </main>
</template>

<style scoped>
html,
body {
  padding: 0;
  margin: 0;
}

main {
  padding: 0 20px;
}
</style>
