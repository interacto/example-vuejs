<template>
  <div class="tabs">
    <ul class="tabBar">
      <li v-for="tab in tabs" :key="tab.props.title">
        <button v-if="!tab.props.isActive" @click="this.selectTab(tab.props.title)" class="inactive-tab">{{tab.props.title}}</button>
        <button v-if="tab.props.isActive" @click="this.selectTab(tab.props.title)" class="active-tab">{{tab.props.title}}</button>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import {defineComponent, VNode} from "vue";
//
// interface TabProp {
//   title: string,
//   isActive: boolean
// }

export default defineComponent ({
  data () {
    return {
      currentTab: '', // the title of the selected tab,
      tabs: [] as VNode[] // all of the tabs
    }
  },

  created () {
      this.tabs = this.$slots!.default!();
      this.currentTab = this.tabs[0].props!.title;
      this.tabs[0].props!.isActive = true;
  },

  methods: {
    selectTab(title: string) {
      this.currentTab = title;
      this.tabs.forEach(tab => tab.props!.isActive = this.currentTab === tab.props!.title);
    }
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
