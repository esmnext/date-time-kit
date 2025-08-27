
import '@/components/calendar';
import '@/components/num-list';
import '@/components/popover';

window.onload = () => {
    const ele = document.querySelector('dt-calendar-base');
    if (!ele) return;
    // ele.setAttribute('lang', langs[langs.length * Math.random() | 0]);
    // console.log('set lang', ele.getAttribute('lang'));
    // const weeks = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    // ele.setAttribute('week-start-at', weeks[
    //     (weeks.indexOf(ele.getAttribute('week-start-at') || 'sun') + 1) % weeks.length
    // ]);
    ele.addEventListener('select-time', (event) => {
        console.trace('Selected time: ' + (event as CustomEvent<Date>).detail);
    });
};

import dataTimeKit from '@/export';

// const rand = dataTimeKit.getTimestampByLimitKey('week', 2); 
// const keyName = dataTimeKit.getLimitKeyByTimestamp(rand.startTime, rand.endTime, 2); 
// console.log(rand, keyName);

// console.log(dataTimeKit.default.getTimeStringByTimeZone(rand.startTime, 2, 7));
// console.log(dataTimeKit.default.getTimeStringByTimeZone(rand.startTime, 8, 7));
// console.log(dataTimeKit.default.getTimeStringByTimeZone('2025-02-27 00:00:00.000', 8));
    // event
// const result = await dataTimeKit.open({
//     root: document.querySelector('#root'),
//     minTime: "1990-01-01 00:00:00.000",
//     maxTime: "2050-01-01 23:59:59.999",
//     startTime: rand.startTime,
//     endTime: rand.endTime,
//     timeZone: 2,
//     lang: 'zh-CN',
//     granularity: 'minute',
//     enableZone: false
// });

// const result = await dataTimeKit.open({
//     root: document.querySelector('#root'),
//     "minTime": "1990-01-01T00:00:00.000",
//     "maxTime": "2025-08-30T18:35:20.894",
//     "enableZone": false,
//     "granularity":  dataTimeKit.Granularity.second,
//     // "startTime": rand.startTime,
//     // "endTime": rand.endTime,
//     "period": false,
//     // "maxLength": 60 * 60 * 1000,
//     // "minLength":  60 * 60 * 1000,
//     "timeZone": 2,
//     // "lang": 'ar-AE'
// });

// console.log('start', dataTimeKit.default.getTimeStringByTimeZone(result.time, 8, 2));
// console.log('end', dataTimeKit.default.getTimeStringByTimeZone(result.endTime, 8, 2));

document.querySelector('#select')?.addEventListener('click', async (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    e.stopPropagation();
    const data = await dataTimeKit.open({
        root: e.target,
    });
    console.log(data);
});

document.querySelector('#select-def')?.addEventListener('click', async (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    e.stopPropagation();
    const data = await dataTimeKit.open({
        root: e.target,
        maxTime: '2050-01-02T00:00:00.000',
        minTime: '1990-01-01T00:00:00.000',
        startTime: '1990-01-01T00:00:00.000',
        endTime: '2050-01-01T00:10:10.022',
        lang: 'zh-CN',
        period: true,
    });
    console.log(data);
});

document.querySelector('#img')?.addEventListener('click', async (e) => {
    if (!(e.target instanceof HTMLElement)) return;
    e.stopPropagation();
    const data = await dataTimeKit.open({
        root: e.target,
        maxTime: '2050-01-02T00:00:00.000',
        minTime: '1990-01-01T00:00:00.000',
        startTime: '1990-01-01T00:00:00.000',
        endTime: '2050-01-01T00:10:10.022',
        lang: 'zh-CN',
        period: true,
    });
    console.log(data);
});
