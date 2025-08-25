
import { open } from './index';
import * as utils from './utils';
import {
    getLimitKeyByTimestamp,
    getTimestampByLimitKey
} from './components/quick';

export {
    default as i18n,
    type Lang,
    type kitI18n,
} from "./i18n";
export * from './types';

export default {
    open,
    getLimitKeyByTimestamp,
    getTimestampByLimitKey,
    getTimeStringByTimestamp: utils.getTimeStringByTimestamp,
    getTimeStringByTimeZone: utils.getTimeStringByTimeZone,
};

export {
    getLimitKeyByTimestamp,
    getTimestampByLimitKey,
};
