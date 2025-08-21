
import { open } from './index';
import * as utils from './utils';

export {
    default as i18n,
    type Lang,
    type kitI18n,
} from "./i18n";
export * from './types';

export default {
    open,
    getLimitKeyByTimestamp: utils.getLimitKeyByTimestamp,
    getTimestampByLimitKey: utils.getTimestampByLimitKey,
    getTimeStringByTimestamp: utils.getTimeStringByTimestamp,
    getTimeStringByTimeZone: utils.getTimeStringByTimeZone,
};
