<script setup lang="ts">
import { DtPopover, DtQuickSelector } from '@date-time-kit/web-component';
import { ref } from 'vue';

const quickResult = ref('');
const onChange = (
    e: CustomEvent<DtQuickSelector.QuickSelectorEmit['time-changed']>
) => {
    quickResult.value = JSON.stringify(e.detail, null, 2);
};
</script>

<template>
    <div>
        <p
            >quick select: <dt-popover id="quick-popover"
                ><button slot="trigger">quick selector</button
                ><dt-quick-selector ref="el" slot="pop" @time-changed="onChange"></dt-quick-selector
            ></dt-popover
        ></p>
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
