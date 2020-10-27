import { fabric } from 'fabric';
import { loadImageFromUrl } from './utils';
import { controlsBottomRight } from './controls';
import { CONTROL_OFFSET } from './constants';

/**
 * Función que crea un texto y su controlador
 * @param options Opcions por defecto para el texto
 * @param canvas Canvas donde se renderiza el objeto
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @returns Devuelve el texto creado
 */
export const createTextElement = (options: any, canvas: fabric.Canvas, action: any) => {
  // console.log('createTextElement');
  const id = new Date().toISOString();
  const idControl = `${id}-CONTROL`;
  const box = createTextBox(options, id, idControl, canvas);
  createControl(idControl, id, canvas, 10, action, box);
  return box;
};
/**
 * Función que crea una figura y su controlador
 * @param options Opcions por defecto para la figura
 * @param canvas Canvas donde se renderiza el objeto
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 */
export const createShape = (
  options: IShapeOptions,
  canvas: fabric.Canvas,
  action: any
) => {
  // console.log('createShape');
  const id = new Date().toISOString();
  const idControl = `${id}-CONTROL`;
  createShapeElement(options, id, idControl, canvas, action);
};
/**
 * Función que restaura los valores actuales en el texto del canvas
 * @param options Contiene la información sin modificar del texto en el canvas
 * @param canvas Canvas de fabric donde se renderizará el texto
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 */
export const restoreTextElement = (options: any, canvas: fabric.Canvas, action: any) => {
  // console.log('restoreTextElement');
  // console.log("RESTORE FATHER");
  const box = restoreTextBox(options, canvas);
  createControl(options.idRelated, options.id, canvas, 10, action, box);
};
/**
 * Función que restaura los valores actuales en la figura del canvas
 * @param options Contiene la información sin modificar de la figura en el canvas
 * @param canvas Canvas de fabric donde se renderizará la figura
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 */
export const restoreShape = (options: any, canvas: fabric.Canvas, action: any) => {
  // console.log('restoreShape');
  const box = restoreShapeElement(options, canvas);
  createControl(
    options.idRelated,
    options.id,
    canvas,
    box.padding,
    action,
    box
  );
};
/**
 * Función que crea el objeto de control al objeto renderizado en el canvas
 * @param id ID del objeto renderizado al que se va asociar el objeto de control
 * @param idRelated ID del objeto de control que se va a crear
 * @param canvas Canvas de fabric donde se renderiza los objetos
 * @param padding Espacio de relleno en los controles
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 * @param controlled Objeto que fue renderizado en el canvas
 */
const createControl = (
  id: any,
  idRelated: any,
  canvas: fabric.Canvas,
  padding = 0,
  action: any,
  controlled: any
) => {
  // console.log('createControl');
  // @ts-ignore
  const box = new fabric.Rect({
    originX: 'center',
    originY: 'center',
    centeredScaling: true,
    lockScalingFlip: true,
    strokeWidth: controlled.strokeWidth,
    stroke: 'transparent',
    padding,
    fill: 'transparent',
    width: controlled.width,
    height: controlled.height,
    scaleX: controlled.scaleX,
    scaleY: controlled.scaleY,
    left: controlled.left,
    top: controlled.top,
    clipTo: (ctx: any) => {
      return clipByName(box, ctx, canvas);
    },
  });
  box['id'] = id;
  box['initialAngle'] = 0;
  box['initialScale'] = controlled.scaleX;
  box['position'] = controlled.position;
  box['clipName'] = 'layer';
  box['idRelated'] = idRelated;
  box['isControl'] = true;
  canvas.add(box);
  controlsBottomRight(box, action, controlled);
  // canvas.setActiveObject(box);
};
/**
 * Función que crea una figura y lo agrega al canvas
 * @param param0 Opciones por defecto para la figura
 * @param id ID del objeto renderizado al que se va asociar el objeto de control
 * @param idRelated ID del objeto de control que se va a crear
 * @param canvas Canvas de fabric donde se renderiza los objetos
 * @param action Indica la acción que debe realizar el controlador en las opciones del editor
 */
