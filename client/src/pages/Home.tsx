import React, { useEffect, useState } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


const Home = () => {
  const WS_URL = 'ws://127.0.0.1:8000';
  const [err1, setError1] = useState<string | null>(null);
  const [err2, setError2] = useState<string | null>(null);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem('userData')!);

  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true

  });


  const handleRandomEvent = async () => {
    if (userData !== null && readyState === ReadyState.OPEN) {
      try {
        const { email } = JSON.parse(localStorage.getItem('userData')!);
        const res = await axios.post(`http://localhost:8800/api/getCoin`, { email });
        // debugger;
        const coin = res.data;
        if (coin >= 10) {
          sendJsonMessage({
            type: 'randomGameEvent',
            ...userData
          })
          navigate('/game')
        } else {
          setError1("You don't have enough coin to play this game");
        }



      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError1(error.response?.data);
        }
      }
    }
  }


  const handleTournamentEvent = async () => {
    if (userData !== null && readyState === ReadyState.OPEN) {

      try {
        const { email } = JSON.parse(localStorage.getItem('userData')!);
        const res = await axios.post(`http://localhost:8800/api/getCoin`, { email });
        const coin = res.data;
        if (coin >= 100) {
          sendJsonMessage({
            type: 'tournamentGameEvent',
            ...userData
          })
          navigate('/game')

        } else {
          setError1("You don't have enough coin to play this game");
        }

      } catch (error) {
        if (axios.isAxiosError(error)) {
          setError2(error.response?.data);
        }
      }
    }
  }

  return (
    <>
      <div className='main w-screen flex flex-col h-3/4' >


        <div className='bg-home-background w-full text-white h-full ' >

          <div className='text-center text-5xl py-32 font-serif' >Ping Pong Game</div>

        </div>

        <div className=' px-20 w-screen ' >

          <h4 className='text-4xl my-8'> Random Game : </h4>

          <span className='text-xl'>( For random game 10 coins is required ) </span>
          <button onClick={handleRandomEvent} className='text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2 ml-5'>Play</button>
          <div style={{ color: "red" }} className='mt-5'>
            {
              err1 && <span>{err1}</span>
            }
          </div>

          <h4 className='my-8 text-4xl'> Tournament Game : </h4>
          <span className='text-xl'> ( For Tournament game 100 coins is required )</span>
          <button onClick={handleTournamentEvent} className='text-white bg-[#24292F] hover:bg-[#24292F]/90 focus:ring-4 focus:outline-none focus:ring-[#24292F]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:focus:ring-gray-500 dark:hover:bg-[#050708]/30 mr-2 mb-2 ml-5'>Play</button>
          <div style={{ color: "red" }} className='mt-5'>
            {
              err2 && <span>{err2}</span>
            }
          </div>
          


        </div>
      </div>
    </>

  )


}

export default Home;