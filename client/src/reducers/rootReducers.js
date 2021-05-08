import {combineReducers} from 'redux';
import sampleReducer from './sampleReducer';
import sampleReducerInitState from '../initialState/sampleReducerInitState';

import {enableBatching} from 'redux-batched-actions';

const rootReducer = combineReducers({
    sampleReducer: sampleReducer(sampleReducerInitState, {})
});

export default enableBatching((rootReducer));