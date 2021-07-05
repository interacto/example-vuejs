<template>
  <div class="tabs">
    <ul class="tabBar">
      <li v-for="tab in state.tabs" :key="tab.props.title">
        <button v-if="tab.props.title !== state.currentTab" @click="selectTab(tab.props.title)" class="inactive-tab">{{tab.props.title}}</button>
        <button v-if="tab.props.title === state.currentTab" @click="selectTab(tab.props.title)" class="active-tab">{{tab.props.title}}</button>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref, VNode, reactive, provide} from "vue";

export interface TabsState {
  currentTab: string,
  tabs: VNode[]
}

export default defineComponent ({
  setup(props, context) {
    let currentTab = ref('');
    let tabs = ref<VNode[]>([]);

    const state = reactive<TabsState>({
      currentTab: '',
      tabs: []
    });
    provide("TabsProvider", state);

    state.tabs = context.slots.default!();
    state.currentTab = state.tabs[0].props!.title;

    const selectTab = (title: string) => {
      state.currentTab = title;
    };

    return {
      currentTab,
      tabs,
      state,
      selectTab
    };
  }
})
</script>

<style>
.tabBar {
  display: flex;
  gap: 10px;
  list-style-type: none;
  border-bottom-style: solid;
  border-width: thin;
  margin-left: -20px;
  margin-right: -20px;
  padding-left: 20px;
  border-color: #b5b5b5;
}

.inactive-tab {
  min-height: 40px;
  border-style: none;
  border-bottom-style: solid;
  border-bottom-color: transparent;
  border-bottom-width: medium;
  color: black;
  background-color: white;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 18px;
}

.active-tab {
  min-height: 40px;
  border-bottom-style: solid;
  border-right-style: none;
  border-left-style: none;
  border-top-style: none;

  border-color: black;
  color: black;
  background-color: white;
  border-width: medium;
  font-family: 'Josefin Sans', sans-serif;
  font-size: 18px;
}

.inactiveTabContent {
  display: none;
}

.activeTabContent {

}
</style>
