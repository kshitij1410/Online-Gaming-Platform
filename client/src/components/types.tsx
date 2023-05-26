import { Dispatch, SetStateAction } from "react";

export enum Player {
  LEFT = "left",
  RIGHT = "right",
}

export type Score = {
  [Player.LEFT]: number;
  [Player.RIGHT]: number;
};


export interface CanvasProps {
  playerId:number,
}

export type CollisionType = {
  palletY: number;
  palletX: number;
  ball: Ball;
};

export type DrawProps = {
  ctx: CanvasRenderingContext2D;
  frameCount?: number;
};

export type Position = { x: number; y: number };
export type DrawMoverProps = {
  pos: Position;
} & DrawProps;

export type Ball = {
velocityX: number;
velocityY: number;
  radius: number;
  x: number;
  y: number;
  speed:number;
};
