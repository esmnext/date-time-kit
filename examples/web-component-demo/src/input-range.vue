<script setup lang="ts">
import { DtDataTimeSelector as DtDataTimeSelectorPkg } from '@gez/date-time-kit';
import { ref, watch } from 'vue';

type Granularity = DtDataTimeSelectorPkg.Granularity;

const props = defineProps<{
    min: Granularity;
    max: Granularity;
}>();

const emits = defineEmits<{
    (e: 'update:min', value: Granularity): void;
    (e: 'update:max', value: Granularity): void;
}>();

const granList = DtDataTimeSelectorPkg.granularityList;
const limitMax = granList.length - 1;

const min = ref<Number>(granList.indexOf(props.min));
const max = ref<Number>(granList.indexOf(props.max));

watch([min, max], () => {
    if (min.value > max.value) {
        const temp = min.value;
        min.value = max.value;
        max.value = temp;
    }
    emits('update:min', granList[+min.value]);
    emits('update:max', granList[+max.value]);
});
</script>

<template>
    <div class="input-range-wrapper">
        <input
            type="range"
            name="temp"
            orient="vertical"
            list="granularityList"
            step="1"
            :max="limitMax"
            v-model="max"
        />
        <input
            type="range"
            name="temp"
            orient="vertical"
            list="granularityList"
            step="1"
            :max="limitMax"
            v-model="min"
        />
        <datalist id="granularityList">
            <option v-for="(str, idx) in granList.toReversed()" :value="idx" :label="str" />
        </datalist>
    </div>
</template>

<style scoped>
div {
    display: inline-flex;
}
datalist {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 200px;
}
datalist option {
    padding: 0;
}

input[type="range"] {
  height: 200px;
  width: 40px;
  margin: 0;
  writing-mode: vertical-lr;
  direction: rtl;
}
</style>
