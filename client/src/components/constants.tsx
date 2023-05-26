export const canvasHeight = 400;
export const canvasWidth = 600;

export const radius = 8;

export const { wPallet, hPallet } = { wPallet: 15, hPallet: 100 };
export const Pallet1X = 20;
export const Pallet2X = canvasWidth - 20 - wPallet;

export const PalletY = canvasHeight / 2 - hPallet / 2;

export const initialBall = {
  radius: 8,
  x: canvasWidth / 2,
  y: 200,
  velocityY: 0,
  velocityX: 5,
  speed:5,
};
