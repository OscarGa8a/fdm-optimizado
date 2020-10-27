import { CONTROL_OFFSET } from './constants';
import { setControlFromPosition } from './controls';
// import { Canvas, Object } from "./interfaces";
/**
 * Función que permite mover el objeto controlado y su controlador
 * @param e Contiene la información del objeto que ejecuta el evento
 * @param canvas Canvas de fabric donde se renderizan los objetos
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 */
export const moving = (e: any, canvas: any, action: any) => {
  // console.log('moving');
  // Obtiene el objeto controlado y su controlador
  const selected = canvas.getActiveObject();
  const controlled = canvas._objects.filter(
    (obj: any) => obj.id === selected.idRelated
  )[0];
  // Asigna al objeto controlado las coordenadas de su controlador
  controlled.set({
    left: selected.left,
    top: selected.top,
  });
  // Obtenga las coordenadas y medidas del objeto controlado
  const boundingRect = controlled.getBoundingRect(true, true);
  // Asigna al controlador las coordenadas del objeto controlado
  selected.set({
    left: boundingRect.left + boundingRect.width / 2,
    top: boundingRect.top + boundingRect.height / 2,
  });
  // Obtiene la posición de los botones del controlador
  const newPosition = calculatePosition(boundingRect, canvas, selected.position);
  if (selected.position === newPosition) {
  } else {
    selected.position = newPosition;
    setControlFromPosition(newPosition, selected, action, controlled);
  }
  chooseLimitBorders(newPosition, boundingRect, selected, controlled, canvas);
};
/**
 * Función que calcula la posición para los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param canvas Canvas de fabric donde se renderizan los objetos
 * @param lastPosition Última posición de los botones del controlador
 * @returns Devuelve la posición de los botones del controlador
 */
