import {
    canvasHeight,
    canvasWidth,
    hPallet,
    radius,
    wPallet,
  } from "./constants";
  import {
    DrawMoverProps,
    DrawProps,
    Ball,
    Player,
    CollisionType
  } from "./types";
  
  export const drawPallet = ({ ctx, pos: { x, y } }: DrawMoverProps) => {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x, y, wPallet, hPallet);
  };
  
  export const drawBall = ({ ctx, pos: { x, y } }: DrawMoverProps) => {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.closePath();
  };
  
  export const drawScore =(ctx:CanvasRenderingContext2D,text:string,x:number,y:number)=>{
    ctx.fillStyle="white";
    ctx.font="60px Arial";
    ctx.fillText(text,x,y);
  }

  export const drawCanvas = ({ ctx, frameCount }: DrawProps) => {

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvasWidth,canvasHeight);

    for(let i=0;i<=canvasHeight;i+=20){
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect((canvasWidth-2)/2,0+i,2,10)
    }
  };
  
  export const checkIfBallIsInCanvas = (originalBall: Ball) => {
    let ball = { ...originalBall };
    const { velocityX, velocityY } = ball;
    ball.x += velocityX;
    ball.y += velocityY;
    let pointFor: String | null = null;
    if (ball.y + ball.radius > canvasHeight || ball.y - ball.radius < 0) {
      ball.velocityY = -velocityY;
    }

    if (
      ball.x + ball.radius > canvasWidth
    ) {
      // pointFor = Player.LEFT;
      pointFor="left";
      ball.velocityX = -velocityX;
    }
    
    if (
      ball.x - ball.radius < 0
    ) {
      // pointFor = Player.RIGHT;
      pointFor="right";
      ball.velocityX = -velocityX;
    }
  
    return { ball, pointFor };
  };
  
  export const isCollision = ({ palletY, palletX, ball }: CollisionType) => {
    const palletTop = palletY;
    const palletBottom = palletY + hPallet;
    const palletRight = palletX + wPallet;
    const palletLeft = palletX;
  
    const ballTop = ball.y - ball.radius;
    const ballLeft = ball.x - ball.radius;
    const ballRight = ball.x + ball.radius;
    const ballBottom = ball.y + ball.radius;
    //  debugger
    return (
      ballRight > palletLeft &&
      ballLeft < palletRight &&
      ballTop < palletBottom &&
      ballBottom > palletTop
    );
  };
  
  export const checkBallCollision = (props: CollisionType & { sign: 1 | -1 }) => {
    const { palletY, ball: ballOriginal, sign } = props;
    let ball = { ...ballOriginal };
    // debugger
  
    if (isCollision(props)) {
      const pointOfColission = (ball.y - (palletY + hPallet / 2)) / (hPallet / 2);
      const angle = (pointOfColission * Math.PI) / 4;
      ball.velocityX = sign * ball.speed * Math.cos(angle);
      ball.velocityY = ball.speed * Math.sin(angle);
      // ball.speed += 0.1;
    }
    return ball;
  };
  