<script setup lang="ts">
import { DtQuickSelector as DtQuickSelectorPkg } from '@gez/date-time-kit';
import { Lang } from '@gez/date-time-kit/dist/i18n';
import { computed, ref } from 'vue';
import {
    DtQuickSelectorEvent,
    DtQuickSelectorQuickKey,
    init
} from './DefCustomEle';

init();

const theme = ref<'light' | 'dark'>('dark');

const lang = ref<Lang>('en-US');

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

const currentTime = ref<string | number | undefined>(void 0);
const dateTimeSelectorState = ref<'open' | 'close'>('close');

const dateNow = Date.now();
</script>

<template>
    <div class="wrapper" :data-theme="theme" :dir="lang === 'ar-AE' ? 'rtl' : 'ltr'">
        <select v-model="theme" name="theme">
            <option value="light">light</option>
            <option value="dark">dark</option>
        </select>
        <select v-model="lang" name="lang">
            <option value="en-US">en-US</option>
            <option value="zh-CN">zh-CN</option>
            <option value="zh-TW">zh-TW</option>
            <option value="id-ID">id-ID</option>
            <option value="vi-VN">vi-VN</option>
            <option value="th-TH">th-TH</option>
            <option value="ms-MY">ms-MY</option>
            <option value="ko-KR">ko-KR</option>
            <option value="ar-AE">ar-AE</option>
        </select>
        <p
            >quick select: <dt-quick-selector
                :lang="lang"
                ref="el"
                pop-strategy="absolute"
                @time-changed="onChange"
                @open-change="$event.detail
                    ? quickResult = 'Selecting...'
                    : quickResult += '\nDone'"
                :week-start-at="weekStartAt"
                :quick-key="quickKey"
                :start-time="startTime"
                :end-time="endTime"
            ></dt-quick-selector
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

        <hr />

        <div>
            <p>selected time: {{ currentTime && new Date(currentTime).toISOString() }}</p>
            <p>state: {{ dateTimeSelectorState }}</p>
            <dt-date-time-selector
                :lang="lang"
                min-granularity="minute"
                :current-time="currentTime"
                @select-time="currentTime = +$event.detail"
                @open-change="dateTimeSelectorState = $event.detail ? 'open' : 'close'"
            >
                <button slot="trigger">date time selector</button>
            </dt-date-time-selector>
            <dt-date-time-selector
                :lang="lang"
                min-granularity="minute"
                :current-time="currentTime"
                :min-time="dateNow - 30 * 24 * 3600 * 1000"
                :max-time="dateNow + 30 * 24 * 3600 * 1000"
                @select-time="currentTime = +$event.detail"
                @open-change="dateTimeSelectorState = $event.detail ? 'open' : 'close'"
            >
                <button slot="trigger">date time selector with max-min time</button>
            </dt-date-time-selector>
            <ul>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
                <li>Lorem ipsum dolor sit amet consectetur adipisicing elit. Nihil, mollitia?</li>
            </ul>
        </div>
    </div>
</template>

<style>
div.wrapper {
    min-width: 100vw;
    min-height: 100vh;
    padding: 75vmin;
}
[data-theme="light"] {
    --color-bg-block-light: #fff;
    --color-border-dark: #0000001A;
    --color-bg-hover: #0000000D;
    --color-text-main: #111;
    --color-text-reverse: #fff;
    --color-text-secondary: #999;
    --color-text-auxiliary: #666;
    --color-text-disabled: #ccc;
    --color-accent: #333;
    --color-accent-hover: #262626;
    --color-bg-secondary: #e3e6e8;
    --color-bg-secondary-hover: #D6D8DB;
    --border-color-dark: #0000001a;
    --border-color-input: #00000033;
    --color-brand: #002BE7;
    --color-brand-hover: #0025C4;
    --color-brand-bg: #002BE726;
    color: var(--color-text-main);
    background-color: var(--color-bg-block-light);
}
[data-theme="dark"] {
    --color-bg-block-light: #333;
    --color-border-dark: #ffffff1a;
    --color-bg-hover: #FFFFFF0D;
    --color-text-main: #eee;
    --color-text-reverse: #1f1f1f;
    --color-text-secondary: #ffffff80;
    --color-text-auxiliary: #ffffffb2;
    --color-text-disabled: #ffffff4d;
    --color-accent: #FFFFFFE5;
    --color-accent-hover: #FFFFFFF2;
    --color-bg-secondary: #3D3D3D;
    --color-bg-secondary-hover: #4D4D4D;
    --border-color-dark: #ffffff1a;
    --border-color-input: #696969;
    --color-brand: #2962FF;
    --color-brand-hover: #214ECC;
    --color-brand-bg: #2962FF26;
    color: var(--color-text-main);
    background-color: var(--color-bg-block-light);
}

[dt] {
    --dt-text-main: var(--color-text-main);
    color: var(--color-text-main);
    --dt-bg-block-light: var(--color-bg-block-light);
    --dt-border-dark: var(--color-border-dark);
    --dt-bg-hover: var(--color-bg-hover);
    --dt-accent: var(--color-accent);
    --dt-accent-hover: var(--color-accent-hover);
    --dt-bg-secondary: var(--color-bg-secondary);
    --dt-bg-secondary-hover: var(--color-bg-secondary-hover);
    --dt-text-reverse: var(--color-text-reverse);
    --dt-text-auxiliary: var(--color-text-auxiliary);
    --dt-text-secondary: var(--color-text-secondary);
    --dt-border-input: var(--border-color-input);

    --scrollbar-thumb-color: var(--border-color-dark);
    --scrollbar-thumb-color-hover: var(--border-color-input);
    --scrollbar-thumb-color-active: var(--border-color-input);

    --calendar-item-disabled-text: var(--color-text-disabled);
    --calendar-item-active-bg: var(--color-brand);
    --calendar-item-active-text: #fff;
    --calendar-item-in-range-bg: var(--color-brand-bg);
    --calendar-item-in-range-text: var(--color-brand);
    --calendar-item-hover-bg: var(--color-bg-hover);
    --calendar-item-hover-text: var(--color-text-main);
    --calendar-item-active-hover-bg: var(--color-brand-hover);
    --calendar-item-active-hover-text: #fff;
}
[data-theme="dark"] [dt] {
    --dt-pop-box-shadow: 0 6px 16px #0009;
}

dt-quick-selector {
    display: inline-block;
    margin: 0 200px;
}
dt-date-time-selector {
    margin: 0 200px;
}
</style>