const createShapeElement = (
  {
    type = 'polygon',
    sides = 5,
    radio = 40,
    fill = '#222222',
    stroke = '#222222',
    strokeWidth = 3,
    width = 40,
    angle = 0,
    scaleX = 1,
    scaleY = 1,
    padding = 0,
  }: IShapeOptions,
  id: any,
  idRelated: any,
  canvas: fabric.Canvas,
  action: any
) => {
  // console.log('createShapeElement');
  let box: any;
  // Obtiene los puntos para generar la figura
  const puntos = algoritmoPoly(sides, radio);
  switch (type) {
    case 'polygon':
      box = new fabric.Polygon(puntos, {
        originX: 'center',
        originY: 'center',
        centeredScaling: true,
        centeredRotation: true,
        rotatingPointOffset: 0,
        lockScalingFlip: true,
        fill,
        stroke,
        strokeWidth,
        strokeLineCap: 'round',
        objectCaching: false,
        padding,
        scaleX,
        scaleY,
        angle,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'circle':
      box = new fabric.Circle({
        radius: radio,
        originX: 'center',
        originY: 'center',
        borderColor: stroke,
        stroke,
        strokeWidth,
        fill,
        centeredRotation: true,
        centeredScaling: true,
        padding,
        scaleX,
        scaleY,
        angle,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'triangle':
      box = new fabric.Triangle({
        height: Math.sqrt(radio ** 2 - (radio / 2) ** 2),
        width: radio,
        originX: 'center',
        originY: 'center',
        centeredRotation: true,
        centeredScaling: true,
        objectCaching: false,
        fill,
        stroke,
        strokeWidth,
        padding,
        scaleX,
        scaleY,
        angle,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'line':
      box = new fabric.Line([0, 0, radio, 0], {
        originX: 'center',
        originY: 'center',
        centeredScaling: true,
        centeredRotation: true,
        rotatingPointOffset: 0,
        lockScalingFlip: true,
        fill,
        stroke,
        strokeWidth,
        strokeLineCap: 'round',
        objectCaching: false,
        padding: CONTROL_OFFSET * 2,
        scaleX,
        scaleY,
        angle,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    default:
      break;
  }

  box['id'] = id;
  box['initialAngle'] = 0;
  box['position'] = 'TOP_LEFT';
  box['clipName'] = 'layer';
  box['idRelated'] = idRelated;
  box['isControl'] = false;
  box['sides'] = sides;
  box['radio'] = radio;
  // Agrega el texto al canvas
  canvas.add(box);
  // Centra el texto en el canvas
  box.center();
  createControl(idRelated, id, canvas, box.padding, action, box);
};
/**
 * Función que crea una caja de texto y lo agrega al canvas
 * @param options Opcions por defecto para el texto
 * @param id ID del objeto renderizado al que se va asociar el objeto de control
 * @param idRelated ID del objeto de control que se va a crear
 * @param canvas Canvas de fabric donde se renderiza los objetos
 * @returns Devuelve el texto creado
 */
const createTextBox = (
  {
    type,
    text,
    diameter = 100,
    fontSize = 14,
    fontFamily = `'Arial'`,
    fill = '#000000',
    flipped = false,
    charSpacing,
    padding = 0,
    width = 40,
    angle = 0,
    scaleX = 1,
    scaleY = 1,
    shadow,
    textAlign = 'left',
  },
  id: any,
  idRelated: any,
  canvas: any
) => {
  // console.log('createTextBox');
  let box: any;
  // Crea texto o texto curveado
  if (type === 'text-curved') {
    // @ts-ignore
    box = new fabric.TextCurved({
      text,
      diameter,
      fontSize,
      fontFamily,
      fill,
      flipped,
      padding,
      originX: 'center',
      originY: 'center',
      strokeWidth: 0,
      centeredScaling: true,
      lockScalingFlip: true,
      charSpacing,
      width,
      angle,
      scaleX,
      scaleY,
      shadow,
      textAlign,
      clipTo: (ctx: any) => {
        return clipByName(box, ctx, canvas);
      },
    });
  } else {
    box = new fabric.Textbox(text, {
      fontSize,
      fontFamily,
      fill,
      padding,
      originX: 'center',
      originY: 'center',
      strokeWidth: 0,
      centeredScaling: true,
      lockScalingFlip: true,
      charSpacing,
      width,
      angle,
      scaleX,
      scaleY,
      shadow,
      textAlign,
      clipTo: (ctx: any) => {
        return clipByName(box, ctx, canvas);
      },
    });
  }
  box['diameter'] = diameter;
  box['flipped'] = flipped;
  box['id'] = id;
  box['idRelated'] = idRelated;
  box['clipName'] = 'layer';
  box['isControl'] = false;
  box['position'] = 'TOP_LEFT';
  box['pseudoCharSpacing'] = 0;
  // Agrega el texto al canvas
  canvas.add(box);
  // Centra el texto en el canvas
  box.center();
  canvas.renderAll();
  return box;
};
/**
 * Función que crea un nuevo texto con los valores sin modificar en el texto
 * @param options Contiene la información sin modificar en el texto en el canvas
 * @param canvas Canvas de fabric donde se renderizará el texto
 * @returns Devuelve el objeto de tipo texto creado
 */
const restoreTextBox = (options: any, canvas: any) => {
  // console.log('restoreTextBox');
  let box: any;
  const {
    clipTo,
    canvas: a,
    mouseMoveHandler,
    shadow,
    ...newOptions
  } = options;
  // console.log(shadow.blur);
  // console.log(shadow.color);
  // console.log(shadow.offsetX);
  // console.log(shadow.offsetY);
  if (options.type === 'text-curved') {
    // @ts-ignore
    // Crea un texto curveado
    box = new fabric.TextCurved({
      ...newOptions,
      shadow: {
        blur: 10,
        offsetX: 2,
        offsetY: 2,
        color: '#FF0000',
      },
      clipTo: (ctx: any) => {
        return clipByName(box, ctx, canvas);
      },
    });
  } else {
    // Crea un texto normal
    box = new fabric.Textbox(options.text, {
      ...newOptions,
      shadow: {
        blur: 10,
        offsetX: 2,
        offsetY: 2,
        color: '#FF0000',
      },
      clipTo: (ctx: any) => {
        return clipByName(box, ctx, canvas);
      },
    });
  }
  // console.log(box);
  canvas.add(box);
  // box.setShadow({
  // blur: shadow.blur,
  // offsetX: shadow.offsetX,
  // offsetY: shadow.offsetY,
  // color: shadow.color,
  // });
  canvas.renderAll();
  return box;
};
/**
 * Función que crea una nueva figura con los valores sin modificar en la figura
 * @param options Contiene la información sin modificar en la figura
 * @param canvas Canvas de fabric donde se renderizará la figura
 * @returns Devuelve el objeto de tipo figura creado
 */
const restoreShapeElement = (options: any, canvas: any) => {
  // console.log('restoreShapeElement');
  const {
    clipTo,
    canvas: a,
    mouseMoveHandler,
    points,
    padding,
    ...newOptions
  } = options;
  // @ts-ignore
  let box: any;
  switch (options.type) {
    case 'polygon':
      box = new fabric.Polygon(points, {
        ...newOptions,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'circle':
      box = new fabric.Circle({
        ...newOptions,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'triangle':
      box = new fabric.Triangle({
        ...newOptions,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    case 'line':
      const newPoints = [0, 0, options.radio || options.radius, 0];
      box = new fabric.Line(newPoints, {
        ...newOptions,
        padding: CONTROL_OFFSET * 2,
        strokeWidth: newOptions.strokeWidth === 0 ? 1 : newOptions.strokeWidth,
        clipTo: (ctx: any) => {
          return clipByName(box, ctx, canvas);
        },
      });
      break;
    default:
      break;
  }
  canvas.add(box);
  return box;
};
/**
 * Función que crea el objeto de recorte en el canvas
 * @param box Contiene la información del objeto renderizado en el canvas
 * @param ctx Objeto que permite la creación del objeto de recorte en el canvas
 * @param canvas Canvas de fabric donde se renderizará el objeto
 */
function clipByName(box: any, ctx: any, canvas: any) {
  // Algunas acciones requieren una llamada object.setCoords()para que se vuelvan a calcular las posiciones de control
  box.setCoords();
  // Obtiene el objeto de recorte
  const clipRect = findByClipName(box.clipName, canvas);
  // Obtiene escala X,Y para generar el objeto de recorte
  const scaleXTo1 = 1 / box.scaleX;
  const scaleYTo1 = 1 / box.scaleY;
  ctx.save();
  // La posición izquierda debe ser la mitad del elemento para que se oculte esa mitad
  const ctxLeft = -(box.width / 2);
  // La posición superior debe ser la mitad del elemento para que se oculte esa mitad
  const ctxTop = -(box.height / 2);
  // El ancho es el mismo del objeto de recorte
  const ctxWidth = clipRect.width;
  // El alto es el mismo del objeto de recorte
  const ctxHeight = clipRect.height;
  // Mueve, escala y rota el objeto que va a servir como recorte
  ctx.translate(ctxLeft, ctxTop);
  ctx.scale(scaleXTo1, scaleYTo1);
  ctx.rotate(degToRad(box.angle * -1));
  // Inicia el path
  ctx.beginPath();

  if (
    box.width * box.scaleX < CONTROL_OFFSET * 4 ||
    box.height * box.scaleX < CONTROL_OFFSET * 4 ||
    box.text
  ) {
    ctx.rect(
      clipRect.left -
        box.oCoords.tl.x -
        box.padding -
        (box.strokeWidth * box.scaleX) / 2,
      clipRect.top -
        box.oCoords.tl.y -
        box.padding -
        (box.strokeWidth * box.scaleY) / 2,
      ctxWidth,
      ctxHeight
    );
  } else {
    ctx.rect(
      clipRect.left - box.oCoords.tl.x - (box.strokeWidth * box.scaleX) / 2,
      clipRect.top - box.oCoords.tl.y - (box.strokeWidth * box.scaleY) / 2,
      ctxWidth,
      ctxHeight
    );
  }
  // Cierra el path
  ctx.closePath();
  ctx.restore();
}
/**
 * Función que busca el objeto de recorte en el canvas
 * @param name Cadena con el nombre del objeto que se quiere recortar
 * @param canvas Canvas de fabric donde se renderiza el elemento
 * @returns Devuelve el objeto de recorte
 */
function findByClipName(name: any, canvas: any) {
  // console.log('findByClipName');
  return canvas.getObjects().filter((el: any) => el.clipFor === name)[0];
}
/**
 * Función que convierte grados a radianes
 * @param degrees Valor de los grados a convertir
 * @returns Devuelve los grados en radianes
 */
function degToRad(degrees: any) {
  // console.log('degToRad');
  return degrees * (Math.PI / 180);
}
/**
 * Función que calcula los puntos X,Y que permiten generar un polígono
 * con el número de lados deseado
 * @param lados Determina el número de lados del polígono
 * @param R Determina la maginitud de cada lado del polígono
 * @returns Devuelve un array de puntos que representan los vértices del polígono
 */
export const algoritmoPoly = (lados: any, R: any): any[] => {
  // console.log('algoritmoPoly');
  const puntos = [];
  for (let a = 0; a < 2 * Math.PI; a += (2 * Math.PI) / lados) {
    const x = R + R * Math.cos(a - Math.PI / 2);
    const y = R + R * Math.sin(a - Math.PI / 2);
    puntos.push({ x, y });
  }
  // la función devuelve un array de puntos representando los vertices del polígono
  return puntos;
};
/**
 * Interfaz para manejar las opciones de figura del editor
 */
export interface IShapeOptions {
  type?: string;
  radio?: number;
  sides?: number;
  fill?: string | fabric.Pattern | fabric.Gradient;
  stroke?: string;
  strokeWidth?: number;
  width?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  padding?: number;
}
