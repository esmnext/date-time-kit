<script setup lang="ts">
import { DtQuickSelector as DtQuickSelectorPkg } from '@gez/date-time-kit';
import { computed, ref } from 'vue';
import {
    DtQuickSelectorEvent,
    DtQuickSelectorQuickKey,
    init
} from './DefCustomEle';

init();

const startTime = ref<string | number | ''>('');
const endTime = ref<string | number | ''>('');
const quickKey = ref<DtQuickSelectorQuickKey>('all');
const weekStartAt = ref<'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>(
    'sun'
);

const quickResult = ref('');
const onChange = (e: DtQuickSelectorEvent['time-changed']) => {
    console.log('time-changed', e.detail);
    quickResult.value = JSON.stringify(e.detail, null, 2);
    startTime.value = e.detail.start?.getTime() || '';
    endTime.value = e.detail.end?.getTime() || '';
    quickKey.value = e.detail.type;
};
const setToNextWeek = () => {
    const times = DtQuickSelectorPkg.genPeriodTimes(
        (t, weekOffset) => t.setDate(t.getDate() - t.getDay() + weekOffset + 7),
        (t, weekOffset) =>
            t.setDate(t.getDate() - t.getDay() + weekOffset + 13),
        new Date(),
        weekStartAt.value
    );
    startTime.value = times.start.getTime();
    endTime.value = times.end.getTime();
    quickKey.value = 'custom';
};
const quickKeyProxy = computed({
    get: () => quickKey.value,
    set: (value: DtQuickSelectorQuickKey) => {
        if (value === 'custom') {
            setToNextWeek();
        } else {
            quickKey.value = value;
            startTime.value = endTime.value = '';
        }
    }
});
</script>

<template>
    <div>
        <p
            >quick select: <dt-popover id="quick-popover"
                    @open-change="$event.detail
                        ? quickResult = 'Selecting...'
                        : quickResult += '\nDone'"
                ><button slot="trigger">quick selector</button
                ><dt-quick-selector
                    ref="el"
                    slot="pop"
                    @time-changed="onChange"
                    :week-start-at="weekStartAt"
                    :quick-key="quickKey"
                    :start-time="startTime"
                    :end-time="endTime"
                ></dt-quick-selector
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
        <select v-model="quickKeyProxy" name="quick-key">
            <option value="all">all</option>
            <option value="today">today</option>
            <option value="yesterday">yesterday</option>
            <option value="week">week</option>
            <option value="lastWeek">lastWeek</option>
            <option value="last7Days">last7Days</option>
            <option value="month">month</option>
            <option value="last30Days">last30Days</option>
            <option value="last180Days">last180Days</option>
            <option value="last6Month">last6Month</option>
            <option value="year">year</option>
            <option value="custom">custom (next week)</option>
        </select>
        result: <pre id="quick-result">{{ quickResult }}</pre>

        <div>
            <dt-date-time-selector></dt-date-time-selector>
        </div>
    </div>
</template>

<style>
#quick-popover {
    display: inline-block;
    margin-left: 200px;
}
#quick-popover [slot="pop"] {
    position: absolute;
    z-index: 999;
}
</style>
