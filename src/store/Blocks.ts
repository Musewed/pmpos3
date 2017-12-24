import { Reducer } from 'redux';
import { Map as IMap, List as IList, fromJS } from 'immutable';
import { AppThunkAction } from './appThunkAction';
import { uuidv4 } from './uuid';

type AddBlockAction = {
    type: 'ADD_BLOCK',
    id: string,
    payload: any
};

type KnownActions = AddBlockAction;

export const reducer: Reducer<IMap<string, IList<any>>> = (
    state: IMap<string, IList<any>> = IMap<string, IList<any>>(),
    action: KnownActions
): IMap<string, IList<any>> => {
    switch (action.type) {
        case 'ADD_BLOCK':
            let actions = state.get(action.id);
            if (!actions) { actions = IList<any>(); }
            let act = fromJS({
                id: uuidv4(),
                payload: action.payload
            });
            console.log('add_block_action', act);
            actions = actions.push(act);
            return state.set(action.id, actions);
        default:
            return state;
    }
};

export const actionCreators = {
    addBlock: (id: string, payload: any): AppThunkAction<KnownActions> => (dispatch, getState) => {
        dispatch({ type: 'ADD_BLOCK', id, payload });
    }
};