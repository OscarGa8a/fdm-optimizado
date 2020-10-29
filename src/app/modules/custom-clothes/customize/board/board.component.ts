import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import { fabric } from 'fabric';
import FontFaceObserver from 'fontfaceobserver';
import runConfigurations from './configurations';

import { moving } from './move';
import { FileSaverService } from 'ngx-filesaver';

import {
  createTextElement,
  restoreTextElement,
  restoreShape,
  createShape,
  IShapeOptions,
  algoritmoPoly
} from './elements';

import { CONTROL_OFFSET } from './constants';
import { rotating, rotated } from './rotate';
import { scaling } from './scale';
import { loadImageFromUrl } from './utils';

import { HttpService } from '../../../../services/http.service';

import {
  TCanvas,
  TFabricObject,
  TTextSelectionEvent,
  TFabricCanvas,
  TUpdateCanvas,
  TControlAndObject,
} from '../types';
/**
 * Componente encagardo de renderizar los objetos en el canvas
 */
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, AfterViewInit, OnChanges {
  /**
   * Objeto con la información del canvas de fabric
   */
  public canvas: TFabricCanvas;
  /**
   * Objeto con la información del canvas oculto de fabric
   */
  public canvasHidden: TFabricCanvas;
  /**
   * Objeto que contendrá el elemento canvas del HTML
   */
  private canvasHTML: HTMLCanvasElement;
  /**
   * Objeto que contendrá el elemento canvas oculto del HTML
   */
  private canvasHTMLHidden: HTMLCanvasElement;
  /**
   * Emite el nombre de la opción escogida en el editor
   */
  @Output() openSelection = new EventEmitter<string>();
  /**
   * Indica si se debe cerrar las opción seleccionada en el editor
   * al dar click en el visor
   */
  @Output() closeFromBoard = new EventEmitter<boolean>();
  /**
   * Emite la información de la figura seleccionada
   */
  @Output() updateSelectionShapeEvent = new EventEmitter<TFabricObject>();
  /**
   * Emite la información del texto seleccionado
   */
  @Output() updateSelectionTextEvent = new EventEmitter<TTextSelectionEvent>();
  /**
   * Emite el índice de la vista actual en el visor
   */
  @Output() updateProductSideEvent = new EventEmitter<number>();
  /**
   * Emite la información de la vista actual en el canvas para ser renderizada
   * en la nueva vista que se desea mostrar
   */
  @Output() updateCanvasSidesEvent = new EventEmitter<TUpdateCanvas>();
  /**
   * Indica si se debe limpiar la información del texto seleccionado
   */
  @Output() textClearedEvent = new EventEmitter<any>();
  /**
   * Emite la url de la imagen de previsualización del canvas
   */
  @Output() previewImageEvent = new EventEmitter<string>();
  /**
   * Almacena la información de la vistas del producto y sus imágenes correspondientes
   */
  @Input() product: any;
  /**
   * Almacena el ID de la variante del producto
   */
  @Input() productVariant: any;
  /**
   * Almacena el índice de la vista actual del producto en el canvas
   */
  @Input() productSide: number;
  /**
   * Arreglo que almancena los borradores de los canvas con los objetos que fueron renderizados
   */
  @Input() canvasSides: TCanvas[];
  /**
   * Cadena con la url del logo de CATO
   */
  urlMarca = '/assets/images/icon/logo.png';
  /**
   * Arreglo de cadenas con la url del canvas de previsualizacion
   */
  canvasSidesPreview: string[] = [];
  /**
   * Valor del top del elemento que contiene el canvas
   */
  top: number;
  /**
   * Valor de los pixeles en el top del canvas de fabric con respecto a la imagen de fondo
   */
  topPixelesCanvas: number;
  /**
   * Valor de los pixeles en el left del canvas de fabric con respecto a la imagen de fondo
   */
  leftPixelesCanvas: number;
  /**
   * Valor del alto de la imagen de fondo del visor
   */
  heightImgBackground: number;
  /**
   * Valor del ancho de la imagen de fondo del visor
   */
  widthImgBackground: number;
  /**
   * Valor del left del elemento que contiene el canvas
   */
  left: number;
  /**
   * Valor de la altura real de la imagen de fondo del visor
   */
  height: number;
  /**
   * Valor del ancho real de la imagen de fondo del visor
   */
  width: number;
  /**
   * Valor del ancho de la imagen de fondo del visor
   */
  backgroundWidth: number;
  /**
   * Valor del offset de la imagen de fondo
   */
  imgOffset: number;
  /**
   * Valor del número de columnas para el gird en el visor
   */
  gridColumn: number;
  /**
   * Valor del número de filas para el grid en el visor
   */
  gridRow: number;
  /**
   * Arreglo con el total de columnas*filas para el grid en el visor
   */
  grid: number[];
  /**
   * Indica si se esta usando el grid en el visor del editor
   */
  guideLines = false;
  /**
   * Indica si hay un objeto seleccionado en el visor del editor
   */
  objectActive = false;
  /**
   * Indica si la escala del objeto es uniforme en todos los lados
   */
  uniScaleTransform = false;
  /**
   * Indica si se debe mostrar la imagen de previsualización
   */
  showPreviewImg = false;
  /**
   * Arreglo con la información de cada modificación en el visor
   */
  history: TCanvas[] = [];
  /**
   * Valor del indice de la modificación actual en el canvas del visor
   */
  historyIndex = 0;
  /**
   * Indica si no se ha cambiado el tamaño del elemento canvas
   */
  state = true;
  /**
   * Indica si el objeto en el canvas esta rotando
   */
  isRotating = false;
  /**
   * Determina el ángulo de rotación del objeto
   */
  rotationAngle = 0;
  /**
   * Valor del ancho inicial de la ventana de windows
   */
  windowWidth = window.innerWidth;
  /**
   * Indica si se debe desactivar el color
   */
  disableShowColor = true;
  /**
   * Decorador que obtiene la instancia del canvas en el HTML
   */
  @ViewChild('canvas', { static: true }) canvasRef: ElementRef;
  /**
   * Decorador que obtiene la instancia del canvas oculto en el HTML
   */
  @ViewChild('canvasHidden', { static: true }) canvasRefHidden: ElementRef;
  /**
   * Decorador que obtiene la instancia del contenedor del visor del editor
   */
  // @ViewChild('container', { static: true }) canvasContainer: ElementRef;
  /**
   * Decorador que obtiene la instancia de la imagen de fondo del visor
   */
  @ViewChild('imgBackground', { static: true }) imgBackground: ElementRef;
  /**
   * Valor de factor de tamaño entre el canvas que se muestra y el canvas oculto
   */
  factorCanvas: number;
  /**
   * Arreglo de string con las url de las imágenes optimizadas
   */
  urls: Array<string> = [
    'assets/cara/5.rostro.png',
    'assets/cara/6.Borde rostro.png',
    'assets/cara/4.pelo.png',
    'assets/cara/3.boca.png',
    'assets/cara/2.ojos.png'
  ];
  /**
   * Arreglo de string con las url de las imágenes optimizadas
   */
  urlsopt: Array<string> = [
    'assets/caraopt/5.rostro.png',
    'assets/caraopt/6.Borde rostro.png',
    'assets/caraopt/4.pelo.png',
    'assets/caraopt/3.boca.png',
    'assets/caraopt/2.ojos.png'
  ];
  /**
   * Arreglo de string con las url de las imágenes en CDN
   */
  urlsCDN: Array<string> = [
    'https://fueradelmolde.gumlet.net/error-image-cdn/prueba/camiseta-blanca-frente.png',
    'https://fueradelmolde.gumlet.net/error-image-cdn/prueba/astronauta.jpg',
    'https://fueradelmolde.gumlet.net/error-image-cdn/prueba/cicla.jpg',
    'https://fueradelmolde.gumlet.net/error-image-cdn/prueba/circulos.jpg',
    'https://fueradelmolde.gumlet.net/error-image-cdn/prueba/jake.jpg'
  ];
  /**
   * Arreglo que almacena los links de las imágenes en Amazon
   */
  dataImagesAmazon: Array<any> = [];
  /**
   * Arreglo que almacena los links de Amazon y de la CDN
   */
  dataLinks: Array<any> = [];
  /**
   * Arreglo que almacena las imágenes que han sido cargadas en el fabric
   */
  addedImages: any[] = [];
  /**
   * Contructor del componente
   * @param FileSaver Permite la descarga de archivos desde el navegador al dispotivo
   * @param http Servicio que permite la comunicación con servidores externos
   */
  constructor(private FileSaver: FileSaverService,
              private http: HttpService) { }
  /**
   * Función que calcula la posición del canvas en la página
   */
  ngOnInit(): void {
    // console.log('ngOnInit');
    this.top =
      (this.product[this.productSide].arriba /
        this.product[this.productSide].altoReal) ;
    this.left =
      this.product[this.productSide].izquierda /
      this.product[this.productSide].anchoReal; // necesitamos el valor de 0 a 1, para multiplicar con el ancho del contenedor
    // Obtiene las urls de las imágenes en Amazon
    this.http.getImagesAmazon().subscribe((images: any) => {
      this.dataImagesAmazon = images;
    });
    // Obtiene las urls de Amazon y de la CDN
    this.http.getLinks().subscribe((links: any) => {
      this.dataLinks = links;
    });
  }
  /**
   * Función que detecta el cambio en el producto para calcular la posición del canvas
   * @param changes Contiene las propiedades cambiadas en el componente
   */
  ngOnChanges(changes: SimpleChanges): void {
    // console.log('ngOnChanges');
    if ('product' in changes) {
      this.top =
        (this.product[this.productSide].arriba /
          this.product[this.productSide].altoReal);
      this.left =
        this.product[this.productSide].izquierda /
        this.product[this.productSide].anchoReal;
    }
  }
  /**
   * Función que quita la selección del objeto seleccionado actualmente
   * @param $event Objeto con la información del evento ocurrido
   */
  deselect($event: any): void {
    // console.log('deselect');
    if ($event.target.className === 'upper-canvas ') { return null; }
    this.objectActive = false;
    this.closeFromBoard.emit(true);
    this.disableShowColor = true;
    this.textClearedEvent.emit(true);
    this.canvas.discardActiveObject();
    const rect = this.canvas._objects.filter(({ isBorderAux }) => isBorderAux)[0];
    rect.set({
      stroke: 'transparent',
    });
    this.canvas.renderAll();
  }
  /**
   * Decorador que declara evento cuando se cambia el tamaño de la ventana del navegador
   * para cambiar el tamaño del canvas
   */
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    // console.log('onResize');
    if (this.windowWidth === window.innerWidth) {
      this.windowWidth = window.innerWidth;
      return null;
    }
    // this.changeProductSide(this.productSide);
    this.resizeCanvas();
    this.windowWidth = window.innerWidth;
  }
  /**
   * Función que crea un evento cuando se termina de cargar la imagen de fondo del
   * editor para que calcula el tamaño del canvas
   */
  ngAfterViewInit(): void {
    // console.log('ngAfterViewInit');
    // Cambia el tamaño del canvas cuando se termina de cargar la imagen
    this.imgBackground.nativeElement.onload = () => {
      this.resizeCanvas();
    };
    // tslint:disable-next-line: no-non-null-assertion
    this.canvasHTML = this.canvasRef!.nativeElement;
    // tslint:disable-next-line: no-non-null-assertion
    this.canvasHTMLHidden = this.canvasRefHidden!.nativeElement;
  }
  /**
   * Función que asigna las propiedades a un nuevo canvas y establece los eventos correspondientes
   */
  loadCanvas = async () => {
    // console.log('loadCanvas');
    this.heightImgBackground = this.imgBackground.nativeElement.height;
    this.topPixelesCanvas = this.top * this.heightImgBackground;
    this.widthImgBackground = this.imgBackground.nativeElement.width;
    this.leftPixelesCanvas = this.left * this.widthImgBackground;

    const style = window.getComputedStyle(this.imgBackground.nativeElement);
    const marginLeft = parseInt(style.marginLeft, 10);
    this.imgOffset = marginLeft;
    // Obtiene el alto del canvas de fabric
    this.height =
      (this.product[this.productSide].altoAreaReal /
        this.product[this.productSide].altoReal) *
      this.heightImgBackground;
    // Obtiene el ancho del canvas de fabric
    this.width =
      (this.product[this.productSide].anchoAreaReal /
        this.product[this.productSide].anchoReal) *
      this.widthImgBackground;
    // Calcula el número de columnas para el grid
    this.gridColumn = Math.floor(this.width / 15 / 2);
    // Calcula el número de filas para el grid
    this.gridRow = Math.floor(this.height / 15 / 2);
    // Crea un arreglo del tamaño de columnas * filas y lo llena de ceros
    this.grid = Array(this.gridColumn * this.gridRow).fill(0);
    // Crea el canvas de fabric y lo configura para que mantenga la posicion de los objetos
    // renderizados al ser seleccionado alguno de esos objetos en el canvas
    this.canvas = new fabric.Canvas('canvas', {
      preserveObjectStacking: true,
      controlsAboveOverlay: true
    }) as TFabricCanvas;
    this.canvasHidden = new fabric.Canvas('canvasHidden', {
      preserveObjectStacking: true,
      controlsAboveOverlay: true
    }) as TFabricCanvas;
    // Asigna alto y ancho al canvas de fabric
    this.canvas.setHeight(this.height);
    // this.canvas.setHeight(100);
    this.canvas.setWidth(this.width);
    // this.canvas.setWidth(120);

    this.createBorder(this.canvas);

    // Se activa cuando se modifica un objeto en el canvas de fabric
    this.canvas.on('object:modified', (e: fabric.IEvent) => {
      // console.log('modified');
      this.changeHistory();
      // this.changeProductSide(this.productSide);
      this.generatePreviews();
    });
    // Se activa cuando se agrega un objeto al canvas de fabric
    this.canvas.on('object:added', (e: fabric.IEvent) => {
      // console.log('addedCanvas');
      // this.changeProductSide(this.productSide);
      this.generatePreviews();
    });
    // Se activa cuando se elimina un objeto en el canvas de fabric
    this.canvas.on('object:removed', (e: fabric.IEvent) => {
      // console.log('removed');
      // this.changeProductSide(this.productSide);
      this.generatePreviews();
    });
    // Se activa mientras se esta rotando un objeto en el canvas de fabric
    this.canvas.on('object:rotating', (e: fabric.IEvent) => {
      // console.log('rotating');
      if (!this.isRotating) {
        this.isRotating = true;
      }
      const { controlled } = this.getControlAndObject();
      let initial = controlled.angle;
      const aux = Math.trunc(initial / 360);
      if (aux !== 0) {
        initial = Math.trunc(initial / aux) - 360;
      }
      if (initial >= 180 && initial <= 360) {
        this.rotationAngle = Math.trunc(360 - initial);
      } else {
        this.rotationAngle = Math.trunc(initial);
      }
      rotating(e, this.canvas);
    });
    // Se activa mientras se esta moviendo un objeto en el canvas de fabric
    this.canvas.on('object:moving', (e: fabric.IEvent): void => {
      // console.log('moving');
      moving(e, this.canvas, this.variableControlAction);
    });
    // Se activa cuando se termina de mover un objeto en el canvas de fabric
    this.canvas.on('object:moved', (e: fabric.IEvent): void => {
      // console.log('moved');
      this.calculateMaxWidthOfTextbox();
    });
    // Se activa mientras se esta escalando un objeto en el canvas de fabric
    this.canvas.on('object:scaling', (e: fabric.IEvent): void => {
      // console.log('scaling');
      scaling(e, this.canvas);
    });
    // Se activa cuando se termina de escalar un objeto en el canvas de fabric
    this.canvas.on('object:scaled', (e: fabric.IEvent): void => {
      // console.log('scaled');
      this.calculateMaxWidthOfTextbox();
    });
    // Se activa cuando se termina de rotar un objeto en el canvas de fabric
    this.canvas.on('object:rotated', (e: fabric.IEvent): void => {
      // console.log('rotated');
      this.isRotating = false;
      rotated(e, this.canvas);
      this.calculateMaxWidthOfTextbox();
    });
    // Se activa cuando se selecciona un objeto en el canvas de fabric
    this.canvas.on('selection:created', (e: fabric.IEvent): void => {
      // console.log('created');
      this.selectionCreatedAndUpdated(e);
    });
    // Se activa cuando teniendo selecciona un objeto en el canvas de fabric se selecciona otro objeto en el canvas
    this.canvas.on('selection:updated', (e: fabric.IEvent): void => {
      // console.log('updated');
      this.selectionCreatedAndUpdated(e);
      if (this.windowWidth < 960) {
        this.closeFromBoard.emit(true);
      }
    });
    // Se activa cuando se deselecciona un objeto en el canvas de fabric sin seleccionar otro objeto
    this.canvas.on('selection:cleared', (e: fabric.IEvent) => {
      // console.log('clearedCanvas');
      this.objectActive = false;
      this.closeFromBoard.emit(true);
      this.disableShowColor = true;
      this.textClearedEvent.emit(true);
      const rect = this.canvas._objects.filter(
        ({ isBorderAux }) => isBorderAux
      )[0];
      rect.set({
        stroke: 'transparent',
      });
      this.canvas.renderAll();
    });

    runConfigurations();
  }
  /**
   * Función que reestablece todos los valores y objetos en el canvas
   */
  resizeCanvas = async () => {
    // console.log('resizeCanvas');
    const c = document.querySelector('.canvas-container');
    const cAux = document.querySelector('.canvas-aux');
    // let json: any = dataJson;
    this.history = [];
    this.historyIndex = 0;
    this.state = false;
    if (c) {
      const canvasElement = document.createElement('canvas');
      canvasElement.setAttribute('id', 'canvas');
      cAux.appendChild(canvasElement);
      c.parentNode.removeChild(c);
      // json = this.canvas.toJSON();
      // json.altoAreaPixeles = this.height;
      // json.anchoAreaPixeles = this.width;
    }
    this.canvas = null;
    this.loadCanvas();

    this.readFromJSON(this.canvas, this.canvasSides[this.productSide]);

    this.history = [];
    this.historyIndex = 0;

    // await createMultiDesign(
    //   this.designs[0].images,
    //   {},
    //   this.canvas,
    //   this.variableControlAction,
    //   1
    // );

    // createShape(
    //   { type: 'line', radio: 60, strokeWidth: 1 },
    //   this.canvas,
    //   this.variableControlAction
    // );
    // createShape(
    //   { type: 'polygon', sides: 6, radio: 60, fill: '#222FFF' },
    //   this.canvas,
    //   this.variableControlAction
    // );
    // createShape(
    //   { type: 'circle', radio: 60, strokeWidth: 25, stroke: '#660000' },
    //   this.canvas,
    //   this.variableControlAction
    // );

    this.changeHistory();

    this.generatePreviews();
  }
  /**
   * Función que maneja el deslizamiento del táctil en móvil para cambiar
   * la vista del producto en el editor
   */
  onSwipe = (evt: any): void => {
    console.log('onSwipe');
    const x =
      Math.abs(evt.deltaX) > 40 ? (evt.deltaX > 0 ? 'right' : 'left') : '';
    const y = Math.abs(evt.deltaY) > 40 ? (evt.deltaY > 0 ? 'down' : 'up') : '';
    if (this.windowWidth < 960) {
      switch (x) {
        case 'left':
          if (this.productSide === 0) { return null; }
          this.updateProductSideEvent.emit(this.productSide - 1);
          break;
        case 'right':
          if (this.productSide === this.product.length - 1) { return null; }
          this.updateProductSideEvent.emit(this.productSide + 1);
          break;
        default:
          break;
      }
    }
  }
  /**
   * Función que crea el objeto de recorte y el objeto de bordes punteados y los agrega al canvas de fabric
   * @param canvas Objeto con la información del canvas de fabric
   */
  createBorder = (canvas: TFabricCanvas): void => {
    // console.log('createBorder');
    // Se crea el objeto del borde el cual permitirá recortar los objetos en el canvas
    const clipRectangle = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      left: CONTROL_OFFSET,
      top: CONTROL_OFFSET,
      width: this.canvas.getWidth() - CONTROL_OFFSET * 2,
      height: this.canvas.getHeight() - CONTROL_OFFSET * 2,
      fill: 'transparent',
      strokeWidth: 0,
      stroke: 'black',
      selectable: false,
      hoverCursor: 'pointer',
    });
    // Damos a estos objetos `Rect` una propiedad de nombre para que las funciones` clipTo` encuentra el que quiere recortar
    clipRectangle['clipFor'] = 'layer';
    canvas.add(clipRectangle);
    // Se crea el objeto que permite mostrar los bordes punteados en el canvas
    const border = new fabric.Rect({
      originX: 'left',
      originY: 'top',
      left: CONTROL_OFFSET - 1,
      top: CONTROL_OFFSET - 1,
      width: this.canvas.getWidth() - CONTROL_OFFSET * 2 + 1,
      height: this.canvas.getHeight() - CONTROL_OFFSET * 2 + 1,
      fill: 'transparent',
      stroke: 'transparent',
      strokeDashArray: [3, 3],
      selectable: false,
      hoverCursor: 'default',
    });
    border['isBorderAux'] = true;
    canvas.add(border);
  }
  /**
   * Función que cambia la vista actual en el visor del canvas y actualiza el index de la vista
   * @param index Indice de la vista actual en el editor
   */
  changeProductSide = (index: number): void => {
    // console.log('changeProductSide');
    this.changeCanvasSides(this.generateJSON());
    this.updateProductSideEvent.emit(index);
  }
  /**
   * Función que actualiza la información de la vista actual y la almacena en local storage
   * @param json Canvas con la información actual del visor del editor
   */
  changeCanvasSides = (json: TCanvas): void => {
    // console.log('changeCanvasSides');
    this.updateCanvasSidesEvent.emit({
      index: this.productSide,
      canvas: json,
      widthArea: this.width,
      heightArea: this.height,
    });
    const store = {
      productVariant: this.productVariant,
      sides: this.canvasSides,
    };
    const storeString = JSON.stringify(store);
    // Almacena en local storage la información de la nueva vista del editor
    localStorage.setItem('DRAFT_FDM', storeString);
  }
  /**
   * Función que permite ocultar o mostrar la imagen de previsualización
   */
  togglePreview = (): void => {
    // console.log('togglePreview');
    this.showPreviewImg = !this.showPreviewImg;
  }
  /**
   * Función que descarga una fuente y la carga al texto de fabric
   * @param font Contiene la fuente para el texto
   * @param obj Objeto tipo texto al que se cargará la fuente
   */
  loadAndUse = async (font: any, obj: any) => {
    // console.log('loadAndUse');
    const myfont = new FontFaceObserver(font.replace("'", ""));
    try {
      await myfont.load().then(() => {
        obj.set('fontFamily', font.replace("'", ""));
        this.canvas.renderAll();
      });
    } catch (error) {}
  }
  /**
   * Función que permite actualizar los datos de texto ingresados por el usuario
   * @param $event Contiene la información de los cambios realizados en el texto
   */
  changeCurveTextProperties = async ($event: any) => {
    // console.log('changeCurveTextProperties');
    const selectedAndControlled = this.getControlAndObject();
    // Obtiene el objeto controlado y su controlador
    if (!selectedAndControlled) { return null; }
    let { selected, controlled } = selectedAndControlled;
    // Si el objeto controladado es un texto curveado
    if (controlled.type === 'text-curved') {
      // controlled.pseudoCharSpacing;
      // Si el texto modificado es un texto normal
      if ($event.type === 'textbox') {
        // console.log("1");
        // Curveado cambio a caja
        restoreTextElement(
          {
            ...controlled,
            charSpacing: controlled.pseudoCharSpacing * 90,
            type: 'textbox',
          },
          this.canvas,
          this.variableControlAction
        );
        // Elimina el controlado y su controlador para agregar un texto que ya no es curveado
        this.canvas.remove(controlled);
        this.canvas.remove(selected);
        // Obtiene el último objeto controlador agregado
        selected = this.canvas._objects[this.canvas._objects.length - 1];
        // Obtiene el objeto controlado
        controlled = this.canvas._objects.filter(
          (obj) => obj.id === selected.id
        )[0];
        // Activa el objeto controlado para que aparezcan los botones del controlador
        this.canvas.setActiveObject(controlled);
        return null;
      }
      if ($event.text) {
        if ($event.fontFamily) {
          await this.loadAndUse($event.fontFamily, controlled);
        }
        // Texto curveado sin cambiar a caja, cambiando texto
        const diameter = controlled.diameter * 1.0000001;
        controlled.set({
          ...$event,
          diameter,
        });
        // Obtiene los límites del objeto
        const box = controlled.getBoundingRect();
        selected.set({
          left: box.left,
          top: box.top,
          height: box.height,
          width: box.width,
        });
      } else {
        if ($event.fontFamily) {
          await this.loadAndUse($event.fontFamily, controlled);
        }
        // Texto curveado sin cambiar a caja, ni cambiar texto
        controlled.set({
          ...$event,
          charSpacing: $event.pseudoCharSpacing || controlled.charSpacing,
        });
        // Obtenga las coordenadas y medidas del objeto controlado
        const box = controlled.getBoundingRect();
        // Asigna las propiedades del objeto controlado al controlador
        // para que el controlador tome la posición y tamaño del texto
        selected.set({
          left: box.left + box.width / 2,
          top: box.top + box.height / 2,
          height: box.height,
          width: box.width,
        });
      }
    } else {
      if ($event.type === 'text-curved') {
        // console.log("2");
        /// Texto cambiar a texto curveado
        const charSpacing = Math.floor(controlled.charSpacing / 90);
        restoreTextElement(
          {
            ...controlled,
            charSpacing,
            type: 'text-curved',
          },
          this.canvas,
          this.variableControlAction
        );
        this.canvas.remove(controlled);
        this.canvas.remove(selected);
        selected = this.canvas._objects[this.canvas._objects.length - 1];
        controlled = this.canvas._objects.filter(
          (obj) => obj.id === selected.id
        )[0];
        this.canvas.setActiveObject(controlled);
      } else {
        // Si el objeto controlado es un texto normal y el evento tiene un texto normal
        // Asigne al objeto controlado las propiedades del texto en el evento
        controlled.set({
          ...$event,
          charSpacing: controlled.pseudoCharSpacing * 90,
        });
        // Obtenga las coordenadas y medidas del objeto controlado
        const box = controlled.getBoundingRect();
        // Asigna las propiedades del objeto controlado al controlador
        // para que el controlador tome la posición y tamaño del texto
        selected.set({
          left: box.left + box.width / 2,
          top: box.top + box.height / 2,
          height: box.height,
          width: box.width,
          scaleX: 1,
          scaleY: 1,
        });
      }
    }
    this.canvas.renderAll();
    // this.changeProductSide(this.productSide);
  }
  /**
   * Función que crea un texto y su control y los renderiza en el canvas
   * @param options Contiene las opciones por defecto para el texto de fabric
   */
  createText = (options: any): void => {
    // console.log('createText');
    createTextElement(options, this.canvas, this.variableControlAction);
    this.setSelectionToCreatedElement();
    // this.changeProductSide(this.productSide);
    this.changeHistory();
  }
  /**
   * Función que crea una figura y su control y los renderiza en el canvas
   * @param options Contiene las opciones por defecto para la figura de fabric
   */
  createShape = (options: IShapeOptions): void => {
    // console.log('createShape');
    createShape(options, this.canvas, this.variableControlAction);
    this.setSelectionToCreatedElement();
    // this.changeProductSide(this.productSide);
    this.changeHistory();
  }
  /**
   * Función que obtiene el controlador seleccionado para activar la selección
   * el objeto relacionado con el controlador
   */
  setSelectionToCreatedElement = (): void => {
    // console.log('setSelectionToCreatedElement');
    const controlled = this.canvas._objects[this.canvas._objects.length - 1];
    const selected = this.canvas._objects.filter(
      (obj) => obj.id === controlled.idRelated
    )[0];
    this.canvas.setActiveObject(selected);
  }
  /**
   * Función que detecta el evento ocurrido y emite la información al padre
   * @param e Objeto con la información del evento ocurrido
   */
  selectionCreatedAndUpdated = (e: fabric.IEvent) => {
    // console.log('selectionCreatedAndUpdated');
    // Si el tipo es de selección activada, desactive la selección
    if (e.target.type === 'activeSelection') {
      this.canvas.discardActiveObject();
    } else {
      // Si no active la selección de un objeto del editor
      this.objectActive = true;
      // Obtiene el objeto de borde y activa los bordes punteados
      const rect = this.canvas._objects.filter((obj) => obj.isBorderAux)[0];
      rect.set({
        stroke: 'black',
      });
      // Si no se selecciono un control
      if (!e.target['isControl']) {
        // Obtiene el objeto controlado
        const controlled2 = this.canvas.getActiveObject() as TFabricObject;
        // Busca el control con el mismo id del objeto controlado
        const selected2 = this.canvas._objects.filter(
          (obj) => obj.id === controlled2.idRelated
        )[0];
        // Activa el control
        this.canvas.setActiveObject(selected2);
      }
      // Obtiene el control y objeto controlado
      const { selected, controlled } = this.getControlAndObject();
      selected.set({
        dirty: true,
      });

      if (controlled.type === 'text-curved' || controlled.type === 'textbox') {
        this.disableShowColor = true;
        if (window.innerWidth < 960) { return null; }
        // Emite la opción escogida en el editor
        this.openSelection.emit('text');
        const res = this.calculateMaxWidthOfTextbox();
        if (!res) {
          // Emite el texto seleccionado
          this.updateSelectionTextEvent.emit({ element: controlled });
        }
      } else if (controlled.type === 'group') {
        this.disableShowColor = false;
        if (window.innerWidth < 960) { return null; }
        this.openSelection.emit('color');
        // this.updateSelectionMultiDesignEvent.emit(controlled);
      } else if (
        controlled.type === 'polygon' ||
        controlled.type === 'circle' ||
        controlled.type === 'triangle' ||
        controlled.type === 'line'
      ) {
        this.disableShowColor = true;
        if (window.innerWidth < 960) { return null; }
        this.updateSelectionShapeEvent.emit(controlled);
        this.openSelection.emit('shape');
      }
      this.canvas.requestRenderAll();
    }
  }
  /**
   * Función que calcula el ancho máximo del texto en el canvas
   * y emite el texto y el ancho
   * @returns Devuelve true si se tiene un máximo mayor a cero
   */
  calculateMaxWidthOfTextbox = (): boolean => {
    // console.log('calculateMaxWidthOfTextBox');
    const { controlled } = this.getControlAndObject();
    // Devuelve las coordenadas del rectángulo delimitador del objeto
    // (izquierda, arriba, ancho, alto). El cuadro está alineado con el eje del lienzo
    const bounding = controlled.getBoundingRect(true, true);
    const fromLeft = bounding.left - CONTROL_OFFSET;
    const fromRight =
      this.canvas.getWidth() - bounding.left - bounding.width - CONTROL_OFFSET;
    // Obtiene distancia desde la izquierda y desde la derecha en píxeles
    const max = fromLeft < fromRight ? fromLeft : fromRight;
    // Obtiene el ancho de texto
    const width = bounding.width;
    // Calcula el ancho máximo del texto
    const maxWidth = (max * 2 + width) / controlled.scaleX;

    if (max > 0) {
      this.updateSelectionTextEvent.emit({
        element: controlled,
        maxWidth,
      });
      return true;
    } else {
      return false;
    }
  }
  /**
   * Función que emite la opción escogida en el editor y emite el controlador
   * del objeto seleccionado actualmente
   */
  variableControlAction = (): void => {
    // console.log('variableControlAction');
    const { controlled } = this.getControlAndObject();
    if (controlled.text) {
      this.openSelection.emit('text');
      this.updateSelectionTextEvent.emit({ element: controlled });
    }
    if (controlled.type === 'group') {
      this.openSelection.emit('color');
      // this.updateSelectionMultiDesignEvent.emit(controlled);
    }
    if (
      controlled.type === 'polygon' ||
      controlled.type === 'circle' ||
      controlled.type === 'triangle' ||
      controlled.type === 'line'
    ) {
      this.openSelection.emit('shape');
      this.updateSelectionShapeEvent.emit(controlled);
    }
  }
  /**
   * Función que limpia la selección del objeto en el visor
   */
  clearSelection = (): void => {
    // console.log('clearSelection');
    if (this.canvas.getActiveObject()) {
      this.canvas.discardActiveObject();
      this.canvas.renderAll();
    }
  }
  /**
   * Función que obtiene una cadena con la información del canvas para la previsualización
   * @param canvas Canvas del editor con la información para la previsualización
   * @returns Devuelve la url con la previsualización del canvas
   */
  generateDesign = (canvas: TFabricCanvas): string => {
    // console.log('generateDesign');
    // Filtra los objetos en el canvas con la propiedad isBorderAux
    // para obtener el objecto que sirve de borde del canvas
    const border = canvas._objects.filter(({ isBorderAux }) => isBorderAux)[0];
    // Quita el borde al canvas
    if (border) {
      border.set({
        strokeWidth: 0,
      });
    }
    // Obtiene url con información del canvas
    const urlDesign = canvas.toDataURL({
      format: 'png',
      quality: 1,
    });
    // Agrega el borde al canvas
    if (border) {
      border.set({
        strokeWidth: 1,
      });
    }
    canvas.renderAll();
    return urlDesign;
  }
  /**
   * Función que genera las previsualizaciones para mostrar en las vistas laterales
   */
  generatePreviews = (): void => {
    // console.log('generatePreviews');
    this.canvasSides.forEach((side, index) => {
      const canvas = new fabric.Canvas('c6') as TFabricCanvas;
      this.createBorder(canvas);
      canvas.setWidth(side.widthArea);
      canvas.setHeight(side.heightArea);
      this.readFromJSON(canvas, side);
      canvas.renderAll();
      this.generatePreview(canvas, index);
    });
  }
  /**
   * Función que genera una previsualización del canvas del editor
   * @param canvas Canvas del editor con la información para la previsualización
   * @param index Indice del canvas de previsualización
   */
  generatePreview = async (canvas: TFabricCanvas, index: number) => {
    // console.log('generatePreview');
    const canvasAux = new fabric.Canvas('c4');
    const productImg = document.querySelector('.img-container img');
    canvasAux.setWidth(productImg.clientWidth);
    canvasAux.setHeight(productImg.clientHeight);
    // Obtiene la url con la información del canvas
    const urlDesign = this.generateDesign(canvas);
    const background = await loadImageFromUrl(this.product[index].url);
    // Calcula el factor de escala ancho entre el canvas y la imagen de fondo
    const scaleFactor = canvasAux.getWidth() / background.width;
    // Asigna imagen de fondo y escalas al canvas
    canvasAux.setBackgroundImage(background, () => {}, {
      scaleX: scaleFactor,
      scaleY: scaleFactor,
    });
    // Obtiene imagen del diseño en el canvas
    const design = await loadImageFromUrl(urlDesign);
    // Asigna posicion X Y al diseño
    design.set({
      top: (productImg.clientHeight * this.top),
      left: productImg.clientWidth * this.left,
    });
    // Obtiene el logo de CATO
    const waterMark = await loadImageFromUrl(this.urlMarca);
    // Aisgna posiciones y escalas al logo de CATO
    waterMark.set({
      top: canvasAux.getHeight() - waterMark.height * 0.3 - 20,
      left: canvasAux.getWidth() - waterMark.width * 0.3 - 20,
      scaleX: 0.3,
      scaleY: 0.3,
    });

    canvasAux.add(design);
    canvasAux.setOverlayImage(waterMark, null);
    canvasAux.renderAll();
    // Obtiene la url del canvas de previsualización
    const urlPreview = canvasAux.toDataURL({
      format: 'png',
      quality: 1,
    });
    this.canvasSidesPreview[index] = urlPreview;
    if (index === 0) {
      // Emite la url de previsualización para ser usada por el componente padre
      this.previewImageEvent.emit(urlPreview);
    }
  }
  /**
   * Función que sube el nivel del objeto seleccionado y su controlador
   * en la pila de objetos en el canvas
   */
  moveToUp = (): void => {
    // console.log('moveToUp');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      // Obtiene el nivel en la pila de objetos del controlador
      const currentIndexSelected = this.canvas.getObjects().indexOf(selected);
      // Obtiene el nivel en la pila de objetos del objeto controlado
      const currentIndexControlled = this.canvas.getObjects().indexOf(controlled);

      if (currentIndexControlled <= this.canvas._objects.length - 4) {
        selected.moveTo(currentIndexSelected + 2);
        controlled.moveTo(currentIndexControlled + 2);
      }
    }
  }
  /**
   * Función que baja el nivel del objeto seleccionado y su controlador
   * en la pila de objetos en el canvas
   */
  moveToDown = (): void => {
    // console.log('moveToDowm');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      // Obtiene el nivel en la pila de objetos del controlador
      const currentIndexSelected = this.canvas.getObjects().indexOf(selected);
      // Obtiene el nivel en la pila de objetos del objeto controlado
      const currentIndexControlled = this.canvas.getObjects().indexOf(controlled);
      // Mayor o igual a 4 por que esto garantiza que hay un elemento abajo de ellos, [0,1] de conf, [2,3] Primer elemento
      if (currentIndexControlled >= 4) {
        controlled.moveTo(currentIndexControlled - 2);
        selected.moveTo(currentIndexSelected - 2);
      }
    }
  }
  /**
   * Función que centra totalmente el objeto en el canvas
   */
  centerObject = (): void => {
    // console.log('centerObject');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      selected.center();
      controlled.center();
      this.canvas.renderAll();
    }
  }
  /**
   * Función que mueve el objeto a la izquierda del canvas
   */
  alignToLeft = (): void => {
    // console.log('alignToLeft');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        left: (selected.width * selected.scaleX) / 2 + CONTROL_OFFSET,
      });
      selected.set({
        left: (selected.width * selected.scaleX) / 2 + CONTROL_OFFSET,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que centra verticalmente el objeto en el canvas
   */
  alignToVerticalCenter = (): void => {
    // console.log('alignToVerticalCenter');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        top: this.canvas.getHeight() / 2,
      });
      selected.set({
        top: this.canvas.getHeight() / 2,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que mueve el objeto a la derecha del canvas
   */
  alignToRight = (): void => {
    // console.log('alignToRight');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        left:
          this.width - (selected.width * selected.scaleX) / 2 - CONTROL_OFFSET,
      });
      selected.set({
        left:
          this.width - (selected.width * selected.scaleX) / 2 - CONTROL_OFFSET,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que mueve el objeto a la parte superior del canvas
   */
  alignToTop = (): void => {
    // console.log('alignToTop');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        top: (selected.height * selected.scaleX) / 2 + CONTROL_OFFSET,
      });
      selected.set({
        top: (selected.height * selected.scaleX) / 2 + CONTROL_OFFSET,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que centra horizontalmente el objeto en el canvas
   */
  alignToHorizontalCenter = (): void => {
    // console.log('alignToHorizontalCenter');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        left: this.canvas.getWidth() / 2,
      });
      selected.set({
        left: this.canvas.getWidth() / 2,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que mueve el objeto a la parte inferior del canvas
   */
  alignToBottom = (): void => {
    // console.log('alignToBottom');
    if (this.canvas.getActiveObject()) {
      const { selected, controlled } = this.getControlAndObject();
      controlled.set({
        top:
          this.canvas.getHeight() -
          (selected.height * selected.scaleX) / 2 -
          CONTROL_OFFSET,
      });
      selected.set({
        top:
          this.canvas.getHeight() -
          (selected.height * selected.scaleX) / 2 -
          CONTROL_OFFSET,
      });
      // moving(null, this.canvas, this.variableControlAction);
      this.canvas.renderAll();
    }
  }
  /**
   * Función que deshace la última modificación realizada en el visor del editor
   */
  undo = (): void => {
    // console.log('undo');
    // Si no hay modificaciones anteriores retorne
    if (this.historyIndex === 0) { return; }
    // Resta uno al índice de modificaciones
    this.historyIndex = this.historyIndex - 1;
    this.resetCanvas();
    // Carga al canvas la penúltima modificación realizada
    this.readFromJSON(this.canvas, this.history[this.historyIndex]);
  }
  /**
   * Función que rehace la última modificación realizada en el visor del editor
   */
  redo = (): void => {
    // console.log('redo');
    // Si no hay modificaciones nuevas
    if (this.historyIndex === this.history.length - 1) {
      return;
    }
    // Aumente uno al índice de modificaciones
    this.historyIndex = this.historyIndex + 1;
    this.resetCanvas();
    // Carga al canvas la última modificación realizada
    this.readFromJSON(this.canvas, this.history[this.historyIndex]);
  }
  /**
   * Función que elimina el objeto controlado seleccionado y su controlador
   */
  deleteElement = (): void => {
    // console.log('deleteElement');
    const { selected, controlled } = this.getControlAndObject();
    this.canvas.remove(selected);
    this.canvas.remove(controlled);
  }
  /**
   * Función que permite duplicar un elemento renderizado en el canvas
   */
  duplicateElement = (): void => {
    // console.log('duplicateElement');
    const { controlled } = this.getControlAndObject();
    if (
      controlled.type === 'circle' ||
      controlled.type === 'polygon' ||
      controlled.type === 'triangle'
    ) {
      createShape(
        {
          ...controlled,
          type: controlled.type,
        },
        this.canvas,
        this.variableControlAction
      );
    } else if (controlled.type === 'group') {
      // const imgs = controlled._objects.map(
      //   // @ts-ignore
      //   ({ filters, _originalElement }: TFabricObject) => ({
      //     url: _originalElement.currentSrc,
      //     color: filters[0].color,
      //   })
      // );
      // createMultiDesign(
      //   imgs,
      //   {
      //     ...controlled,
      //   },
      //   this.canvas,
      //   this.variableControlAction,
      //   controlled.idDesign
      // );
    } else if (controlled.text) {
      createTextElement(
        {
          ...controlled,
        },
        this.canvas,
        this.variableControlAction
      );
    }
  }
  /**
   * Función que permite cambiar el escalado uniforme en todos los lados del objeto
   */
  toggleUniformScaling = (): void => {
    // console.log('toggleUniformScaling');
    this.uniScaleTransform = !this.uniScaleTransform;
    this.canvas.uniScaleTransform = this.uniScaleTransform;
    this.canvas.renderAll();
  }
  /**
   * Función que cambia el estado del grid en el visor
   */
  showGuideLines = (): void => {
    // console.log('showGuideLines');
    this.guideLines = !this.guideLines;
  }
  /**
   * Función que permite generar un canvas de fabric con la información actual
   * y con atributos que no contiene por defecto los objetos renderizados en ese canvas
   * @returns Devuelve un canvas de fabric con la información actual y lo nuevos atributos
   */
  generateJSON = (): TCanvas => {
    // console.log('generateJSON');
    const canvas = JSON.parse(
      JSON.stringify(
        this.canvas.toJSON([
          'id',
          'idRelated',
          'isControl',
          'position',
          'sides',
          'diameter',
          'flipped',
          'initialAngle',
          'initialScale',
          'clipName',
          'pseudoCharSpacing',
          'idDesing',
          'radio',
          'clipFor',
          'isBorderAux',
        ])
      )
    );
    return canvas;
  }
  /**
   * Función que obtiene la información de data para agregarla al canvas
   * @param canvas Canvas al que se le quiere agregar la información
   * @param data Canvas con la información que se quiere agregar al otro canvas
   */
  readFromJSON = (canvas: any, data: TCanvas): void => {
    // console.log('readFromJSON');
    // this.resetCanvas();
    if (!data?.objects || data?.objects.length === 0) { return null; }

    /**
     * Reescribimos cordenadas y escalas para ajustar según tamaño de pantalla
     */
    // data.objects = data.objects.map(
    //   (el): FabricObject => {
    //     console.log(
    //       "Debería dar 1 entre mismo producto",
    //       el.left,
    //       el.left * (this.width / data.widthArea)
    //     );
    //     //@ts-ignore
    //     return {
    //       ...el,
    //       left: el.left * (this.width / data.widthArea),
    //       top: el.top * (this.height / data.heightArea),
    //       scaleX: el.scaleX * (this.width / data.widthArea),
    //       scaleY: el.scaleY * (this.width / data.widthArea),
    //     };
    //   }
    // );
    // data.objects.forEach(async (obj) => {
    //   if (obj.text) {
    //     restoreTextElement(obj, canvas, this.variableControlAction);
    //   }
    //   if (obj.type === "group") {
    //     await restoreMultiDesign(obj, canvas, this.variableControlAction);
    //   }
    //   if (
    //     obj.type === "polygon" ||
    //     obj.type === "circle" ||
    //     obj.type === "triangle" ||
    //     obj.type === "line"
    //   ) {
    //     restoreShape(obj, canvas, this.variableControlAction);
    //   }
    // });
  }
  /**
   * Función que reestablece el canvas, desactivando todos los objetos seleccionados
   * y renderizando los objetos que no son controles
   */
  resetCanvas = (): void => {
    // console.log('resetCanvas');
    // Obtiene los objetos en el canvas que no sean controles
    const aux = this.canvas._objects.filter(
      (obj: TFabricObject) => obj.isControl === undefined
    ) as TFabricObject[];
    // Asigna los objetos que no son controles al canvas actual
    this.canvas._objects = aux;
    // Desactivca los objetos que estén seleccionados en el canvas
    this.canvas.discardActiveObject();
    this.canvas.renderAll();
  }
  /**
   * Función que almacena la información de la modificación actual en el canvas y asigna el número de la modificación
   */
  changeHistory = (): void => {
    // console.log('changeHistory');
    // Almacena la información de las modificaciones anteriores
    this.history = this.history.slice(0, this.historyIndex + 1);
    // Agrega la última modificación realizada
    this.history.push(this.generateJSON());
    // Asigna el número de la modificación actual
    this.historyIndex = this.history.length - 1;
  }
  /**
   * Función que permite actualizar los datos de la figura ingresados por el usuario
   * @param $event Contiene la información de los cambios realizados en la figura
   */
  changeShape = ($event: any) => {
    // console.log('changeShape');
    let { selected, controlled } = this.getControlAndObject();
    const last = controlled.type;
    // Si el objeto es un poligono
    if (($event.sides || $event.radio) && controlled.type === 'polygon') {
      // Obtiene los puntos que forman el polígono
      const points = algoritmoPoly(
        $event.sides || controlled.sides,
        $event.radio || controlled.radio
      );
      $event.points = points;
      $event.radio = $event.radio || controlled.radio;
      // Configura la información ingresada al polígono
      controlled.set($event);
      controlled.setCoords();
    } else if (controlled.type === 'circle') {
      // Configura la información ingresada al círculo
      controlled.set({
        ...$event,
        radius: $event.radio || controlled.radius,
      });
    } else if (controlled.type === 'line') {
      // Configura la información ingresada a la línea
      if ($event.radio) {
        $event.points = [0, 0, $event.radio, 0];
        controlled.set($event);
      } else {
        controlled.set($event);
      }
    } else {
      // Configura la información ingresada al triángulo
      controlled.set({
        ...$event,
        width: $event.radio || controlled.width || controlled.radius,
        height:
          Math.sqrt($event.radio ** 2 - ($event.radio / 2) ** 2) ||
          controlled.height,
      });
    }

    if ($event.strokeWidth) {
      // Asigna anchura del trazo
      selected.set({
        strokeWidth: $event.strokeWidth,
      });
    }
    // Obtenga las coordenadas y medidas del objeto controlado
    const boundingRect = controlled.getBoundingRect(true, true);
    // Asigna las propiedades del objeto controlado al controlador
    // para que el controlador tome la posición y tamaño de la figura
    selected.set({
      angle: 0,
      width: boundingRect.width / selected.scaleX,
      height: boundingRect.height / selected.scaleY,
      scaleX: selected.scaleX,
      scaleY: selected.scaleY,
      left: boundingRect.left + boundingRect.width / 2,
      top: boundingRect.top + boundingRect.height / 2,
    });

    if ($event.type) {
      // Si se escogio un triangulo y el objeto anterior era una línea
      if ($event.type === 'triangle' && last === 'line') {
        // console.log("Entró acá");
        const width = controlled.width;
        // Calcula altura del triángulo
        const height = Math.sqrt(
          controlled.width ** 2 - (controlled.width / 2) ** 2
        );
        controlled.width = width;
        controlled.height = height;
        // Crea una nueva figura con la información del evento
        restoreShape(
          {
            ...controlled,
            radio: controlled.radio || controlled.width,
            radius: controlled.radio || controlled.width,
            type: $event.type,
          },
          this.canvas,
          this.variableControlAction
        );
      } else {
        const r = controlled.radio || controlled.width;
        const points = algoritmoPoly(controlled.sides, r);
        // Crea una nueva figura con la información del evento
        restoreShape(
          {
            ...controlled,
            points,
            radio: controlled.radio || controlled.width,
            radius: controlled.radio || controlled.width,
            type: $event.type,
          },
          this.canvas,
          this.variableControlAction
        );
      }
      this.canvas.remove(controlled);
      this.canvas.remove(selected);
      selected = this.canvas._objects[this.canvas._objects.length - 1];
      controlled = this.canvas._objects.filter(
        (obj) => obj.id === selected.id
      )[0];
      this.canvas.setActiveObject(controlled);
      this.variableControlAction();
      this.canvas.renderAll();
    }
    // this.changeProductSide(this.productSide);
    this.canvas.renderAll();
  }
  /**
   * Función que obtiene el objeto controlado actualmente en el canvas
   * y retorna ese objeto y su controlador
   * @returns Devuelve el objeto controlado y su controlador
   */
  getControlAndObject = (): TControlAndObject => {
    // console.log('getControlAndObject');
    // Obtiene el control selecionado
    const selected = this.canvas.getActiveObject() as TFabricObject;
    if (!selected) { return null; }
    // Obtiene el objeto controlado
    const controlled = this.canvas._objects.filter(
      (obj) => obj.id === selected.idRelated
    )[0] as TFabricObject;
    return {
      selected,
      controlled,
    };
  }
  /**
   * Función que agrega un color a los filtros de fabric para cambiarle el
   * color a una imagen
   * @param c Cadena con el nombre del color requerido
   */
  addColor(c: string) {
    return new fabric.Image.filters.BlendColor({
      color: c,
      mode: 'tint',
      alpha: 1
    });
  }
  /**
   * Función que agrega las capas de la imagen al canvas,
   * asigna un color a cada capa
   */
  async addCapas() {
    for (let i = 0; i < this.urlsopt.length; i++) {
      fabric.Image.fromURL(this.urlsopt[i], (img: any) => {
        img.set({left: 0, top: 0});
        switch (i) {
          case 0: img.filters.push(this.addColor('yellow')); break;
          case 1: img.filters.push(this.addColor('black')); break;
          case 2: img.filters.push(this.addColor('black')); break;
          case 3: img.filters.push(this.addColor('pink')); break;
          case 4: img.filters.push(this.addColor('brown')); break;
        }
        // Aplica el filtro de color a cada imagen
        img.applyFilters();
        this.canvas.add(img);
      });
      // Realiza una espera entre cada cargado de imagen, ya que el cargado de imagen
      // es asíncrono y si una imagen es más pesada que otra, se va a demorar más
      // en cargar. Así se garantiza que cada capa vaya en su layer correspondiente
      await this.sleep(40);
    }
  }
  /**
   * Función que agrega el JSON del canvas que se muestra al canvas oculto
   */
  addJSONCanvasHidden() {
    // Obtiene la información del canvas que se muestra
    const json = JSON.stringify(this.canvas.toJSON());
    // Obtiene objeto canvas oculto con la información del canvas que se muestra
    const canvas = JSON.parse(json);
    // Recorre los objetos del canvas oculto, cambia la url de la imagen optmizada
    // a la url de la imagen original y  cambia la escala y posición de la nueva imagen
    canvas['objects'].forEach((capa: any, index: number) => {
      capa['width'] = 756;
      capa['height'] = 531;
      capa['src'] = this.urls[index];
      capa['scaleX'] = capa['scaleX'] * (this.factorCanvas / 7.56);
      capa['scaleY'] = capa['scaleY'] * (this.factorCanvas / 7.58);
      capa['left'] = capa['left'] * this.factorCanvas;
      capa['top'] = capa['top'] * this.factorCanvas;
    });
    // Carga el canvas oculto en el elemento canvas html
    this.canvasHidden.loadFromJSON(canvas, () => {
      // console.log('JSON cargado');
    });
  }
  /**
   * Función que descarga la imagen del canvas ocultos con los objetos
   * que se renderizaron en el canvas que se muestra
   */
  downloadImages() {
    // Obtiene la imagen del canvas que se muestra y la descarga
    this.canvasHTML.toBlob((blob) => {
      this.FileSaver.save(blob, 'image.jpg');
    });
    // Obtiene la imagen del canvas que se oculta y la descarga
    this.canvasHTMLHidden.toBlob((blob => {
      this.FileSaver.save(blob, 'imageFHD.jpg');
    }));
  }
  /**
   * Función que obtiene los datos para enviar al Backend
   */
  getData() {
    const c = this.canvas;
    // console.log('-------------------------');
    // console.log('Img ', 'H: ', this.heightImgBackground, ' - ', 'W: ', this.widthImgBackground);
    // console.log('Canvas ', 'H: ', c.getHeight(), ' - ', 'W: ', c.getWidth());
    const clip = this.canvas.getObjects()[0];
    // console.log('Clip ', 'H: ', clip.getScaledHeight(), ' - ', 'W: ', clip.getScaledWidth());
    // console.log('Px to Canvas ', 'H: ', this.topPixelesCanvas, ' - ', 'W: ', this.leftPixelesCanvas);
    const pxToptoClip = this.topPixelesCanvas + CONTROL_OFFSET;
    const pxLefttoClip = this.leftPixelesCanvas + CONTROL_OFFSET;
    // console.log('Px to Clip ', 'H: ', pxToptoClip, ' - ', 'W: ', pxLefttoClip);
  }
  /**
   * Función que asigna ancho y alto al canvas oculto y después le renderiza
   * los mismos objetos del canvas que se muestra
   */
  createCanvasHidden(widthCanvas: number) {
    const widthCanvasHidden = widthCanvas;
    // Obtiene el valor del aspect ratio del canvas que se muestra
    const factorResolution = this.canvas.getHeight() / this.canvas.getWidth();
    const resolutionHeigh = widthCanvasHidden * factorResolution;
    // Las dimensiones del canvas oculto mantiene el aspect ratio del canvas
    // que se muestra
    this.canvasHidden.setHeight(resolutionHeigh);
    this.canvasHidden.setWidth(widthCanvasHidden);
    // Obtiene el factor entre el canvas que se oculta y el canvas que
    // se muestra que servirá para calcular la nueva escala y posicion
    // de los objetos renderizados
    this.factorCanvas = widthCanvasHidden / this.canvas.getWidth();
    // this.addJSONCanvasHidden();
    this.addImageCanvasHidden();
  }
  /**
   * Función que permite detener la ejecución de la siguiente línea de código
   * hasta que se cumpla el tiempo indicado en el parámetro
   * @param ms Tiempo en milisegundos que se debe esperar
   */
  sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  /**
   * Función que agrega una imagen desde la CDN al canvas
   * @param nameImage Cadena con el nombre de la imagen que se quiere agregar al canvas
   */
  async addImageCDN(nameImage: string) {
    // Obtiene la información de la imagen en Amazon, que contiene
    // el ancho y alto de la imagen original
    const dataImage = this.dataImagesAmazon[nameImage];
    // Reemplaza el link con la parte de Amazon por la parte de la CDN
    const linkImage1: string = this.replaceLink(dataImage.link);
    const width = this.canvas.getWidth();
    const heigth = this.canvas.getHeight();
    // Obtiene link para generar imagen con el ancho y alto del cnavas
    const link = `${linkImage1}?w=${width}&h=${heigth}`;
    // El ancho y alto de la imagen no son los mismo del canvas
    // Debido a que la imagen no siempre va a ser cuadrada
    fabric.Image.fromURL(link, (img: any) => {
      // Escala la imagen a la mitad para que no ocupe todo el canvas
      img.set({scaleX: 0.5, scaleY: 0.5});
      // Obtiene la diferencia entre el ancho del canvas y el ancho de la imagen escalada
      const difWidth = width - (img['width'] / 2);
      // Obtiene la diferencia entre el alto del canvas y el alto de la imagen escalada
      const difHeight = heigth - (img['height'] / 2);
      // Centra en ancho y alto la imagen en el canvas
      img.set({left: (difWidth / 2), top: (difHeight / 2)});
      // Almacena el ancho y alto de la imagen de la CDN
      dataImage.widthCDN = img['width'];
      dataImage.heightCDN = img['height'];
      // Almacena la imagen que se va a agregar al canvas
      this.addedImages.push(dataImage);
      this.canvas.add(img);
    }, {
      // Es necesario para que el canvas no quede contaminado y permita la descarga
      crossOrigin: 'anonymous',
    });
  }
  /**
   * Función que agregar las imágenes en el canvas que se muestra al canvas oculto
   */
  addImageCanvasHidden() {
    // Obtiene la información del canvas que se muestra
    const json = JSON.stringify(this.canvas.toJSON());
    // Obtiene objeto canvas oculto con la información del canvas que se muestra
    const canvas = JSON.parse(json);
    // Recorre los objetos del canvas oculto
    canvas['objects'].forEach((img: any, index: number) => {
      // Obtiene la imagen agregada al canvas
      const image = this.addedImages[index];
      // Además de cambiar la url de la CDN a la url de Amazon es necesario
      // cambiar al ancho y alto de la imagen de la url de Amazon
      img['width'] = image.width;
      img['height'] = image.height;
      img['src'] = image.link;
      // El factor de ancho entre la imagen original y la imagen de la CDN
      const factorWidthImg = image.width / image.widthCDN;
      // El factor de ancho entre la imagen original y la imagen de la CDN
      const factorHeightImg = image.height / image.heightCDN;
      // El factor de canvas y el factor de ancho me dan la nueva escala
      // X, Y de la imagen en el canvas oculto
      img['scaleX'] = img['scaleX'] * (this.factorCanvas / factorWidthImg);
      img['scaleY'] = img['scaleY'] * (this.factorCanvas / factorHeightImg);
      // El factor de canvas me da la nueva posición X Y de la imagen en el canvas oculto
      img['left'] = img['left'] * this.factorCanvas;
      img['top'] = img['top'] * this.factorCanvas;
    });

    // Carga el canvas oculto en el elemento canvas html
    this.canvasHidden.loadFromJSON(canvas, () => {
      // console.log('JSON cargado');
    });
  }
  /**
   * Función que reemplaza la parte de la URL de Amazon por la URL de la CDN
   * @param linkImage Cadena con la url que se quiere modificar
   */
  replaceLink(linkImage: string): string {
    return linkImage.replace(this.dataLinks['linkAmazon'], this.dataLinks['linkCDN']);
  }
  /**
   * Función que obtiene una imagen de la CDN produciendo cambios en su tamaño
   */
  getImageCDNSize() {
    // Configura el ancho de la imagen del cdn y el alto lo selecciona
    // el cdn para mantener el aspect ratio
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // Configura el alto de la imagen del cdn y el ancho lo selecciona
    // el cdn para mantener el aspect ratio
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?h=200`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // dpr actua como multiplicador tanto del ancho como del alto de la imagen
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=50&h=150&dpr=2`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // enlarge en true permite que el ancho o alto de la imagen sea mayor al de
    // la imagen original. si en large es false y quieres una imagen de ancho o
    // alto mayor al original, te traerá la imagen original
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=2000&enlarge=true`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // Si mode=fit y se especifica un ancho y alto iguales, el cdn observa si el
    // ancho o alto es mayor y lo configura con ese valor, y el otro lo disminuye
    // para mantener el aspect ratio
    // fabric.Image.fromURL(`${this.urlsCDN[3]}?w=200&h=200&mode=fit`, (img: any) => {
    //   console.log(img['width']);
    //   console.log(img['height']);
    //   this.canvas.add(img);
    // });
  }
  /**
   * Función que obtiene una imagen de la CDN produciendo cambios en su color
   */
  getImageCDNColor() {
    // Si se configura mode=fill que rellena la imagen para que mantega el ancho y
    // alto deseado, se puede cambiar el color de ese relleno con el parámetro "bg"
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&mode=fill&bg=yellow`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "bri" permite configurar el brillo de la imagen, el cual por defecto
    // es cero. El rango de valores del brillo es de -100 a 100
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&bri=20`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "sat" permite configurar la saturación de la imagen, el cual por defecto
    // es cero. El rango de valores de la saturación es de -100 a 100
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&sat=-100`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "hue" permite configurar el tono de la imagen, el cual por defecto
    // es cero. El rango de valores del tono es de 0 a 360
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&hue=90`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "tint" permite configurar el tinte de la imagen. Se puede establecer el
    // valor hexadecimal RGB o con un nombre de color CSS
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&tint=red`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "grayscale" o "greyscale" convierte la imagen a escala de grises
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&grayscale=true`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "invert" produce el negativo de la imagen
    // fabric.Image.fromURL(`${this.urlsCDN[0]}?w=200&h=200&invert=true`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "enhance" mejora el contraste de la imagen de salida
    fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&enhance=true`, (img: any) => {
      this.canvas.add(img);
    });
  }
  /**
   * Función que obtiene una imagen de la CDN realizando operaciones sobre la imagen
   */
  getImageCDNOperations() {
    // El parámetro "rotate" permite girar la imagen. El rango de valores de giro
    // va desde 0 hasta 360. El valor de giro por defecto es de 0
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&rotate=20`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "flip" permite voltear verticalmente la imagen flip=v,
    // voltear horizontalmente la imagen flip=h o voltear tanto horizontal
    // como verticalmente flip=hv o flip=vh
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&flip=v`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "blur" permite difuminar la imagen. Los valores de difuminado
    // van de 0 a 100
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&blur=2`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "threshold" hará que cualquier valor de píxel mayor o igual
    // al valor de umbral, se establezca en 255, de lo contrario será 0
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&threshold=150`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "opacity" permite cambiar la opacidad de la imagen. El rango
    // de valores es 0 y 100.
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&opacity=50`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "gam" permite aplicar una correción gamma para oscurecer o
    // aclarar la imagen. Los rangos de valores es de 1.0 a 3.0
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&gam=1.2`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "sharp" permite agregar nitidez a la imagen. Los rangos de
    // valores es de 0 y 100
    fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&sharp=50`, (img: any) => {
      this.canvas.add(img);
    });
  }
  /**
   * Función que obtiene una imagen de la CDN realizando supersición de imágenes
   */
  getImageCDNOverlayImage() {
    // El parámetro overlay toma la URL de la imagen como entrada y superpone la
    // imagen obtenida sobre la imagen que se está procesando. La superposición es
    // en el centro de la imagen que se está procesando
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=300&h=300&overlay=${this.urlsCDN[4]}?w=50&h50`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_position=bottomleft hace la superposición en la parte
    // inferior izquierda
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}&overlay_position=bottomleft`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_position=topleft hace la superposición en la parte
    // superior izquierda
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}&overlay_position=topleft`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_position=topright hace la superposición en la parte
    // superior derecha
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}&overlay_position=topright`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_position=bottomright hace la superposición en la parte
    // inferior derecha
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}&overlay_position=bottomright`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_top especifica el desplazamiento de superposición en
    // número de píxeles desde el borde superior de la imagen
    // El parámetro overlay_left especifica el desplazamiento de superposición en
    // número de píxeles desde el borde izquierdo de la imagen
    // fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}&overlay_top=20&overlay_left=30`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro overlay_tile repite la imagen superpuesta como mosaicos sobre la
    // imagen que se está procesando
    fabric.Image.fromURL(`${this.urlsCDN[1]}?w=200&h=200&overlay=${this.urlsCDN[4]}?w=20&h=20&overlay_tile=true`, (img: any) => {
      this.canvas.add(img);
    });
  }
  /**
   * Función que obtiene una imagen de la CDN realizando supersición de texto
   */
  getImageCDNOverlayText() {
    // El parámetro "text" toma cadenas de texto como entrada. Para escribir varias
    // líneas se usa \n
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=hola\nmundo`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "text_top" especifica la posicion en píxeles del texto desde el borde superior de la imagen
    // El parámetro "text_left" especifica la posicion en píxeles del texto desde el borde izquierdo de la imagen
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=hola&text_top=10&text_left=30`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "text_font" especifica el tipo de letra del texto
    // El parámetro "text_font_size" especifica el tamaño de la fuente en píxeles
    // El parámetro "text_line_height" especifica la altura de la línea en píxeles
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=hola&text_font=sans-serif&text_font_size=20`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "text_align" decide la alineación del texto
    // El parámetro "text_color" permite cambiar el color de la fuente
    // El parámetro "text_bg_color" permite cambiar el fondo del texto, por defecto
    // es transparent
    // tslint:disable-next-line: max-line-length
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=hola&text_align=center&text_color=green&text_bg_color=black`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "tex_position" decide la posición del texto en una imagen
    // Los valores validos son topleft, top, topright, right, bottomright, bottom,
    // bottomleft, left y center
    // El parámetro "text_rotate" gira el texto desde su centro
    // El rango de valores son 0 y 360
    // fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=hola&text_position=topleft&text_rotate= 120`, (img: any) => {
    //   this.canvas.add(img);
    // });
    // El parámetro "text_wrap" coloca automáticamente el texto en una nueva línea
    // si desborda el ancho dado
    fabric.Image.fromURL(`${this.urlsCDN[2]}?w=200&h=200&text=holamundo nuevo&text_wrap=true`, (img: any) => {
      this.canvas.add(img);
    });
  }
}
