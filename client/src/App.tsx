import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import Register from "./pages/Register";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./pages/Navbar";
import useWebSocket from 'react-use-websocket';
import PingPongBoard from "./components/pingpong";
import Loading from "./components/LoadingPage";
import { useState } from 'react'
import WinningPage from "./pages/WinningPage";
import axios from 'axios';
import Layout from './pages/Layout';


const PrivateRoute = ({ isAuthenticated, ...props }: { isAuthenticated: boolean }) => {

  return isAuthenticated ?
    <>
      <Navbar />
      <Outlet />
    </> : <Navigate replace to='/' />
};

const App = () => {


  const WS_URL = 'ws://127.0.0.1:8000';
  const [playerId, setPlayerId] = useState<number>(0);
  const [isAuthenticated, isUserAuthenticated] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [total_user, setTotal_user] = useState<number>(0);
  const [isdisconnectEvent, setIsDisconnectEvent] = useState<boolean>(false);
  const [isplaying1, setIsPlaying1] = useState<boolean>(true);

  const isGameEvent = (message: WebSocketEventMap['message']) => {
    let evt = JSON.parse(message.data);


    if (evt.type === 'randomGameEvent' || evt.type === 'tournamentGameEvent' || evt.type === 'disconnectEvent') {
      const email = JSON.parse(localStorage.getItem('userData')!).email;

      if (evt.data.emails.length === 0) {
        setIsDisconnectEvent(true);
        setTotal_user(0);


      }
      else {

        localStorage.setItem("game_id", JSON.stringify(evt.data.gameId));
        setTotal_user(evt.data.emails.length);

        if (evt.data.emails.length === 2 && isplaying1) {
          if (evt.type === 'tournamentGameEvent') {

            const apiCall = async () => {
              try {
                const { email } = JSON.parse(localStorage.getItem('userData')!);
                const res = await axios.patch(`http://localhost:8800/api/updateCoin`, { coin: -100, email });
              }
              catch (error) {
                if (axios.isAxiosError(error)) {
                  console.log(error.response?.data);
                }
              }
            }
            apiCall();
          }

          if (evt.type === 'randomGameEvent') {
            const apiCall = async () => {
              try {
                const { email } = JSON.parse(localStorage.getItem('userData')!);
                const res = await axios.patch(`http://localhost:8800/api/updateCoin`, { coin: -10, email });
              }
              catch (error) {
                if (axios.isAxiosError(error)) {
                  console.log(error.response?.data);
                }
              }
            }
            apiCall();
          }
          setIsPlaying1(false);
        }

        if (email === evt.data.emails[0]) {
          setPlayerId(1);
        }
        else {
          setIsPlaying(true);
          setPlayerId(2);
        }

      }
    }
    return evt.type === 'randomGameEvent' || evt.type === 'tournamentGameEvent' || evt.event === 'disconnectEvent';
  }

  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isGameEvent
  });




  return (

    <BrowserRouter>

      <Routes>
        <Route path='/' element={<Layout isUserAuthenticated={isUserAuthenticated} />} />


        <Route path='/home' element={<PrivateRoute isAuthenticated={isAuthenticated} />} >
          <Route path='/home' element={<Home />} />
        </Route>

        <Route path='/game' element={<PrivateRoute isAuthenticated={isAuthenticated} />} >
          <Route path='/game'
            element={
              (total_user === 2 ?
                <PingPongBoard playerId={playerId}
                /> :
                (isPlaying || isdisconnectEvent === true ?
                  <WinningPage setIsDisconnectEvent={setIsDisconnectEvent} setIsPlaying={setIsPlaying} setIsPlaying1={setIsPlaying1} /> :
                  <Loading />
                )
              )

            }
          />
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default App;

