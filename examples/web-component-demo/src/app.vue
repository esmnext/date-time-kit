<script setup lang="ts">
import { ref } from 'vue';
import { DtQuickSelectorEvent, init } from './DefCustomEle';

init();

const quickResult = ref('');
const onChange = (e: DtQuickSelectorEvent['time-changed']) => {
    console.log('time-changed', e.detail);
    quickResult.value = JSON.stringify(e.detail, null, 2);
};
const weekStartAt = ref<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>(
    'sun'
);
</script>

<template>
    <div>
        <p
            >quick select: <dt-popover id="quick-popover"
                @open-change="$event.detail ? quickResult = 'Selecting...' : quickResult += '\nDone'"
                ><button slot="trigger">quick selector</button
                ><dt-quick-selector ref="el" slot="pop" @time-changed="onChange" :week-start-at="weekStartAt"></dt-quick-selector
            ></dt-popover
        ></p>
        <select v-model="weekStartAt" name="week-start-at">
            <option value="sun">week start at Sunday</option>
            <option value="mon">week start at Monday</option>
            <option value="tue">week start at Tuesday</option>
            <option value="wed">week start at Wednesday</option>
            <option value="thu">week start at Thursday</option>
            <option value="fri">week start at Friday</option>
            <option value="sat">week start at Saturday</option>
        </select>
        result: <pre id="quick-result">{{ quickResult }}</pre>
    </div>
</template>

<style>
#quick-popover {
    display: inline-block;
    margin-left: 200px;
}
#quick-popover [slot="pop"] {
    position: absolute;
}
</style>
