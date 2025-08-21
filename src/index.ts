
import * as box from './components/box';
import './index.scss';
import { kitOption } from './types';
import { dataFactory } from './utils';

/**
 * Open the calendar selection window
 *
 * @description open the kit and return the data
 * @param options options for the kit
 * @returns the data of the kit
 */
export const open = (options: kitOption) =>
    box.create(options, dataFactory(options));
