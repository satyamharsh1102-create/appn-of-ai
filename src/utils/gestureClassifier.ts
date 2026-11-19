import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { ClassificationResult } from '../types';

/**
 * Standard 21-point MediaPipe Hand skeleton connections.
 */
export const HAND_CONNECTIONS: ReadonlyArray<[number, number]> = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4], // Thumb
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8], // Index
  [5, 9],
  [9, 10],
  [10, 11],
  [11, 12], // Middle
  [9, 13],
  [13, 14],
  [14, 15],
  [15, 16], // Ring
  [13, 17],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20], // Pinky & Palm
];

function distance2D(a: NormalizedLandmark, b: NormalizedLandmark): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function isFingerExtended(
  landmarks: NormalizedLandmark[],
  mcpIdx: number,
  pipIdx: number,
  tipIdx: number
): boolean {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];

  const wristToTip = distance2D(wrist, tip);
  const wristToPip = distance2D(wrist, pip);
  const wristToMcp = distance2D(wrist, mcp);

  return wristToTip > wristToPip * 1.1 && wristToTip > wristToMcp * 1.32;
}

function isFingerCurled(
  landmarks: NormalizedLandmark[],
  mcpIdx: number,
  pipIdx: number,
  tipIdx: number,
  palmSize: number
): boolean {
  const wrist = landmarks[0];
  const mcp = landmarks[mcpIdx];
  const pip = landmarks[pipIdx];
  const tip = landmarks[tipIdx];

  const wristToTip = distance2D(wrist, tip);
  const wristToPip = distance2D(wrist, pip);
  const mcpToTip = distance2D(mcp, tip);

  return wristToTip < wristToPip * 1.06 || mcpToTip < palmSize * 0.68;
}

/**
 * Rule-based prototype classifier using MediaPipe's 21 normalized hand landmarks.
 * Supports 20 mutually exclusive everyday hand gestures.
 */
