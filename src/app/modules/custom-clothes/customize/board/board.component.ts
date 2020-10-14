import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  Input,
  ViewChild,
} from '@angular/core';

import { fabric } from 'fabric';
import { FileSaverService } from 'ngx-filesaver';

import { CONTROL_OFFSET } from './constants';
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
 * Componente app-board encagardo de renderizar los objetos en el canvas
 */
@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, AfterViewInit {
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
   * Contiene la información de la vistas del producto y sus imágenes correspondientes
   */
  @Input() product: any;
  /**
   * Indice de la vista actual del producto en el canvas
   */
  @Input() productSide: number;
  /**
   * Arreglo que almancena los borradores de los canvas con los objetos que fueron renderizados
   */
  @Input() canvasSides: TCanvas[];
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
   * Arreglo con la información de cada modificación en el visor
   */
  history: TCanvas[] = [];
  /**
   * Valor del indice de la modificación actual en el canvas del visor
   */
  historyIndex = 0;
  /**
   * Es true si no se ha cambaido el tamaño del elemento canvas
   */
  state = true;
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

  constructor(private FileSaver: FileSaverService,
              private http: HttpService) { }

  ngOnInit(): void {
    this.top =
      (this.product[this.productSide].arriba /
        this.product[this.productSide].altoReal);
    this.left =
      this.product[this.productSide].izquierda /
      this.product[this.productSide].anchoReal; // necesitamos el valor de 0 a 1, para multiplicar con el ancho del contenedor
    console.log('onInit');
    // Obtiene las urls de las imágenes en Amazon
    this.http.getImagesAmazon().subscribe((images: any) => {
      this.dataImagesAmazon = images;
    });
    // Obtiene las urls de Amazon y de la CDN
    this.http.getLinks().subscribe((links: any) => {
      this.dataLinks = links;
    });
  }

  // @HostListener("window:resize", ["$event"])
  // onResize(): void {
  //   // if (this.windowWidth === window.innerWidth) {
  //   //   this.windowWidth = window.innerWidth;
  //   //   return null;
  //   // }
  //   // // this.changeProductSide(this.productSide);
  //   // this.resizeCanvas();
  //   // this.windowWidth = window.innerWidth;
  // }

  ngAfterViewInit(): void {
    // Cambia el tamaño del canvas cuando se termina de cargar la imagen
    this.imgBackground.nativeElement.onload = () => {
      this.resizeCanvas();
    };
    // tslint:disable-next-line: no-non-null-assertion
    this.canvasHTML = this.canvasRef!.nativeElement;
    // tslint:disable-next-line: no-non-null-assertion
    this.canvasHTMLHidden = this.canvasRefHidden!.nativeElement;
    console.log('after view');
  }
  /**
   * Función que asigna las propiedades a un nuevo canvas y establece los eventos correspondientes
   */
  loadCanvas = async () => {
    this.heightImgBackground = this.imgBackground.nativeElement.height;
    const height = this.heightImgBackground;
    this.topPixelesCanvas = this.top * this.heightImgBackground;
    this.widthImgBackground = this.imgBackground.nativeElement.width;
    const width = this.widthImgBackground;
    this.leftPixelesCanvas = this.left * this.widthImgBackground;
    const style = window.getComputedStyle(this.imgBackground.nativeElement);
    const marginLeft = parseInt(style.marginLeft, 10);
    this.imgOffset = marginLeft;
    // Obtiene el alto del canvas de fabric
    this.height =
      (this.product[this.productSide].altoAreaReal /
        this.product[this.productSide].altoReal) *
      height;
    // Obtiene el ancho del canvas de fabric
    this.width =
      (this.product[this.productSide].anchoAreaReal /
        this.product[this.productSide].anchoReal) *
      width;
    // this.gridColumn = Math.floor(this.width / 15 / 2);
    // this.gridRow = Math.floor(this.height / 15 / 2);
    // this.grid = Array(this.gridColumn * this.gridRow).fill(0);
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
    // this.createBorder(this.canvas);
    // Se activa cuando se modifica un objeto en el canvas de fabric
    this.canvas.on('object:modified', (e: fabric.IEvent) => {
      // console.log('modified');
      // this.changeHistory();
      // this.changeProductSide(this.productSide);
      // this.generatePreviews();
    });
    // Se activa cuando se agrega un objeto al canvas de fabric
    this.canvas.on('object:added', (e: fabric.IEvent) => {
      // console.log('addedCanvas');
      // console.log(this.canvas.item(0));
      // this.changeProductSide(this.productSide);
      // this.generatePreviews();
    });
    // Se activa cuando se elimina un objeto en el canvas de fabric
    this.canvas.on('object:removed', (e: fabric.IEvent) => {
      // console.log('removed');
      // this.changeProductSide(this.productSide);
      // this.generatePreviews();
    });
    // Se activa mientras se esta rotando un objeto en el canvas de fabric
    this.canvas.on('object:rotating', (e: fabric.IEvent) => {
      // console.log('rotating');
      // if (!this.isRotating) {
      //   this.isRotating = true;
      // }
      // let { controlled } = this.getControlAndObject();
      // let initial = controlled.angle;
      // let aux = Math.trunc(initial / 360);
      // if (aux !== 0) {
      //   initial = Math.trunc(initial / aux) - 360;
      // }
      // if (initial >= 180 && initial <= 360) {
      //   this.rotationAngle = Math.trunc(360 - initial);
      // } else {
      //   this.rotationAngle = Math.trunc(initial);
      // }
      // rotating(e, this.canvas);
    });
    // Se activa mientras se esta moviendo un objeto en el canvas de fabric
    this.canvas.on('object:moving', (e: fabric.IEvent): void => {
      // console.log('moving');
      // moving(e, this.canvas, this.variableControlAction);
    });
    // Se activa cuando se termina de mover un objeto en el canvas de fabric
    this.canvas.on('object:moved', (e: fabric.IEvent): void => {
      // console.log('moved');
      // this.calculateMaxWidthOfTextbox();
    });
    // Se activa mientras se esta escalando un objeto en el canvas de fabric
    this.canvas.on('object:scaling', (e: fabric.IEvent): void => {
      // console.log('scaling');
      // scaling(e, this.canvas);
    });
    // Se activa cuando se termina de escalar un objeto en el canvas de fabric
    this.canvas.on('object:scaled', (e: fabric.IEvent): void => {
      // console.log('scaled');
      // this.calculateMaxWidthOfTextbox();
    });
    // Se activa cuando se termina de rotar un objeto en el canvas de fabric
    this.canvas.on('object:rotated', (e: fabric.IEvent): void => {
      // console.log('rotated');
      // this.isRotating = false;
      // rotated(e, this.canvas);
      // this.calculateMaxWidthOfTextbox();
    });
    // Se activa cuando se selecciona un objeto en el canvas de fabric
    this.canvas.on('selection:created', (e: fabric.IEvent): void => {
      // console.log('createdCanvas');
      // console.log(this.canvas.item(0));
      // this.selectionCreatedAndUpdated(e);
    });
    // Se activa cuando teniendo selecciona un objeto en el canvas de fabric se selecciona otro objeto en el canvas
    this.canvas.on('selection:updated', (e: fabric.IEvent): void => {
      // console.log('updated');
      // this.selectionCreatedAndUpdated(e);
      // if (this.windowWidth < 960) {
      //   this.closeFromBoard.emit(true);
      // }
    });
    // Se activa cuando se deselecciona un objeto en el canvas de fabric sin seleccionar otro objeto
    this.canvas.on('selection:cleared', (e: fabric.IEvent) => {
      // console.log('clearedCanvas');
      // console.log(this.canvas.item(0));
      // this.objectActive = false;
      // this.closeFromBoard.emit(true);
      // this.disableShowColor = true;
      // this.textClearedEvent.emit(true);
      // let rect = this.canvas._objects.filter(
      //   ({ isBorderAux }) => isBorderAux
      // )[0];
      // rect.set({
      //   stroke: "transparent",
      // });
      // this.canvas.renderAll();
    });
    // runConfigurations();
  }
  /**
   * Función que reestablece todos los valores y objetos en el canvas
   */
  resizeCanvas = async () => {
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
    //   // json = this.canvas.toJSON();
    //   // json.altoAreaPixeles = this.height;
    //   // json.anchoAreaPixeles = this.width;
    }
    this.canvas = null;
    this.loadCanvas();

    // this.readFromJSON(this.canvas, this.canvasSides[this.productSide]);

    this.history = [];
    this.historyIndex = 0;

    // // await createMultiDesign(
    // //   this.designs[0].images,
    // //   {},
    // //   this.canvas,
    // //   this.variableControlAction,
    // //   1
    // // );

    // // createShape(
    // //   { type: "line", radio: 60, strokeWidth: 1 },
    // //   this.canvas,
    // //   this.variableControlAction
    // // );
    // // createShape(
    // //   { type: "polygon", sides: 6, radio: 60, fill: "#222FFF" },
    // //   this.canvas,
    // //   this.variableControlAction
    // // );
    // // createShape(
    // //   { type: "circle", radio: 60, strokeWidth: 25, stroke: "#660000" },
    // //   this.canvas,
    // //   this.variableControlAction
    // // );

    this.changeHistory();

    // this.generatePreviews();
  }
  /**
   * Función que crea el objeto de recorte y el objeto de bordes punteados y los agrega al canvas de fabric
   * @param canvas Objeto con la información del canvas de fabric
   */
  createBorder = (canvas: TFabricCanvas): void => {
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
      stroke: 'black',
      strokeDashArray: [3, 3],
      selectable: false,
      hoverCursor: 'default',
    });
    border['isBorderAux'] = true;
    canvas.add(border);
  }
  /**
   * Función que almacena la información de la modificación actual en el canvas y asigna el número de la modificación
   */
  changeHistory = (): void => {
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(this.generateJSON());
    this.historyIndex = this.history.length - 1;
  }
  /**
   * Función que permite generar un canvas de fabric con la información actual
   * y con atributos que no contiene por defecto los objetos renderizados en ese canvas
   * @returns Devuelve un canvas de fabric con la información actual y lo nuevos atributos
   */
  generateJSON = (): TCanvas => {
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
      console.log('JSON cargado');
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
    console.log('-------------------------');
    console.log('Img ', 'H: ', this.heightImgBackground, ' - ', 'W: ', this.widthImgBackground);
    console.log('Canvas ', 'H: ', c.getHeight(), ' - ', 'W: ', c.getWidth());
    const clip = this.canvas.getObjects()[0];
    console.log('Clip ', 'H: ', clip.getScaledHeight(), ' - ', 'W: ', clip.getScaledWidth());
    console.log('Px to Canvas ', 'H: ', this.topPixelesCanvas, ' - ', 'W: ', this.leftPixelesCanvas);
    const pxToptoClip = this.topPixelesCanvas + CONTROL_OFFSET;
    const pxLefttoClip = this.leftPixelesCanvas + CONTROL_OFFSET;
    console.log('Px to Clip ', 'H: ', pxToptoClip, ' - ', 'W: ', pxLefttoClip);
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
    // el amcho y alto de la imagen original
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
      console.log('JSON cargado');
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
