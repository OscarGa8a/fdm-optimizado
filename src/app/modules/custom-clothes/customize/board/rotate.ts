import { CONTROL_OFFSET } from './constants';
/**
 * Valor de la escala por defecto del objeto controlado
 */
const SCALE = 0.9965;
// const SCALE = 0.975;
/**
 * Función que permite rotar el objeto controlado y su controlador
 * @param e Contiene la información del objeto que ejecuta el evento
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
export const rotating = (e: any, canvas: any) => {
  // console.log('rotating');
  // Obtiene el objeto controlado y su controlador
  const selected = canvas.getActiveObject();
  const controlled = canvas._objects.filter(
    (obj: any) => obj.id === selected.idRelated
  )[0];
  // Asigna al objeto controlado el ángulo de su controlador
  controlled.set({
    angle: selected.initialAngle + selected.angle,
  });
  // Obtenga las coordenadas y medidas del objeto controlado
  const boundingRect = controlled.getBoundingRect(true, true);
  // Asigna al controlador angulo, ancho, alto y escalas
  selected.set({
    angle: 0,
    width: boundingRect.width / selected.scaleX,
    height: boundingRect.height / selected.scaleY,
    scaleX: selected.scaleX,
    scaleY: selected.scaleY,
    // left: boundingRect.left + boundingRect.width / 2,
    // top: boundingRect.top + boundingRect.height / 2,
  });
  const sLeft = selected.left - (selected.width * selected.scaleX) / 2;
  const sTop = selected.top - (selected.height * selected.scaleY) / 2;
  const xOffset = sLeft - boundingRect.left;
  const yOffset = sTop - boundingRect.top;
  // Obtiene y asigna las nuevas posiciones al objeto controlado
  const newLeft = controlled.left + xOffset;
  const newTop = controlled.top + yOffset;
  controlled.set({
    left: newLeft,
    top: newTop,
  });

  chooseLimitBorders(
    selected.position,
    boundingRect,
    selected,
    controlled,
    canvas
  );
};
/**
 * Función llamada cuando el objeto termina de girar que asigna el ángulo inicial
 * del controlador
 * @param e Contiene la información del objeto que ejecuta el evento
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
export const rotated = (e: any, canvas: any) => {
  // console.log('rotated');
  const selected = canvas.getActiveObject();
  const controlled = canvas._objects.filter(
    (obj: any) => obj.id === selected.idRelated
  )[0];
  selected.initialAngle = controlled.angle;
};
/**
 * Función que asigna las posiciones a los botones del controlador
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
 * Función que asigna la posición top-left a los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitTopLeft = (bounding: any, selected: any, controlled: any, canvas: any) => {
  // console.log('limitTopLeft');
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromTop = bounding.top - CONTROL_OFFSET;
  const fromRight = canvas.width - 1 * (bounding.left + bounding.width);
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromLeft <= 0 || fromTop <= 0) {
    selected.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
    controlled.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
  }
};
/**
 * Función que asigna la posición top-right a los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitTopRight = (bounding, selected, controlled, canvas) => {
  // console.log('limitTopRight');
  const fromTop = bounding.top - CONTROL_OFFSET;
  const fromRight =
    canvas.width - 1 * (bounding.left + bounding.width) - CONTROL_OFFSET;
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromBottom = canvas.height - 1 * (bounding.top + bounding.height);

  if (fromRight <= 0 || fromTop <= 0) {
    selected.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
    controlled.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
  }
};
/**
 * Función que asigna la posición bottom-left a los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitBottomLeft = (bounding, selected, controlled, canvas) => {
  // console.log('limitBottomLeft');
  const fromTop = bounding.top - CONTROL_OFFSET;
  const fromRight =
    canvas.width - 1 * (bounding.left + bounding.width) - CONTROL_OFFSET;
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromBottom =
    canvas.height - 1 * (bounding.top + bounding.height) - CONTROL_OFFSET;

  if (fromLeft <= 0 || fromBottom <= 0) {
    selected.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
    controlled.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
  }
};
/**
 * Función que asigna la posición bottom-right a los botones del controlador
 * @param bounding Contiene las coordenadas y medidas del objeto controlado
 * @param selected Controlador del objeto seleccionado
 * @param controlled Objeto controlado en el canvas
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
const limitBottomRight = (bounding, selected, controlled, canvas) => {
  // console.log('limitBottomRight');
  const fromTop = bounding.top - CONTROL_OFFSET;
  const fromRight =
    canvas.width - 1 * (bounding.left + bounding.width) - CONTROL_OFFSET;
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromBottom =
    canvas.height - 1 * (bounding.top + bounding.height) - CONTROL_OFFSET;

  if (fromRight <= 0 || fromBottom <= 0) {
    selected.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
    controlled.set({
      scaleX: selected.scaleX * SCALE,
      scaleY: selected.scaleY * SCALE,
    });
  }
};
