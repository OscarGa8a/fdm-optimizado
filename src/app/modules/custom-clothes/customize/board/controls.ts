import { fabric } from 'fabric';
import 'fabric-customise-controls';
import { CONTROL_OFFSET } from './constants';

/**
 * Función que permite crear los controles personalizados en la posición top-right
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controled Objeto que fue renderizado en el canvas
 */
export const controlsTopRight = (obj: any, action: any, controled: any) => {
  // console.log('controlsTopRight');
  generalSetUp();
  hideControls(obj);
  // Renderiza solo tres controles de los nueve
  obj.setControlVisible('mt', true);
  obj.setControlVisible('tr', true);
  obj.setControlVisible('mr', true);
  // Indica el tipo de icono a mostrar al pararse encima del control y la acción de los controles personalizados
  // @ts-ignore
  fabric.Canvas.prototype.customiseControls({
    tr: {
      cursor: 'ne-resize',
      action: 'scale',
    },
    mr: {
      action: 'rotate',
      cursor: 'grabbing',
    },
    mt: {
      action: action,
      cursor: 'pointer',
    },
  });
  // Asigna el icono a cada uno de los controles personalizados
  // @ts-ignore
  fabric.Object.prototype.customiseCornerIcons({
    tr: {
      icon: 'assets/fabric-icons/resize.svg',
    },
    mr: {
      icon: 'assets/fabric-icons/rotate.svg',
    },
    tl: {
      icon: 'assets/fabric-icons/edit.svg',
    },
  });
};
/**
 * Función que permite crear los controles personalizados en la posición top-left
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controled Objeto que fue renderizado en el canvas
 */
export const controlsTopLeft = (obj: any, action: any, controled: any) => {
  // console.log('controlsTopLeft');
  generalSetUp();
  hideControls(obj);
  // Renderiza solo tres controles de los nueve
  obj.setControlVisible('tl', true);
  obj.setControlVisible('mt', true);
  obj.setControlVisible('ml', true);
  // Indica el tipo de icono a mostrar al pararse encima del control y la acción de los controles personalizados
  // @ts-ignore
  fabric.Canvas.prototype.customiseControls({
    tl: {
      cursor: 'nw-resize',
      action: 'scale',
    },
    ml: {
      action: 'rotate',
      cursor: 'grabbing',
    },
    mt: {
      action: action,
      cursor: 'pointer',
    },
  });
  // Asigna el icono a cada uno de los controles personalizados
  // @ts-ignore
  fabric.Object.prototype.customiseCornerIcons({
    tl: {
      icon: 'assets/fabric-icons/resize-inv.svg',
    },
    ml: {
      icon: 'assets/fabric-icons/rotate.svg',
    },
    mt: {
      icon: 'assets/fabric-icons/edit.svg',
    },
  });
};
/**
 * Función que permite crear los controles personalizados en la posición bottom-left
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controled Objeto que fue renderizado en el canvas
 */
export const controlsBottomLeft = (obj: any, action: any, controled: any) => {
  // console.log('controlsBottomLeft');
  generalSetUp();
  hideControls(obj);
  // Renderiza solo tres controles de los nueve
  obj.setControlVisible('ml', true);
  obj.setControlVisible('bl', true);
  obj.setControlVisible('mb', true);
  // Indica el tipo de icono a mostrar al pararse encima del control y la acción de los controles personalizados
  // @ts-ignore
  fabric.Canvas.prototype.customiseControls({
    bl: {
      action: 'scale',
      cursor: 'ne-resize',
    },
    ml: {
      action: 'rotate',
      cursor: 'grabbing',
    },
    mb: {
      action: action,
      cursor: 'pointer',
    },
  });
  // Asigna el icono a cada uno de los controles personalizados
  // @ts-ignore
  fabric.Object.prototype.customiseCornerIcons({
    bl: {
      icon: 'assets/fabric-icons/resize.svg',
    },
    ml: {
      icon: 'assets/fabric-icons/rotate.svg',
    },
    mb: {
      icon: 'assets/fabric-icons/edit.svg',
    },
  });
};
/**
 * Función que permite crear los controles personalizados en la posición bottom-right
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controled Objeto que fue renderizado en el canvas
 */
export const controlsBottomRight = (obj: any, action: any, controled: any) => {
  // console.log('controlsBottomRight');
  generalSetUp();
  hideControls(obj);
  // Renderiza solo tres controles de los nueve
  obj.setControlVisible('mb', true);
  obj.setControlVisible('br', true);
  obj.setControlVisible('mr', true);
  // Indica el tipo de icono a mostrar al pararse encima del control y la acción de los controles personalizados
  // @ts-ignore
  fabric.Canvas.prototype.customiseControls({
    br: {
      cursor: 'nw-resize',
      action: 'scale',
    },
    mr: {
      action: 'rotate',
      cursor: 'grabbing',
    },
    mb: {
      action: action,
      cursor: 'pointer',
    },
  });
  // Asigna el icono a cada uno de los controles personalizados
  // @ts-ignore
  fabric.Object.prototype.customiseCornerIcons({
    br: {
      icon: 'assets/fabric-icons/resize-inv.svg',
    },
    mr: {
      icon: 'assets/fabric-icons/rotate.svg',
    },
    mb: {
      icon: 'assets/fabric-icons/edit.svg',
    },
  });
};
/**
 * Función que renderiza los controles del objeto renderizado en la posición indicada
 * @param position Cadena con la posición de los controles del objeto renderizado
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controled Objeto que fue renderizado en el canvas
 */
export const setControlFromPosition = (position: any, obj: any, action: any, controled: any) => {
  // console.log('setControlFromPosition');
  // Se colocan los controles en la dirección opuesta al borde más cercano
  switch (position) {
    case 'TOP_LEFT':
      controlsBottomRight(obj, action, controled);
      break;
    case 'TOP_RIGHT':
      controlsBottomLeft(obj, action, controled);
      break;
    case 'BOTTOM_LEFT':
      controlsTopRight(obj, action, controled);
      break;
    case 'BOTTOM_RIGHT':
      controlsTopLeft(obj, action, controled);
      break;
    default:
      break;
  }
};
/**
 * Función que oculta los controles por defecto del objeto de control
 * @param obj Objeto que servirá como controlador del objeto renderizado en el canvas
 */
const hideControls = (obj: any) => {
  // console.log('hideControls');
  obj.setControlVisible('tl', false);
  obj.setControlVisible('mtr', false);
  obj.setControlVisible('mt', false);
  obj.setControlVisible('tr', false);
  obj.setControlVisible('ml', false);
  obj.setControlVisible('mr', false);
  obj.setControlVisible('bl', false);
  obj.setControlVisible('mb', false);
  obj.setControlVisible('br', false);
};
/**
 * Función que configura los controles personalizados en cada objeto del canvas
 */
const generalSetUp = () => {
  // console.log('generalSetup');
  // @ts-ignore
  fabric.Object.prototype.customiseCornerIcons({
    settings: {
      borderColor: '#999',
      cornerSize: CONTROL_OFFSET * 2,
      cornerShape: 'circle',
      cornerBackgroundColor: '#C3351A',
      cornerPadding: CONTROL_OFFSET,
    },
  });
};