export function classifyHandGesture(
  landmarks: NormalizedLandmark[]
): ClassificationResult | null {
  if (!landmarks || landmarks.length < 21) {
    return null;
  }

  const wrist = landmarks[0];
  const thumbIp = landmarks[3];
  const thumbTip = landmarks[4];
  const indexMcp = landmarks[5];
  const indexTip = landmarks[8];
  const middleMcp = landmarks[9];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyMcp = landmarks[17];
  const pinkyTip = landmarks[20];

  const palmSize = Math.max(distance2D(wrist, middleMcp), 0.001);

  const indexExt = isFingerExtended(landmarks, 5, 6, 8);
  const middleExt = isFingerExtended(landmarks, 9, 10, 12);
  const ringExt = isFingerExtended(landmarks, 13, 14, 16);
  const pinkyExt = isFingerExtended(landmarks, 17, 18, 20);

  const indexCurled = isFingerCurled(landmarks, 5, 6, 8, palmSize);
  const middleCurled = isFingerCurled(landmarks, 9, 10, 12, palmSize);
  const ringCurled = isFingerCurled(landmarks, 13, 14, 16, palmSize);
  const pinkyCurled = isFingerCurled(landmarks, 17, 18, 20, palmSize);

  const thumbOut =
    distance2D(thumbTip, indexMcp) > palmSize * 0.56 &&
    distance2D(thumbTip, pinkyMcp) > distance2D(thumbIp, pinkyMcp) * 1.05;

  const thumbUpward =
    thumbTip.y < thumbIp.y - palmSize * 0.1 &&
    thumbTip.y < indexMcp.y - palmSize * 0.14 &&
    distance2D(thumbTip, indexMcp) > palmSize * 0.52;

  const thumbDownward =
    thumbTip.y > thumbIp.y + palmSize * 0.1 &&
    thumbTip.y > indexMcp.y + palmSize * 0.12 &&
    distance2D(thumbTip, indexMcp) > palmSize * 0.48;

  const thumbIndexPinch = distance2D(thumbTip, indexTip) < palmSize * 0.42;

  const dx = Math.abs(middleMcp.x - wrist.x);
  const dy = Math.abs(middleMcp.y - wrist.y);
  const isHorizontal = dx > dy * 0.85;
  const isUpright = middleMcp.y < wrist.y && !isHorizontal;
  const isDownward = middleMcp.y > wrist.y && !isHorizontal;

  // 1. OK: Thumb & index tips touching in a circle; middle, ring, pinky extended
  if (thumbIndexPinch && middleExt && ringExt && pinkyExt) {
    return {
      gestureId: 'ok',
      word: 'OK',
      confidence: 0.93,
      summary: 'Thumb and index pinched in a circle with three fingers up',
    };
  }

  // 2. Four-finger open hand shapes: Welcome, Thank You, Hello, Please
  if (indexExt && middleExt && ringExt && pinkyExt) {
    if (isDownward) {
      return {
        gestureId: 'welcome',
        word: 'Welcome',
        confidence: 0.9,
        summary: 'Open flat hand oriented downward',
      };
    }

    if (isHorizontal) {
      return {
        gestureId: 'thank_you',
        word: 'Thank You',
        confidence: 0.9,
        summary: 'Flat open hand angled outward',
      };
    }

    if (isUpright) {
      const avgSpread =
        (distance2D(indexTip, middleTip) +
          distance2D(middleTip, ringTip) +
          distance2D(ringTip, pinkyTip)) /
        (3 * palmSize);

      if (avgSpread >= 0.31) {
        const confidence = Math.min(0.97, 0.86 + (avgSpread - 0.31) * 0.45);
        return {
          gestureId: 'hello',
          word: 'Hello',
          confidence: Number(confidence.toFixed(2)),
          summary: 'Open upright palm with spread fingers',
        };
      }

      const confidence = Math.min(0.95, 0.85 + (0.31 - avgSpread) * 0.5);
      return {
        gestureId: 'please',
        word: 'Please',
        confidence: Number(confidence.toFixed(2)),
        summary: 'Flat upright palm with fingers together',
      };
    }
  }

  // 3. Water: Index, middle, and ring extended (ASL 'W'); pinky and thumb curled
  if (indexExt && middleExt && ringExt && pinkyCurled && !thumbOut) {
    return {
      gestureId: 'water',
      word: 'Water',
      confidence: 0.92,
      summary: 'Index, middle, and ring extended in a W shape',
    };
  }

  // 4. Index + Pinky shapes: I Love You (thumb out) vs Awesome (thumb tucked)
  if (indexExt && middleCurled && ringCurled && pinkyExt) {
    if (thumbOut) {
      return {
        gestureId: 'i_love_you',
        word: 'I Love You',
        confidence: 0.94,
        summary: 'Thumb, index, and pinky extended',
      };
    }

    return {
      gestureId: 'awesome',
      word: 'Awesome',
      confidence: 0.92,
      summary: 'Index and pinky extended with thumb tucked',
    };
  }

  // 5. Index + Middle shapes: Three (thumb out), Peace (spread V), No (together)
  if (indexExt && middleExt && ringCurled && pinkyCurled) {
    if (thumbOut) {
      return {
        gestureId: 'three',
        word: 'Three',
        confidence: 0.92,
        summary: 'Thumb, index, and middle extended (ASL 3)',
      };
    }

    const indexMiddleSpread = distance2D(indexTip, middleTip) / palmSize;
    if (indexMiddleSpread >= 0.33) {
      return {
        gestureId: 'peace',
        word: 'Peace',
        confidence: 0.93,
        summary: 'Index and middle fingers spread apart in a V',
      };
    }

    return {
      gestureId: 'no',
      word: 'No',
      confidence: 0.91,
      summary: 'Index and middle held together, ring and pinky curled',
    };
  }

  // 6. Pinky-only shapes: Call Me (thumb out) vs Promise (pinky only)
  if (indexCurled && middleCurled && ringCurled && pinkyExt) {
    if (thumbOut) {
      return {
        gestureId: 'call_me',
        word: 'Call Me',
        confidence: 0.93,
        summary: 'Thumb and pinky extended in telephone handshape',
      };
    }

    return {
      gestureId: 'promise',
      word: 'Promise',
      confidence: 0.91,
      summary: 'Only pinky finger extended upright',
    };
  }

  // 7. Index-only shapes: Go (sideways), Here (down), Later (L shape), Wait (up)
  if (indexExt && middleCurled && ringCurled && pinkyCurled) {
    const idxDx = Math.abs(indexTip.x - indexMcp.x);
    const idxDy = indexTip.y - indexMcp.y;

    if (idxDx > Math.abs(idxDy) * 1.1) {
      return {
        gestureId: 'go',
        word: 'Go',
        confidence: 0.91,
        summary: 'Index finger pointing horizontally sideways',
      };
    }

    if (idxDy > palmSize * 0.32 && Math.abs(idxDy) >= idxDx * 0.9) {
      return {
        gestureId: 'here',
        word: 'Here',
        confidence: 0.91,
        summary: 'Index finger pointing straight downward',
      };
    }

    if (idxDy < -palmSize * 0.32 && Math.abs(idxDy) >= idxDx * 0.9) {
      if (thumbOut) {
        return {
          gestureId: 'later',
          word: 'Later',
          confidence: 0.93,
          summary: 'Thumb sideways and index upward (ASL L)',
        };
      }

      return {
        gestureId: 'wait',
        word: 'Wait',
        confidence: 0.92,
        summary: 'Single index finger pointing straight upward',
      };
    }
  }

  // 8. Closed-finger shapes: Help (thumbs up), Bad (thumbs down), Yes (fist)
  if (indexCurled && middleCurled && ringCurled && pinkyCurled) {
    if (thumbUpward) {
      return {
        gestureId: 'help',
        word: 'Help',
        confidence: 0.93,
        summary: 'Thumb pointing upward with curled fingers',
      };
    }

    if (thumbDownward) {
      return {
        gestureId: 'bad',
        word: 'Bad',
        confidence: 0.92,
        summary: 'Thumb pointing downward with curled fingers',
      };
    }

    return {
      gestureId: 'yes',
      word: 'Yes',
      confidence: 0.9,
      summary: 'Closed fist with thumb folded across',
    };
  }

  return null;
}

/**
 * Draws the 21 MediaPipe hand landmarks and skeleton connections onto a 2D canvas.
 */
export function drawHandLandmarks(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  width: number,
  height: number,
  hasRecognizedGesture: boolean
): void {
  const strokeColor = hasRecognizedGesture ? '#2563EB' : '#7C3AED';
  const jointFill = hasRecognizedGesture ? '#FFFFFF' : '#F5F3FF';
  const jointStroke = hasRecognizedGesture ? '#6D28D9' : '#2563EB';

  ctx.save();
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = strokeColor;

  for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
    const start = landmarks[startIdx];
    const end = landmarks[endIdx];
    if (!start || !end) continue;

    ctx.beginPath();
    ctx.moveTo(start.x * width, start.y * height);
    ctx.lineTo(end.x * width, end.y * height);
    ctx.stroke();
  }

  for (let i = 0; i < landmarks.length; i++) {
    const point = landmarks[i];
    const isFingertip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
    const radius = isFingertip ? 5.5 : 4;

    ctx.beginPath();
    ctx.arc(point.x * width, point.y * height, radius, 0, Math.PI * 2);
    ctx.fillStyle = jointFill;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = jointStroke;
    ctx.stroke();
  }

  ctx.restore();
}
