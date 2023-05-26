import React, { useEffect, KeyboardEvent, useState } from "react";
import {
    canvasHeight,
    canvasWidth,
    PalletY,
} from "./constants";
import useWebSocket from 'react-use-websocket';
import useCanvas from "./canvas";



import { CanvasProps } from "./types";
// import { time } from "console";

interface ScoreInfo {
    name: string,
}

const PingPongBoard = ({
    playerId,
}: CanvasProps) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [yPlayer1, setYPlayer1] = React.useState(PalletY);
    const [yPlayer2, setYPlayer2] = React.useState(PalletY);
    const [event, setEvent] = React.useState<String | null>(null);
    const [scoreData, setScoreData] = React.useState<ScoreInfo[] | null>(null);
    const [timeRemaining,setIstimeRemaining]=useState<number>(20);
    const [isGameOver,setGameOver]=useState<boolean>(false);



    const WS_URL = 'ws://127.0.0.1:8000';

    const isPaddleEvent = (message: WebSocketEventMap['message']) => {

        let evt = JSON.parse(message.data);

        if (evt.type === 'paddleEvent') {

            if (playerId === 1) {
                if (evt.data.paddle.length === 2) {
                    const [paddle1, paddle2] = evt.data.paddle[1];
                    setYPlayer2(paddle2);
                }
            }
            else {
                const [paddle1, paddle2] = evt.data.paddle[0];
                setYPlayer1(paddle1);
            }
        }
        setEvent(evt.event);
        return evt.type === 'paddleEvent';
    }

    const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
        share: true,
        filter: isPaddleEvent
    });


    useEffect(() => {
        window.addEventListener('keydown', handleUserKeyPress);
        return () => {
            window.removeEventListener('keydown', handleUserKeyPress)
        }
    })

    useEffect(() => {
        const game_id = JSON.parse(localStorage.getItem('game_id')!);

        sendJsonMessage({
            type: 'paddleEvent',
            paddle1: yPlayer1,
            paddle2: yPlayer2,
            game_id,
            playerId
        });

    }, [yPlayer1, yPlayer2])




    useCanvas({
        canvasRef,
        yPlayer1,
        yPlayer2,
        playerId,
        setScoreData,
        timeRemaining,
        setIstimeRemaining,
        isGameOver,
        setGameOver
        
    });



    const handleUserKeyPress = (e: unknown) => {


        if ((e as KeyboardEvent).key === 'ArrowUp' && playerId === 1) {
            setYPlayer1((prev) => (Math.max(prev - 10, 0)));
        } else if ((e as KeyboardEvent).key === 'ArrowDown' && playerId === 1) {
            setYPlayer1((prev) => Math.min(prev + 10, 400 - 100));
        }
        else if ((e as KeyboardEvent).key === 'ArrowUp' && playerId === 2) {
            setYPlayer2((prev) => (Math.max(prev - 10, 0)));
        } else if ((e as KeyboardEvent).key === 'ArrowDown' && playerId === 2) {
            setYPlayer2((prev) => Math.min(prev + 10, 400 - 100));
        }
    };

    return (
        <div style={{ display: "flex", alignContent: "flex-end" }}>
            <div style={{ marginLeft: "40px", marginTop: "-30px" }}>
                {timeRemaining}
            </div>

            <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
        </div>
    );
};

export default PingPongBoard;



