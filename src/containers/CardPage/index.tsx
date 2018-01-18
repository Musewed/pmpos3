import * as React from 'react';
import * as moment from 'moment';
import * as shortid from 'shortid';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import * as CardStore from '../../store/Cards';
import * as ClientStore from '../../store/Client';
import { ApplicationState } from '../../store/index';

import { WithStyles, Typography, Menu, MenuItem, Paper, Divider } from 'material-ui';
import decorate, { Style } from './style';
import * as Extender from '../../lib/Extender';
import TopBar from '../TopBar';
import { List, Map as IMap } from 'immutable';
import { ActionRecord } from '../../models/Action';
import { CardRecord } from '../../models/Card';
import { CommitRecord } from '../../models/Commit';
import { CardTypeRecord } from '../../models/CardType';
import { CardTagRecord } from '../../models/CardTag';
import { cardOperations } from '../../modules/CardOperations';
import CardOperation from '../../modules/CardOperations/CardOperation';

import Commits from './Commits';
import CardPageContent from './CardPageContent';
import CardBalance from './CardBalance';
import CardList from '../../modules/CardList';
import { CommandButton } from './CommandButton';

type PageProps =
    {
        isLoaded: boolean,
        pendingActions: List<ActionRecord>
        card: CardRecord,
        cardTypes: IMap<string, CardTypeRecord>
        commits: List<CommitRecord>
    }
    & WithStyles<keyof Style>
    & typeof CardStore.actionCreators
    & typeof ClientStore.actionCreators
    & RouteComponentProps<{ id?: string }>;

interface PageState {
    anchorEl: any;
    operations: CardOperation[];
    showCommits: boolean;
    selectedCard: CardRecord;
    buttons: CommandButton[];
}

export class CardPage extends React.Component<PageProps, PageState> {
    constructor(props: PageProps) {
        super(props);
        this.state = {
            anchorEl: undefined,
            operations: cardOperations.getOperations(),
            showCommits: false,
            selectedCard: props.card,
            buttons: []
        };
    }

    handleModalClose = () => {
        this.props.SetModalState(false);
    }

    handleMenuClick = event => {
        this.setState({ anchorEl: event.currentTarget });
    }

    handleMenuClose = () => {
        this.setState({ anchorEl: undefined });
    }

    handleCardMutation = (actionType: string, data: any) => {
        this.props.addPendingAction(this.state.selectedCard, actionType, data);
        this.handleModalClose();
    }

    handleOperation(operation: CardOperation, currentData?: any) {
        if (operation.getEditor) {
            let component = operation.getEditor(
                (at, data) => this.handleCardMutation(at, data),
                () => { this.handleModalClose(); },
                currentData);
            if (component) {
                this.props.SetModalComponent(component);
            }
        } else {
            this.handleCardMutation(operation.type, {
                id: shortid.generate(), time: new Date().getTime()
            });
        }
    }

    handleButtonClick(button: CommandButton) {
        this.handleCardMutation('EXECUTE_COMMAND', {
            name: button.command,
            params: button.parameters
        });
    }

    public componentDidMount() {
        if (this.props.match.params.id) {
            this.props.loadCard(this.props.match.params.id);
        }
        if (this.props.isLoaded) {
            this.setState({ selectedCard: this.props.card });
        }
    }

    getTitle() {
        let ct = this.props.cardTypes.get(this.props.card.typeId);
        let cap = ct ? ct.reference : `Card`;
        return !this.props.card.name
            ? `New ${cap}`
            : `${this.props.card.display}`;
    }

    getButtons(card: CardRecord): CommandButton[] {
        let ct = CardList.getCardTypes().get(card.typeId);
        return ct ? ct.commands.map(x => new CommandButton(x)) : [];
    }

    public render() {
        if (!this.props.isLoaded || !this.props.card) {
            return (
                <div>
                    <TopBar
                        title="Loading...."
                    />
                </div>
            );
        }

        return (
            <div className={this.props.classes.root}>
                <TopBar
                    title={this.getTitle()}
                    menuCommand={{ icon: 'close', onClick: () => { this.props.history.goBack(); } }}
                    secondaryCommands={[
                        {
                            icon: 'folder_open',
                            menuItems: [{
                                icon: 'Display Commits', onClick: () => {
                                    this.setState({ showCommits: true });
                                }
                            }]
                        },
                        {
                            icon: 'check', onClick: () => {
                                this.props.commitCard();
                                this.props.history.goBack();
                            }
                        }
                    ]}
                />
                <Paper className={this.props.classes.content}>
                    <div className={this.props.classes.indexHeader}>
                        <Typography>{this.props.card.id}</Typography>
                        <Typography>{moment(this.props.card.time).format('LLL')}</Typography>
                        <Typography>{this.props.card.isClosed && 'CLOSED!'}</Typography>
                    </div>
                    <CardPageContent
                        card={this.props.card}
                        onClick={(card, target) => this.setState({
                            selectedCard: card,
                            buttons: this.getButtons(card),
                            anchorEl: target
                        })}
                        handleTagClick={(card: CardRecord, cardTag: CardTagRecord) => {
                            this.setState({ selectedCard: card });
                            this.handleOperation(
                                this.state.operations.find(x => x.type === 'SET_CARD_TAG') as CardOperation,
                                cardTag
                            );
                        }}
                    />
                    {this.state.showCommits &&
                        <Commits
                            pendingActions={this.props.pendingActions}
                            commits={this.props.commits}
                        />
                    }
                </Paper >
                <div className={this.props.classes.footer}>
                    <CardBalance card={this.props.card} />
                </div>
                <Menu
                    id="long-menu"
                    anchorEl={this.state.anchorEl}
                    open={Boolean(this.state.anchorEl)}
                    onClose={this.handleMenuClose}
                    PaperProps={{
                        style: {
                            maxHeight: 48 * 4.5,
                            width: 200,
                        },
                    }}
                >
                    {this.state.buttons.map(button => (
                        <MenuItem
                            key={button.caption}
                            onClick={e => {
                                this.handleButtonClick(button);
                                this.handleMenuClose();
                            }}
                        >
                            {button.caption}
                        </MenuItem>
                    ))}
                    <Divider />
                    {this.state.operations.map(option => (
                        <MenuItem
                            key={option.type}
                            onClick={e => {
                                this.handleOperation(option);
                                this.handleMenuClose();
                            }}
                        >
                            {option.description}
                        </MenuItem>
                    ))}
                </Menu>
            </div>
        );
    }
}

const mapStateToProps = (state: ApplicationState) => ({
    card: state.cards.currentCard,
    cardTypes: state.config.cardTypes,
    commits: state.cards.currentCommits,
    pendingActions: state.cards.pendingActions,
    isLoaded: state.cards.isLoaded
});

export default decorate(connect(
    mapStateToProps,
    Extender.extend(ClientStore.actionCreators, CardStore.actionCreators)
)(CardPage));