import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import * as OrderBookActions from '../actions/order-book-actions';
import '../order-book.css';
import Big from 'big.js';

type OrderBookPropsType = {
    asks: OrderBookMapType,
    bids: OrderBookMapType
};

const ORDER_BOOK_SIZE = 20;

function OrderBook(props: OrderBookPropsType) {
    const getScreenSize = () => {
        return window.innerWidth > 768 ? 'desktop' : 'mobile';
    };

    const [connection, _setConnection] = useState<WebSocket | null>(null);
    const [feedId, _setFeedId] = useState('PI_XBTUSD');
    const [screenSize, setScreenSize] = useState(getScreenSize());

    const connectionRef: React.MutableRefObject<WebSocket | null> = React.useRef(connection);
    const setConnection = (newConnection: WebSocket | null) => {
        connectionRef.current = newConnection;
        _setConnection(newConnection);
    };

    const feedIdRef: React.MutableRefObject<string> = React.useRef(feedId);
    const setFeedId = (newFeedId: string) => {
        feedIdRef.current = newFeedId;
        _setFeedId(newFeedId);
    };

    useEffect(() => {
        const connectAndOpenFeed = () => {
            OrderBookActions.connect()
                .then((c) => {
                    setConnection(c);
    
                    OrderBookActions.openOrderBookFeed(c, feedIdRef.current);
                });
        };
    
        const disconnect = () => {
            if (connectionRef.current != null) {
                OrderBookActions.disconnect(connectionRef.current);
    
                setConnection(null);
            }
        };
    
        const handleVisibilitychange = (): void => {
            if (document.visibilityState === "visible") { // tab is active
                connectAndOpenFeed();
            } else {
                disconnect();
            }
        };

        const handleResize = (): void => {
            setScreenSize(getScreenSize());
        }

        connectAndOpenFeed();

        document.addEventListener('visibilitychange', handleVisibilitychange);
        window.addEventListener('resize', handleResize);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilitychange);
            window.removeEventListener('resize', handleResize);

            disconnect();
        }
    }, []);

    const formatNumber = (n: number, minimumFractionDigits: number = 0) => {
        return n.toLocaleString('en-US', { minimumFractionDigits });
    }

    const handleToggle = (): void => {
        console.log('handleToggle');

        if (connection != null) {
            OrderBookActions.closeOrderBookFeed(connection, feedId);
        }

        const newFeedId: string = feedId === 'PI_XBTUSD' ? 'PI_ETHUSD' : 'PI_XBTUSD';

        setFeedId(newFeedId);

        if (connection != null) {
            OrderBookActions.openOrderBookFeed(connection, newFeedId);
        }
    }

    const renderGraph = (totals: Array<number>, className: string, isReverse: boolean) => {
        const maxTotal: number = totals[totals.length -1];
        const rows: Array<JSX.Element> = [];
        const rowStyle = {
            display: 'flex', 
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
        };
        const containerStyle = {
            marginTop: `-${ORDER_BOOK_SIZE * 1.5}em`
        };

        totals.forEach((total) => {
            const graphWidth: number = total / maxTotal;
            const rowStyle = {
                display: 'flex',
                height: '1.5em',
                opacity: 0.6
            };
            
            const rowColorStyle = {
                ...rowStyle,
                flex: graphWidth,
                height: '1.5em'
            };
            const rowEmptyStyle = {
                ...rowStyle,
                flex: 1 - graphWidth,
            };

            const cols: JSX.Element = isReverse ? (
                <React.Fragment>
                    <div style={rowEmptyStyle}></div>
                    <div className={className} style={rowColorStyle}></div>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    <div className={className} style={rowColorStyle}></div>
                    <div style={rowEmptyStyle}></div>
                </React.Fragment>
            );

            rows.push (
                <div key={total} style={rowStyle as React.CSSProperties}>
                    {cols}
                </div>
            );
        });

        return (
            <div className="">
                <div style={containerStyle as React.CSSProperties}>{rows}</div>
            </div>
        );
    };

    const renderAsks = () => {
        const rows: Array<JSX.Element> = [];
        let prevTotal: number = 0;
        let count: number = 0;
        const totals: Array<number> = [];

        for (const key in props.asks) {
            if (count === ORDER_BOOK_SIZE) {
                break;
            }

            const entry = props.asks[key];
            const total: number = prevTotal + entry.size;

            prevTotal = total;

            totals.push(total);

            rows.push(
                <div className="row" key={key}>
                    <div className="col text-danger">{formatNumber(entry.price, 2)}</div>
                    <div className="col">{formatNumber(entry.size)}</div>
                    <div className="col">{formatNumber(total)}</div>
                </div>
            );

            count++;
        };

        return (
            <div className="order-book">
                <div className="container">
                {screenSize === 'desktop' && (
                    <div className="row fw-bold text-white-50">
                        <div className="col">Total</div>
                        <div className="col">Size</div>
                        <div className="col">Price</div>
                    </div>
                )}
                {rows}
                {renderGraph(totals, 'bg-danger', screenSize !== 'desktop')}
                </div>
            </div>
        );
    };

    const renderBids = () => {
        const rows: Array<JSX.Element> = [];
        let prevTotal: number = 0;
        let count: number = 0;
        const totals: Array<number> = [];

        for (const key in props.bids) {
            if (count === ORDER_BOOK_SIZE) {
                break;
            }

            const entry = props.bids[key];
            const total: number = prevTotal + entry.size;
            
            prevTotal = total;

            totals.push(total);

            if (screenSize === 'mobile') {
                rows.push(
                    <div className="row" key={key}>
                        <div className="col text-success">{formatNumber(entry.price, 2)}</div>
                        <div className="col">{formatNumber(entry.size)}</div>
                        <div className="col">{formatNumber(total)}</div>
                    </div>
                );
            } else if (screenSize === 'desktop') {
                rows.push(
                    <div className="row" key={key}>
                        <div className="col">{formatNumber(total)}</div>
                        <div className="col">{formatNumber(entry.size)}</div>
                        <div className="col text-success">{formatNumber(entry.price, 2)}</div>
                    </div>
                );
            }

            count++;
        }

        return (
            <div className="container">
                <div className="row fw-bold text-white-50">
                    <div className="col">Total</div>
                    <div className="col">Size</div>
                    <div className="col">Price</div>
                </div>
                {rows}
                {renderGraph(totals, 'bg-success', true)}
            </div>
        );
    }

    const renderSpread = (): JSX.Element | null => {
        const tobAsk = Object.values(props.asks)[0];
        const tobBid = Object.values(props.bids)[0];

        if (tobAsk == null || tobBid == null) {
            return null;
        }

        const spread: number = Big(tobAsk.price).minus(tobBid.price).toNumber();
        const spreadPercentage: string = Big(spread).div(tobAsk.price).times(100).toFixed(2);

        return (
            <div className="text-white-50 text-center">Spread: {formatNumber(spread, 2)} ({spreadPercentage}%)</div>
        );
    };

    return (
        <div className="order-book bg-dark text-light font-small">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 col-xs-12">
                        <div className="text-start fw-bold">Order Book: {feedId.split('_')[1]}</div>
                    </div>
                    <div className="col-md-4 col-xs-12 text-center">
                        {screenSize === 'desktop' && renderSpread()}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6 col-xs-12">
                        {renderBids()}
                        {screenSize === 'mobile' && renderSpread()}
                    </div>
                    <div className="col-md-6 col-xs-12">
                        {renderAsks()}
                    </div>
                </div>
            </div>
            <div className="text-center">
                <button type="button" className="btn btn-primary" onClick={handleToggle}>Toggle Feed</button>
            </div>
        </div>
    );
} 

const mapStateToProps = (state: OrderBookStoreStateType) => {
    return { 
        asks: state.asks, 
        bids: state.bids 
    };
}

export default connect(mapStateToProps)(OrderBook);