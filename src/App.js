import './App.css';
import { io } from 'socket.io-client';
import {useEffect, useState} from "react";
import axios from "axios";

const BookUpdateEvent = 'order-book-update';
const URL = process.env.NODE_ENV === 'production' ? undefined : 'http://localhost:5000';
export const socket = io(URL);

function App() {
  const [orderBook, setOrderBook] = useState(null);
  useEffect(() => {
    const updateOrderBook = (data) => {
      setOrderBook(data)
    }
    socket.on(BookUpdateEvent, updateOrderBook)
    return () => {
      socket.off(BookUpdateEvent, updateOrderBook)
    };
  }, []);

  useEffect(() => {
    axios.get(`${URL || ''}/api/ticker`).then(res => {
      if (!orderBook) {
        setOrderBook(res.data);
      }

    });
  }, []);


  if(!orderBook) return <div>Loading data ...</div>
  const bidData = orderBook.bidOrders.orders.reduce((data, order) => {
    data.push([order.size, order.price]);
    return data;
  }, []);

  const askData = orderBook.askOrders.orders.reduce((data, order) => {
    data.push([order.price, order.size]);
    return data;
  }, []);

  return (
    <div className="App" style={{maxWidth: 1000}}>
      <div style={{display: 'flex', gap: '50px'}}>
        <Table colNames={['Size', 'Bid']} data={bidData} total={orderBook.bidOrders.total}/>
        <Table colNames={['Ask', 'Size']} data={askData} total={orderBook.askOrders.total}/>
      </div>
    </div>
  );
}

function Table({colNames, data, total}) {
  return (
    <div style={{flexBasis: '50%'}}>
      <table>
        <thead>
        <tr>
          <th>{colNames[0]}</th>
          <th>{colNames[1]}</th>
        </tr>
        </thead>
        <tbody>
        {
          data.map((row, index) =>
            <tr key={index}>
              <td>{row[0]}</td>
              <td>{row[1]}</td>
            </tr>
          )
        }
        </tbody>
      </table>
      <div>Total: {total}</div>
    </div>
  )
}

export default App;
