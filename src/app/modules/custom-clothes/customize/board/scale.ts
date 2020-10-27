import { CONTROL_OFFSET } from './constants';

/**
 * Función que permite escalar el objeto controlado y su controlador
 * @param e Contiene la información del objeto que ejecuta el evento
 * @param canvas Canvas de fabric donde se renderizan los objetos
 */
export const scaling = (e: any, canvas: any) => {
  // console.log('scaling');
  const selected = canvas.getActiveObject();
  const controlled = canvas._objects.filter(
    (obj: any) => obj.id === selected.idRelated
  )[0];
  // Obtenga las coordenadas y medidas del objeto controlado
  const boudingRect = controlled.getBoundingRect(true, true);
  chooseLimitBorders(
    selected.position,
    boudingRect,
    selected,
    controlled,
    canvas
  );

  // Se validad que si es texto vuelva a renderizar para ver reflejado cambios. Bug de libreria
  if (controlled.text) {
    if (
      controlled.width * controlled.scaleX + controlled.padding * 2 <
        CONTROL_OFFSET * 4 &&
      selected.scaleX < controlled.scaleX
    ) {
      selected.set({
        scaleX: controlled.scaleX,
        scaleY: controlled.scaleY,
        width: controlled.width,
        height: controlled.height,
      });
    } else {
      controlled.set({
        scaleX: selected.scaleX,
        scaleY: selected.scaleY,
      });
      controlled.set({
        diameter: controlled.diameter * 1.0000001,
      });
      selected.set({
        scaleX: controlled.scaleX,
        scaleY: controlled.scaleY,
        width: controlled.width,
        height: controlled.height,
      });
    }
    canvas.renderAll();
  } else if (controlled.type === 'line') {
    controlled.set({
      scaleX: selected.scaleX,
      scaleY: selected.scaleY,
    });
  } else {
    if (
      controlled.width * controlled.scaleX < CONTROL_OFFSET * 4 &&
      selected.scaleX < controlled.scaleX
    ) {
      if (controlled.width * controlled.scaleX >= 25) {
        selected.set({
          padding:
            (2 * (CONTROL_OFFSET * 4 - controlled.width * controlled.scaleX)) /
            3,
        });
        controlled.set({
          padding:
            (2 * (CONTROL_OFFSET * 4 - controlled.width * controlled.scaleX)) /
            3,
        });
      } else {
        selected.set({
          scaleX: controlled.scaleX,
          scaleY: controlled.scaleY,
        });
      }
    } else {
      if (controlled.width * controlled.scaleX < CONTROL_OFFSET * 4) {
        selected.set({
          padding:
            (2 * (CONTROL_OFFSET * 4 - controlled.width * controlled.scaleX)) /
            3,
        });
        controlled.set({
          padding:
            (2 * (CONTROL_OFFSET * 4 - controlled.width * controlled.scaleX)) /
            3,
        });
      } else {
        selected.set({
          padding: 0,
        });
        controlled.set({
          padding: 0,
        });
      }
    }

    controlled.set({
      scaleX: selected.scaleX,
      scaleY: selected.scaleY,
    });
  }
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
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromTop = bounding.top - CONTROL_OFFSET;

  if ((fromLeft <= 0 || fromTop <= 0) && selected.scaleX > controlled.scaleX) {
    selected.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
    controlled.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
  }
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
  const fromTop = bounding.top - CONTROL_OFFSET;
  const fromRight =
    canvas.width - 1 * (bounding.left + bounding.width) - CONTROL_OFFSET;

  if ((fromRight <= 0 || fromTop <= 0) && selected.scaleX > controlled.scaleX) {
    selected.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
    controlled.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
  }
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
  const fromLeft = bounding.left - CONTROL_OFFSET;
  const fromBottom =
    canvas.height - 1 * (bounding.top + bounding.height) - CONTROL_OFFSET;

  if (
    (fromLeft <= 0 || fromBottom <= 0) &&
    selected.scaleX > controlled.scaleX
  ) {
    selected.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
    controlled.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
  }
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
  const fromRight =
    canvas.width - 1 * (bounding.left + bounding.width) - CONTROL_OFFSET;
  const fromBottom =
    canvas.height - 1 * (bounding.top + bounding.height) - CONTROL_OFFSET;

  if (
    (fromRight <= 0 || fromBottom <= 0) &&
    selected.scaleX > controlled.scaleX
  ) {
    selected.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
    controlled.set({
      scaleX: controlled.scaleX,
      scaleY: controlled.scaleY,
    });
  }
};
