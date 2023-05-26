import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const WinningPage = ({ setIsDisconnectEvent,setIsPlaying,setIsPlaying1 }: { setIsDisconnectEvent: React.Dispatch<React.SetStateAction<boolean>>,setIsPlaying:React.Dispatch<React.SetStateAction<boolean>>,setIsPlaying1:React.Dispatch<React.SetStateAction<boolean>> }) => {
    type scoreInfo = {
        name: string,
        score: number
    }

    type Summary = {
        name: string,
        email: string,
        score: number
    }

    const WS_URL = 'ws://127.0.0.1:8000';
    const [event, setisEvent] = useState<Boolean>(false);
    const [score, setScore] = useState<scoreInfo[] | null>(null);
    const [player1_score, setPlayer1_score] = useState<number | null>(null);
    const [player2_score, setPlayer2_score] = useState<number | null>(null);
    const email = useRef<string>('');
    const role = useRef<string>('');
    const [player1_name, setPlayer1Name] = useState<string>('');
    const [player2_name, setPlayer2Name] = useState<string>('');
    const game_id = JSON.parse(localStorage.getItem('game_id')!);
    const [player1_id, setPlayer1Id] = useState<string>('');
    const [player2_id, setPlayer2Id] = useState<string>('');
    const [global_coins, setGlobalCoins] = useState<number>(0);
    const [gamestate, setGameState] = useState<string>('');
    const [gametype, setGameType] = useState<string>('');
    const [getSummary, setGetSummary] = useState<Summary[] | null>(null)
    const [times,setTimes]=useState<number>(0);

    const navigate = useNavigate();
    const userEmail = JSON.parse(localStorage.getItem('userData')!).email;



    const fetchTournamnetScore = async () => {

        try {

            const res = await axios.get(`http://localhost:8800/api/getTournamentScore`);
            console.log(res.data);
            setScore(res.data);
            setisEvent(true);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
            }
        }

    }


    const winningCoin = async () => {
        // debugger
        try {
            let coin = 100;
            if (role.current === 'randomGameEvent') {
                coin = 10;
            }

            // debugger
            console.log("winningCoin", email.current);
            const res = await axios.patch(`http://localhost:8800/api/updateCoin`, { coin, email: email.current });
            console.log(res.data);

        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.log(error.response?.data);
            }
        }
    }

    useEffect(() => {
        const handlefilter = async () => {
            try {
                const res = await axios.post(`http://localhost:8800/api/getSummary`, { state: gamestate, role: gametype });
                setGetSummary(res.data);

            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log(error.response?.data);
                }
            }

        }


        if (gamestate != '' && gametype != '')
            handlefilter();
    }, [gamestate, gametype])



    
    const handleClick = () => {
        navigate('/home', { replace: true });
        setIsDisconnectEvent(false);
        setIsPlaying(false);
        setIsPlaying1(true);
    }

    useEffect(() => {
        const fetchScore = async () => {

            try {
    
                const res = await axios.post(`http://localhost:8800/api/getScore`, { game_id });
    
                console.log("fetchScore", res.data);
                setPlayer1_score(res.data.player1_score);
                setPlayer2_score(res.data.player2_score);
                setPlayer1Id(res.data.player1_id);
                setPlayer2Id(res.data.player2_id);
                if (JSON.parse(localStorage.getItem('userData')!).user_id === res.data.player1_id)
                    setPlayer1Name(JSON.parse(localStorage.getItem('userData')!).name);
                else if (JSON.parse(localStorage.getItem('userData')!).user_id === res.data.player2_id)
                    setPlayer2Name(JSON.parse(localStorage.getItem('userData')!).name)
    
                if (res.data.role === 'tournamentGameEvent') setGlobalCoins(100);
                else setGlobalCoins(10);
    
                role.current = res.data.role;
                email.current = res.data.email;
                console.log("fetchScore", email.current);
    
    
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.log(error.response?.data);
                }
            }
    
            if (role.current === 'tournamentGameEvent') {
                fetchTournamnetScore();
            }

            if (email.current !== '') {
                if (email.current === userEmail && times==0)
                    {
                        setTimes((prev)=> prev+1);
                        winningCoin();
                    }
            }
    
        }
        fetchScore();

    }, [])

    

    return (
        <>
            <div className='text-end'>
                <button className='rounded-full bg-black text-white m-5 px-5 py-2  hover:bg-violet-600 active:bg-violet-700' onClick={ handleClick}>Go to home Page</button>
            </div>

            <div className=' flex flex-row justify-start my-2'>
                <div className='bg-prize1 w-24 h-24 bg-cover mx-24'></div>
                <div className='flex flex-col'>

                    {
                        player1_score !== null && player2_score !== null && (
                            player1_score > player2_score ?
                                (player1_name != '' ? <h1 className='text-3xl font-serif'> You wins by {player1_score - player2_score} score </h1> :
                                    <h1 className='text-3xl font-serif'> You lose by {player1_score - player2_score} score</h1>) :
                                (player1_score < player2_score ?
                                    (player2_name != '' ? <h1 className='text-3xl font-serif'> You wins by {player2_score - player1_score} score </h1>
                                        : <h1 className='text-3xl font-serif'> You lose by {player2_score - player1_score} score</h1>) : <h1 className='text-3xl font-serif'>Game is tie</h1>)
                        )


                    }

                    {
                        player1_score !== null && player2_score !== null && (
                            player1_score > player2_score ?
                                (player1_name != '' ? <h1 className='text-3xl font-serif'> Congrulation you won {global_coins} coin </h1> :
                                    <h1 className='text-3xl font-serif'> Better luck next time..</h1>) :
                                (player1_score < player2_score ?
                                    (player2_name != '' ? <h1 className='text-3xl font-serif'> Congrulation you won {global_coins} coin </h1>
                                        : <h1 className='text-3xl font-serif'> Better luck next time..</h1>) : <h1></h1>)
                        )
                    }
                </div>
            </div>

            {/* leaderboard  */}


            <div className=' flex flex-row w-screen'>
                {
                    event &&

                    <div className='w-1/2 flex flex-col' style={{ minHeight: "63vh" }}>
                        <h1 className='ml-7 mb-5 text-2xl my-16'>LEADERBOARD:  Highest Score:-</h1>

                        <div className="flex flex-col">
                            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                                    <div className="overflow-hidden">
                                        <table className="min-w-full text-left text-sm font-light">
                                            <thead className="border-b font-medium dark:border-neutral-500">
                                                <tr>
                                                    <th scope="col" className="px-6 py-4">#</th>
                                                    <th scope="col" className="px-6 py-4">Name</th>
                                                    <th scope="col" className="px-6 py-4">Score</th>

                                                </tr>
                                            </thead>
                                            <tbody>

                                                {
                                                    score !== null ?
                                                        score?.map((item, idx) => {
                                                            return (
                                                                <tr className="border-b dark:border-neutral-500">
                                                                    <td className="whitespace-nowrap px-6 py-4 font-medium">{idx}</td>
                                                                    <td className="whitespace-nowrap px-6 py-4">{item.name}</td>
                                                                    <td className="whitespace-nowrap px-6 py-4">{item.score}</td>
                                                                </tr>
                                                            );
                                                        })
                                                        : <h3>User Score not found</h3>
                                                }

                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }



                {/* filtering */}
                <div className='flex flex-col w-1/2 rtl border-s-2 border-gray-100 ' style={{ minHeight: "63vh" }}>
                    <h1 className='ml-7 mb-5 text-2xl'>SUMMARY: For Last 5 Matches:-</h1>
                    <div className='w-1/2 flex flex-row ml-12 justify-evenly'>

                        <div className='mr-10 '>
                            <select name="Role" id="role" onChange={(e) => setGameType(e.target.value)} className='rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
                                <option selected>Choose Game Type</option>
                                <option value="all">All</option>
                                <option value="random">Random</option>
                                <option value="tournament">Tournament</option>

                            </select>
                        </div>

                        <div className='ml-10 '>
                            <select name="State" id="state" onChange={(e) => setGameState(e.target.value)} className='rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50'>
                                <option selected>Choose from win/lose</option>
                                <option value="win">Winning</option>
                                <option value="lose">Lose</option>

                            </select>
                        </div>
                    </div>

                    <div className='mt-16'>

                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">
                                            Name
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Email
                                        </th>
                                        <th scope="col" className="px-6 py-3">
                                            Score
                                        </th>

                                    </tr>
                                </thead>
                                <tbody>

                                    {
                                        getSummary != null ?
                                            getSummary?.map((item, key) => {
                                                return (
                                                    <tr className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">

                                                        <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                            {item.name}
                                                        </th>
                                                        <th className="px-6 py-4">
                                                            {item.email}
                                                        </th>
                                                        <td className="px-6 py-4">
                                                            {item.score}
                                                        </td>
                                                    </tr>
                                                )
                                            }) :
                                            <h1>User Summary not found!</h1>
                                    }




                                </tbody>
                            </table>
                        </div>
                    </div>
                </div >
            </div >
        </>
    )
}

export default WinningPage;