<template>
  <div v-show="isActive">
    <h2>{{title}}</h2>
    <slot></slot>
  </div>

</template>

<script lang="ts">
import {defineComponent, inject, ref, watch} from "vue";
import {TabsState} from "@/components/Tabs.vue";

export default defineComponent ({
  props: {
    title: {
      type: String,
      default: 'Tab'
    },
  },
  setup(props) {
    const isActive = ref(false);

    const tabs: TabsState | undefined = inject('TabsProvider');
    watch(
        () => tabs!.currentTab,
        () => {
          isActive.value = props.title === tabs!.currentTab;
        }
    );

    isActive.value = props.title === tabs!.currentTab;

    return {
      isActive
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

.inactiveTab {
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

.activeTab {
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
</style>
