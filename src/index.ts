
import * as box from './components/box';
import './index.scss';
import { kitOption, kitResult } from '../type';
import { dataFactory } from './utils';
import * as quick from './components/quick';

/**
 * open
 *
 * @description open the kit and return the data
 * @param kitOpiton {kitOption} - options for the kit
 * @returns {Promise<kitContent>} - the data of the kit
 */
export async function open(kitOpiton: kitOption): Promise<kitResult> {
    const element = kitOpiton.root;
    const data = dataFactory(kitOpiton);
    
    return box.create({
        root: element
    }, data);
}



export default {
    open,
    getLimtKey: quick.getLimtKey,
    getQuickMap: quick.getQuickMap
}