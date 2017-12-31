import * as React from 'react';
import { List } from 'material-ui';
import { Map as IMap, List as IList } from 'immutable';
import ActionLogListItem from './ActionLogListItem';

export default (props: {
    blocks: IMap<string, IList<any>>,
    onClick: (bid: string) => void,
    selectedBid: string
}) => {
    return (
        <List dense>
            {
                props.blocks.entrySeq().map(([bid, actions]: any[]) => {
                    return (
                        <ActionLogListItem
                            key={bid}
                            bid={bid}
                            actions={actions}
                            isSelected={props.selectedBid !== '' && bid === props.selectedBid}
                            onClick={() => props.onClick(bid)}
                        />
                    );
                })
            }
        </List>
    );
};