import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

const Navbar = () => {

  const [coin, setCoin] = useState<number | null>(null);
  const WS_URL = 'ws://127.0.0.1:8000';
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const isGameEvent = (message: WebSocketEventMap['message']) => {
    let evt = JSON.parse(message.data);
    if (evt.event === 'randomGameEvent' || evt.event === 'tournamentGameEvent') {
      if (evt.data.emails.length)
        setIsPlaying(!isPlaying);
    }
    return evt.type === 'randomGameEvent' || evt.type === 'tournamentGameEvent';

  }

  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isGameEvent
  });

  const getCoin = async () => {

    try {
      const { email } = JSON.parse(localStorage.getItem('userData')!);
      const res = await axios.post(`http://localhost:8800/api/getCoin`, { email });
      // debugger;
      setCoin(res.data);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      }
    }

  }

  useEffect(() => {
    getCoin();
  },)



  return <>
    <div className='h-16 w-screen flex justify-between '>
      <div className='bg-logo h-full w-16 bg-cover ml-16'> </div>
      <div className='flex mr-28 mt-2 '>


        <div className='mr-5 leading-10'>
          
          {
            coin && <span className='font-bold '> Coins : {coin}</span>
          }


        </div>
        <div className=''>
          <button className=' bg-black text-white hover:bg-violet-600 active:bg-violet-700 focus:outline-none focus:ring focus:ring-violet-300 p-2 rounded-md'>Log out</button>
        </div></div>
    </div>
  </>
}
export default Navbar;