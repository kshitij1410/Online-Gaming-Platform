import React, { useEffect, useState } from "react";
import useWebSocket from 'react-use-websocket';
import {
  canvasWidth,
  canvasHeight,
  Pallet1X,
  Pallet2X,
  initialBall,
} from "./constants";

import {
  drawCanvas,
  drawPallet,
  checkBallCollision,
  checkIfBallIsInCanvas,
  drawBall,
  drawScore
} from "./helpers";

import { Ball } from "./types";
import axios from "axios";
import { Navigate } from "react-router-dom";

interface ScoreInfo {
  name: string,
}

interface UsersProps {
  game_id: string,
  role: string,
  player1_score: number,
  player2_score: number,
  player1_id: string,
  player2_id: string,
}

interface UseCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  yPlayer1: number;
  yPlayer2: number;
  playerId: number;
  setScoreData: React.Dispatch<React.SetStateAction<ScoreInfo[] | null>>,
  timeRemaining: number,
  setIstimeRemaining: React.Dispatch<React.SetStateAction<number>>,
  isGameOver: boolean,
  setGameOver: React.Dispatch<React.SetStateAction<boolean>>

}

interface Score {
  left: number,
  right: number
}

const useCanvas = ({
  canvasRef,
  yPlayer1,
  yPlayer2,
  playerId,
  setScoreData,
  isGameOver,
  setGameOver,
  timeRemaining,
  setIstimeRemaining
}: UseCanvasProps) => {

  const initialUserInfo = {
    game_id: "",
    role: "",
    player1_score: 0,
    player2_score: 0,
    player1_id: "",
    player2_id: "",
  }
  const ball = React.useRef<Ball>(initialBall);
  const WS_URL = 'ws://127.0.0.1:8000';
  const score = React.useRef<Score>({ left: 0, right: 0 });
  const userInfo = React.useRef<UsersProps>(initialUserInfo);


  const isBallEvent = (message: WebSocketEventMap['message']) => {
    let evt = JSON.parse(message.data);
    if (evt.type === 'ballEvent') {
      const [x, y] = evt.data.ball[0];
      ball.current.x = x;
      ball.current.y = y;
    }

    userInfo.current.game_id = evt.data.gameId;
    userInfo.current.role = evt.event;
    if (evt.data.users_id.length === 2) {
      userInfo.current.player1_id = evt.data.ids[0];
      userInfo.current.player2_id = evt.data.ids[1];
    }

    
    return evt.type === 'ballEvent';
  }

  const isScoreEvent = (message: WebSocketEventMap['message']) => {
    let evt = JSON.parse(message.data);

    if (evt.type === 'scoreEvent') {
      if (evt.data.score.length === 1) {
        const [left, right] = evt.data.score[0];
        score.current.left = left;
        score.current.right = right;


      }
    }

    return evt.type === 'scoreEvent';
  }


  const { sendJsonMessage, lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isBallEvent,
  });

  useWebSocket(WS_URL, {
    share: true,
    filter: isScoreEvent,
  });


  const addScore = async () => {
    const q = {
      game_id: userInfo.current.game_id,
      role: userInfo.current.role,
      player1_score: score.current.right,
      player2_score: score.current.left,
      player1_id: userInfo.current.player1_id,
      player2_id: userInfo.current.player2_id
    }

    try {

      const res = await axios.post(`http://localhost:8800/api/addScore`, q);
      console.log(res);

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(error.response?.data);
      }
    }

  }


  useEffect(() => {
    if (timeRemaining > 0) {
      setTimeout(() => {
        setIstimeRemaining((prev) => prev - 1);
      }, 1000)
    }
    else {
      setGameOver(true);
    }
  }, [timeRemaining])


  const game_id = JSON.parse(localStorage.getItem('game_id')!);


  useEffect(() => {

    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Missing canvas ref");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Missing context ref");
    let frameCount = 0;
    let animationFrameId: number | null = null;


    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      drawCanvas({ ctx, frameCount });
      drawPallet({
        ctx,
        frameCount,
        pos: { x: Pallet1X, y: yPlayer1 },
      });


      drawScore(ctx, (score.current.left).toString(), canvasWidth / 4, canvasHeight / 5);
      drawScore(ctx, (score.current.right).toString(), 3 * canvasWidth / 4, canvasHeight / 5);


      const isFirstPlayer = ball.current.x < canvasWidth / 2;

      ball.current = checkBallCollision({
        palletY: isFirstPlayer ? yPlayer1 : yPlayer2,
        palletX: isFirstPlayer ? Pallet1X : Pallet2X,
        ball: ball.current,
        sign: isFirstPlayer ? 1 : -1,
      });

      const { ball: ballUpdated, pointFor } = checkIfBallIsInCanvas(
        ball.current
      );

      ball.current = ballUpdated;

      if (pointFor) {
        if (pointFor === "left")
          score.current.left = score.current.left + 1;
        else {
          score.current.right = score.current.right + 1;
        }

        ball.current = initialBall;
      }

      drawBall({
        ctx,
        frameCount,
        pos: { x: ball.current.x, y: ball.current.y },
      });

      drawPallet({
        ctx,
        frameCount,
        pos: { x: Pallet2X, y: yPlayer2 },
      });

      animationFrameId = window.requestAnimationFrame(render);

      sendJsonMessage({
        type: 'ballEvent',
        x: ball.current.x,
        y: ball.current.y,
        game_id,
      });

      if (pointFor) {

        sendJsonMessage({
          type: 'scoreEvent',
          left: score.current.left,
          right: score.current.right,
          game_id
        });
      }



    };

    render();

    return () => {
      if (animationFrameId) window.cancelAnimationFrame(animationFrameId);
    };

  }, [sendJsonMessage, canvasRef, yPlayer1, yPlayer2]);

  if (isGameOver) {
     
  

    sendJsonMessage({
      type: 'disconnectEvent',
      game_id
    });
    setGameOver(!isGameOver);

      
    //addscore api
    addScore();

  }

};


export default useCanvas;
