import * as React from 'react';
import { CardRecord } from '../../models/Card';
import CardPageContent from './CardPageContent';
import { WithStyles } from 'material-ui/styles/withStyles';
import decorate, { Style } from './style';
import { CardTagRecord } from '../../models/CardTag';
import CardList from '../../modules/CardList';

interface SubCardProps {
    card: CardRecord;
    selectedCardId: string;
    onClick: (card: CardRecord, target: any) => void;
    handleTagClick: (Card: CardRecord, value: CardTagRecord) => void;
}

const SubCards = (props: SubCardProps & WithStyles<keyof Style>) => {
    if (props.card.cards.count() === 0) { return null; }
    return (
        <div className={props.classes.subCards}>
            {props.card.cards
                .valueSeq()
                .sort((a, b) => a.time - b.time)
                .map(card => {
                    return (
                        <CardPageContent
                            key={card.id}
                            card={card}
                            cardType={CardList.getCardType(card.typeId)}
                            selectedCardId={props.selectedCardId}
                            onClick={props.onClick}
                            handleTagClick={props.handleTagClick}
                        />
                    );
                })}
        </div>
    );
};

export default decorate(SubCards);