const calculatePosition = (bounding: any, canvas: any, lastPosition: any) => {
  // console.log('calculatePosition');
  // Obtiene la distancia del canvas al objeto en todas las direcciones
  const fromLeft = bounding.left;
  const fromRight = canvas.width - bounding.left - bounding.width;
  const fromTop = bounding.top;
  const fromBottom = canvas.height - bounding.top - bounding.height;

  let vertical: any;
  let horizontal: any;
  // Obtiene la posición vertical y horizontal de los botones
  if (fromLeft < fromRight && fromLeft < canvas.width * 0.2) {
    horizontal = 'LEFT';
  }
  if (fromRight < fromLeft && fromRight < canvas.width * 0.2) {
    horizontal = 'RIGHT';
  }
  if (fromTop < fromBottom && fromTop < canvas.height * 0.2) {
    vertical = 'TOP';
  }
  if (fromBottom < fromTop && fromBottom < canvas.height * 0.2) {
    vertical = 'BOTTOM';
  }
  // Si el objeto es de mayor tamaño al canvas, retorne la ultima posici{on}
  if (canvas.width < bounding.width || canvas.height < bounding.height) {
    return lastPosition;
  }
  if (!vertical && !horizontal) {
    return lastPosition;
  }
  if (!vertical) {
    const a =
      horizontal === 'LEFT'
        ? lastPosition.replace('RIGHT', 'LEFT')
        : lastPosition.replace('LEFT', 'RIGHT');
    return a;
  }
  if (!horizontal) {
    const a =
      vertical === 'TOP'
        ? lastPosition.replace('BOTTOM', 'TOP')
        : lastPosition.replace('TOP', 'BOTTOM');
    return a;
  }
  return `${vertical}_${horizontal}`;
};
/**
 * Función que asigna los límites del objeto controlado y su controlador
 * @param position Posición de los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const chooseLimitBorders = (
  position: any,
  bounding: any,
  selected: any,
  controlled: any,
  canvas: any
) => {
  // console.log('chooseLimitBorders');
  switch (position) {
    case 'BOTTOM_RIGHT':
      limitTopLeft(bounding, selected, controlled, canvas);
      break;
    case 'BOTTOM_LEFT':
      limitTopRight(bounding, selected, controlled, canvas);
      break;
    case 'TOP_RIGHT':
      limitBottomLeft(bounding, selected, controlled, canvas);
      break;
    case 'TOP_LEFT':
      limitBottomRight(bounding, selected, controlled, canvas);
      break;
    default:
      break;
  }
};
/**
 * Función que asigna la posición límite top-left al objeto controlado y su controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitTopLeft = (bounding: any, selected: any, controlled: any, canvas: any) => {
  // console.log('limitTopLeft');
  bounding.width = bounding.width + selected.padding * 2;
  bounding.height = bounding.height + selected.padding * 2;
  bounding.left = bounding.left - selected.padding;
  bounding.top = bounding.top - selected.padding;
  const fromLeft = bounding.left;
  const fromTop = bounding.top;
  const fromRight = canvas.width - 1 * (bounding.left + bounding.width);
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromTop - CONTROL_OFFSET <= 0) {
    selected.set({
      top: bounding.height / 2 + CONTROL_OFFSET,
    });
    controlled.set({
      top: bounding.height / 2 + CONTROL_OFFSET,
    });
  }
  if (fromLeft - CONTROL_OFFSET <= 0) {
    selected.set({
      left: bounding.width / 2 + CONTROL_OFFSET,
    });
    controlled.set({
      left: bounding.width / 2 + CONTROL_OFFSET,
    });
  }
  if (fromRight - CONTROL_OFFSET <= -bounding.width / 2) {
    selected.set({
      left: canvas.width - CONTROL_OFFSET,
    });
    controlled.set({
      left: canvas.width - CONTROL_OFFSET,
    });
  }
  if (fromBottom - CONTROL_OFFSET <= -bounding.height / 2) {
    selected.set({
      top: canvas.height - CONTROL_OFFSET,
    });
    controlled.set({
      top: canvas.height - CONTROL_OFFSET,
    });
  }
  selected.setCoords();
  controlled.setCoords();
};
/**
 * Función que asigna la posición límite top-right al objeto controlado y su controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitTopRight = (bounding: any, selected: any, controlled: any, canvas: any) => {
  // console.log('limitTopRight');
  bounding.width = bounding.width + selected.padding * 2;
  bounding.height = bounding.height + selected.padding * 2;
  bounding.left = bounding.left - selected.padding;
  bounding.top = bounding.top - selected.padding;

  const fromLeft = bounding.left;
  const fromTop = bounding.top;
  const fromRight = canvas.width - 1 * (bounding.left + bounding.width);
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromTop - CONTROL_OFFSET <= 0) {
    selected.set({
      top: bounding.height / 2 + CONTROL_OFFSET,
    });
    controlled.set({
      top: bounding.height / 2 + CONTROL_OFFSET,
    });
  }
  if (fromRight - CONTROL_OFFSET <= 0) {
    selected.set({
      left: canvas.width - bounding.width / 2 - CONTROL_OFFSET,
    });
    controlled.set({
      left: canvas.width - bounding.width / 2 - CONTROL_OFFSET,
    });
  }
  if (fromLeft - CONTROL_OFFSET <= -bounding.width / 2) {
    selected.set({
      left: 0 + CONTROL_OFFSET,
    });
    controlled.set({
      left: 0 + CONTROL_OFFSET,
    });
  }
  if (fromBottom - CONTROL_OFFSET <= -bounding.height / 2) {
    selected.set({
      top: canvas.height - CONTROL_OFFSET,
    });
    controlled.set({
      top: canvas.height - CONTROL_OFFSET,
    });
  }
  selected.setCoords();
  controlled.setCoords();
};
/**
 * Función que asigna la posición límite bottom-left al objeto controlado y su controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitBottomLeft = (bounding: any, selected: any, controlled: any, canvas: any) => {
  // console.log('limitBottomLeft');
  bounding.width = bounding.width + selected.padding * 2;
  bounding.height = bounding.height + selected.padding * 2;
  bounding.left = bounding.left - selected.padding;
  bounding.top = bounding.top - selected.padding;
  const fromLeft = bounding.left;
  const fromTop = bounding.top;
  const fromRight = canvas.width - 1 * (bounding.left + bounding.width);
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromBottom - CONTROL_OFFSET <= 0) {
    selected.set({
      top: canvas.height - bounding.height / 2 - CONTROL_OFFSET,
    });
    controlled.set({
      top: canvas.height - bounding.height / 2 - CONTROL_OFFSET,
    });
  }
  if (fromLeft - CONTROL_OFFSET <= 0) {
    selected.set({
      left: bounding.width / 2 + CONTROL_OFFSET,
    });
    controlled.set({
      left: bounding.width / 2 + CONTROL_OFFSET,
    });
  }
  if (fromRight - CONTROL_OFFSET <= -bounding.width / 2) {
    selected.set({
      left: canvas.width - CONTROL_OFFSET,
    });
    controlled.set({
      left: canvas.width - CONTROL_OFFSET,
    });
  }
  if (fromTop - CONTROL_OFFSET <= -bounding.height / 2) {
    selected.set({
      top: CONTROL_OFFSET,
    });
    controlled.set({
      top: CONTROL_OFFSET,
    });
  }
  selected.setCoords();
  controlled.setCoords();
};
/**
 * Función que asigna la posición límite bottom-right al objeto controlado y su controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitBottomRight = (bounding: any, selected: any, controlled: any, canvas: any) => {
  // console.log('limitBottomRight');
  bounding.width = bounding.width + selected.padding * 2;
  bounding.height = bounding.height + selected.padding * 2;
  bounding.left = bounding.left - selected.padding;
  bounding.top = bounding.top - selected.padding;
  const fromLeft = bounding.left;
  const fromTop = bounding.top;
  const fromRight = canvas.width - 1 * (bounding.left + bounding.width);
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromBottom - CONTROL_OFFSET <= 0) {
    selected.set({
      top: canvas.height - bounding.height / 2 - CONTROL_OFFSET,
    });
    controlled.set({
      top: canvas.height - bounding.height / 2 - CONTROL_OFFSET,
    });
  }
  if (fromRight - CONTROL_OFFSET <= 0) {
    selected.set({
      left: canvas.width - bounding.width / 2 - CONTROL_OFFSET,
    });
    controlled.set({
      left: canvas.width - bounding.width / 2 - CONTROL_OFFSET,
    });
  }
  if (fromLeft - CONTROL_OFFSET <= -bounding.width / 2) {
    selected.set({
      left: 0 + CONTROL_OFFSET,
    });
    controlled.set({
      left: 0 + CONTROL_OFFSET,
    });
  }
  if (fromTop - CONTROL_OFFSET <= -bounding.height / 2) {
    selected.set({
      top: CONTROL_OFFSET,
    });
    controlled.set({
      top: CONTROL_OFFSET,
    });
  }
  selected.setCoords();
  controlled.setCoords();
};
