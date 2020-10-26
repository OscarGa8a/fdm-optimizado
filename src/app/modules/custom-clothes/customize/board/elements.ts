import { fabric } from 'fabric';
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
 * Función que crea un nuevo texto con los valores sin modificar en el texto
 * @param options Contiene la información sin modificar en el texto en el canvas
 * @param canvas Canvas de fabric donde se renderizará el texto con la nueva información
 * @returns Devuelve el objeto de tipo texto creado
 */
export const restoreTextElement = (options: any, canvas: fabric.Canvas, action: any) => {
  // console.log('restoreTextElement');
  // console.log("RESTORE FATHER");
  const box = restoreTextBox(options, canvas);
  createControl(options.idRelated, options.id, canvas, 10, action, box);
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
 * Función que crea el objeto de recorte en el canvas
 * @param box Contiene la información del objeto renderizado en el canvas
 * @param ctx Objeto que permite la creación del objeto de recorte en el canvas
 * @param canvas Canvas de fabric donde se renderizará el objeto
 */
function clipByName(box: any, ctx: any, canvas: any) {
  console.log('clipByName');
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
 * Función que crea un nuevo texto con la nueva información ingresada por el usuario
 * @param options Contiene la nueva información para el texto en el canvas
 * @param canvas Canvas de fabric donde se renderizará el texto con la nueva información
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
  console.log(newOptions);
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
