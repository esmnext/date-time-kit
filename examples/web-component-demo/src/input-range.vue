<script setup lang="ts">
import { DtDataTimeSelector as DtDataTimeSelectorPkg } from '@gez/date-time-kit';
import { ref, watch } from 'vue';

const props = defineProps<{
    min: DtDataTimeSelectorPkg.Granularity;
    max: DtDataTimeSelectorPkg.Granularity;
}>();

const emits = defineEmits<{
    (e: 'update:min', value: DtDataTimeSelectorPkg.Granularity): void;
    (e: 'update:max', value: DtDataTimeSelectorPkg.Granularity): void;
}>();

const limitMax = DtDataTimeSelectorPkg.granularityList.length - 1;

const min = ref<Number>(
    DtDataTimeSelectorPkg.granularityList.indexOf(props.max)
);
const max = ref<Number>(
    DtDataTimeSelectorPkg.granularityList.indexOf(props.min)
);

watch([min, max], () => {
    if (min.value > max.value) {
        const temp = min.value;
        min.value = max.value;
        max.value = temp;
    }
    emits(
        'update:min',
        DtDataTimeSelectorPkg.granularityList[limitMax - (min.value as number)]
    );
    emits(
        'update:max',
        DtDataTimeSelectorPkg.granularityList[limitMax - (max.value as number)]
    );
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
            <option v-for="(str, idx) in DtDataTimeSelectorPkg.granularityList" :value="idx" :label="str" />
        </datalist>
    </div>
</template>

<style scoped>
div {
    display: flex;
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
  writing-mode: bt-lr;
  appearance: slider-vertical;
}
</style>
