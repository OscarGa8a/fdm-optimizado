import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardComponent } from './board/board.component';
import { IShapeOptions } from './board/elements';

import {
  TUpdateCanvas,
  TCanvas,
  TTextSelectionEvent,
  TFabricObject,
} from './types';

import drafts from './draft.json';
/**
 * Componente padre encargado de compartir la información entre sus componentes
 * hijos
 */
@Component({
  selector: 'app-customize',
  templateUrl: './customize.component.html',
  styleUrls: ['./customize.component.css']
})
export class CustomizeComponent implements OnInit {
  /**
   * Decorador que obtiene la instancia del componente board
   */
  @ViewChild(BoardComponent, { static: false }) board: BoardComponent;
  /**
   * Objeto con las opciones por defecto para el texto de fabric
   */
  DEFAULT_TEXT_OPTIONS = {
    type: 'textbox',
    text: 'edita el texto',
    fill: '#000000',
    flipped: false,
    fontFamily: `'Arial'`,
    textAlign: 'left',
    fontSize: 14,
    pseudoCharSpacing: 0,
    charSpacing: 0,
    scaleX: 1,
    scaleY: 1,
    width: 50,
    shadow: {
      color: '#FF0000',
      blur: 0,
      offsetX: 1,
      offsetY: 1,
    },
    fontStyle: 'normal',
    fontWeight: 'normal',
  } as TFabricObject;
  /**
   * Almacena la información de la figura en el canvas
   */
  shape: IShapeOptions = {
    sides: 4,
    radio: 40,
    fill: '#222222',
    stroke: '#222222',
    strokeWidth: 3,
    type: 'polygon',
  };
  /**
   * Almacena la información del texto seleccionado en el visor
   */
  text = {
    element: this.DEFAULT_TEXT_OPTIONS,
    maxWidth: 0,
  };
  /**
   * Almancena los borradores de los canvas con los objetos que fueron renderizados
   */
  canvasSides: TCanvas[] = [];
  /**
   * Arreglo con informacion de los productos por categoria
   */
  productsPerCategory = [
    {
      id: 0,
      category: 'Hombre',
      products: [
        {
          id: 0,
          name: 'Camisa hombre',
          url: '/assets/background/camiseta-blanca-frente.png',
          sizes: [
            {
              name: 'S',
              id: 1,
              colors: [
                {
                  id: 1,
                  name: 'Blanco',
                  color: '#FFFFFF',
                  sides: [
                    {
                      name: 'Adelante',
                      url: '/assets/background/camiseta-blanca-frente.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 10,
                      arriba: 10,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 22,
                      altoAreaReal: 30,
                    },
                    {
                      name: 'Atrás',
                      url: '/assets/background/camiseta-blanca-atras.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 10,
                      arriba: 10,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 22,
                      altoAreaReal: 30,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: 1,
      category: 'Mujer',
      products: [
        {
          id: 20,
          name: 'Sport-Tek',
          url: '/assets/background/sport-tek-gris-frente.png',
          sizes: [
            {
              id: 2,
              name: 'S',
              colors: [
                {
                  id: 40,
                  name: 'Gris',
                  color: '#8C8C8C',
                  sides: [
                    {
                      name: 'Adelante',
                      url: '/assets/background/sport-tek-gris-frente.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 11,
                      arriba: 17,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 20,
                      altoAreaReal: 25,
                    },
                    {
                      name: 'Atrás',
                      url: '/assets/background/sport-tek-gris-atras.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 10,
                      arriba: 15,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 20,
                      altoAreaReal: 25,
                    },
                  ],
                },
                {
                  id: 50,
                  name: 'Azul',
                  color: '#697FB6',
                  sides: [
                    {
                      name: 'Adelante',
                      url: '/assets/background/sport-tek-azul-frente.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 11,
                      arriba: 17,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 20,
                      altoAreaReal: 25,
                    },
                    {
                      name: 'Atrás',
                      url: '/assets/background/sport-tek-azul-atras.png',
                      anchoImg: 1200,
                      altoImg: 1406,
                      anchoReal: 41,
                      altoReal: 54.7,
                      izquierda: 10,
                      arriba: 15,
                      anchoAreaPixeles: 176,
                      altoAreaPixeles: 240,
                      anchoAreaReal: 20,
                      altoAreaReal: 25,
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  ];
  /**
   * Almacena los indices actuales de categoria, producto,
   * tallas, color y vista
   */
  currentIndexes: CurrentIndexes = {
    category: 0,
    product: 0,
    size: 0,
    color: 0,
    side: 0,
  };
  /**
   * Cadena con la url del producto de previsualización
   */
  productPreview: string;
  /**
   * Indica si se debe mostrar el mensaje de cuando se realiza
   * un cambio en la opción seleccionada
   */
  showMessage = false;
  /**
   * Indica si se ha abierto alguna de las opciones del editor
   */
  optionsIsOpen = false;
  /**
   * Cadena con el nombre de la opción escogida en el editor
   */
  whatIsOpen = 'product';
  /**
   * Indica si se está en el editor de la página
   */
  isInEditor = true;
  /**
   * ID del borrador del canas con los objetos que se desean renderizar
   */
  draftId: number;
  /**
   * Cadena con el nombre de la opción móvil seleccionada
   */
  menuMobileOption = '';
  /**
   * Contructor del componente
   * @param route Permite obtener los parámetros ingresados en la url
   */
  constructor(private route: ActivatedRoute) { }
  /**
   * Función obtiene el borrador creado previamente del canvas
   */
  ngOnInit(): void {
    // console.log('ngOnInit');
    const length = this.productsPerCategory[this.currentIndexes.category]
      .products[this.currentIndexes.product].sizes[this.currentIndexes.size]
      .colors[this.currentIndexes.color].sides.length;
    this.canvasSides.length = length;
    this.canvasSides.fill(
      {
        version: '3.6.3',
        objects: [],
      },
      0,
      length + 1
    );
    this.draftId = this.route.snapshot.queryParams['draft'];
    if (this.draftId) {
      // @ts-ignore
      const draft = this.getDraft(this.draftId);
      if (draft) {
        // Asigna los borradores de los canvas
        this.canvasSides = draft.sides;
        this.getIndexesFromProductVariant(draft.productVariant);
      } else {
        // Obtiene el borrador del canvas del local storage
        const draftStored = JSON.parse(localStorage.getItem('DRAFT_FDM'));
        // Asigna los borradores de los canvas
        this.canvasSides = draftStored.sides;
        this.getIndexesFromProductVariant(draftStored.productVariant);
      }
    } else {
      if (localStorage.getItem('DRAF_FDM')) {
        // Obtiene el borrador del canvas del local storage
        const draftStored = JSON.parse(localStorage.getItem('DRAFT_FDM'));
        // Asigna los borradores de los canvas
        this.canvasSides = draftStored.sides;
        this.getIndexesFromProductVariant(draftStored.productVariant);
      }
    }
  }
  /**
   * Función que cambia la opción móvil seleccionada
   * @param tab Cadena con el nombre de la opción móvil seleccionada
   */
  changeMenuMobile(tab: string): void {
    // console.log('changeMenuMobile');
    if (tab === this.menuMobileOption) {
      this.menuMobileOption = '';
    } else {
      this.menuMobileOption = tab;
    }
  }
  /**
   * Función que obtiene y almacena los índices de categoría, producto, talla, color y vista del borrador del canvas
   * @param idVariant ID del borrador del producto a renderizar en el canvas
   */
  getIndexesFromProductVariant = (idVariant: any): void => {
    // console.log('getIndexesFromProductVariant');
    for (let i = 0; i < this.productsPerCategory.length; i++) {
      for (let j = 0; j < this.productsPerCategory[i].products.length; j++) {
        for (
          let k = 0;
          k < this.productsPerCategory[i].products[j].sizes.length;
          k++
        ) {
          for (
            let l = 0;
            l < this.productsPerCategory[i].products[j].sizes[k].colors.length;
            l++
          ) {
            if (
              this.productsPerCategory[i].products[j].sizes[k].colors[l].id ===
              idVariant
            ) {
              this.currentIndexes = {
                category: i,
                product: j,
                size: k,
                color: l,
                side: 0,
              };
            }
          }
        }
      }
    }
  }
  /**
   * Función que obtiene el borrador de objetos con el ID ingresado por parámetro
   * @param id ID del borrador de objetos para mostrar en el canvas
   * @returns Devuelve el borrador de objetos para renderizar en el canvas
   */
  getDraft = (id: number): any => {
    // console.log('getDraft');
    return drafts.filter(({ draftId }) => id === draftId)[0];
  }
  /**
   * Función que muestra un mensaje de que se ha realizado un cambio a un objeto del editor
   * @param $event Indica si se ha realizado un cambio en un objeto del canvas
   */
  handleShowMessage = ($event: boolean): void => {
    // console.log('handleShowMessage');
    this.showMessage = $event;
  }
  /**
   * Función que indica si se está en el editor de la página
   */
  handleOpenDetail = (): void => {
    // console.log('handleOpenDetail');
    this.isInEditor = false;
  }
  /**
   * Función que maneja la opción escogida en el editor
   * @param $event Cadena con el nombre de la opción escogida en el editor
   */
  handleSelection = async ($event: string) => {
    // console.log('handleSelection');
    this.optionsIsOpen = true;
    this.whatIsOpen = $event;
    if ($event === 'text') {
      this.board.createText(this.DEFAULT_TEXT_OPTIONS);
    }
    if ($event === 'shape') {
      this.board.createShape({
        sides: 4,
        radio: 40,
        fill: '#222222',
        stroke: '#222222',
        strokeWidth: 3,
        type: 'polygon',
      });
    }
    if ($event === 'color') {
      // await this.board.createDesign({});
    }
    /** Limpia menú móvil inicial */
    // this.menuMobileOption = '';
  }
  /**
   * Función que cambia la opción escogida en el editor para ser manipulada por el padre
   * @param $event Cadena con el nombre de la opción escogida en el editor
   */
  handleOpenSelection = ($event: string): void => {
    // console.log('handleOpenSelection');
    this.optionsIsOpen = true;
    this.whatIsOpen = $event;
  }
  /**
   * Función que permite cerrar la opción abierta en el editor y limpia
   * la selección actual en el visor
   * @param $event Evento que indica que se ha cerrado las opciones del editor
   */
  handleClose = (): void => {
    // console.log('handleClose');
    this.optionsIsOpen = false;
    this.board.clearSelection();
  }
  /**
   * Función que permite cerrar la opción abierta en el editor
   * @param $event Indica si se deben cerrar las opciones del editor
   */
  handleCloseFromBoard = ($event: boolean): void => {
    // console.log('handleCloseFromBoard');
    this.optionsIsOpen = false;
  }
  /**
   * Función que actualiza el índice de la vista actual en el canvas
   * @param index Indice de la vista actual en el visor del editor
   */
  updateProductSide = (index: number): void => {
    // console.log('updateProductSide');
    this.currentIndexes.side = index;
  }
  /**
   * Función que actualiza la información de los canvas de previsualización
   * @param param0 Objeto de tipo TUpdateCanvas con la información del canvas actual
   */
  updateCanvasSides = ({
    index,
    canvas,
    heightArea,
    widthArea,
  }: TUpdateCanvas): void => {
    // console.log('updateCanvasSides');
    this.canvasSides[index] = canvas;
    this.canvasSides[index].heightArea = heightArea;
    this.canvasSides[index].widthArea = widthArea;
  }
  /**
   * Función que actualiza en el padre la información de figura seleccionado
   * @param $event Objeto con la información de la figura seleccionada
   */
  updateSelectionShape = ($event: any): void => {
    // console.log('updateSelectionShape');
    const shape: IShapeOptions = {
      type: $event.type,
      fill: $event.fill,
      stroke: $event.stroke,
      strokeWidth: $event.strokeWidth,
      sides: $event.sides,
      radio: $event.radio,
    };
    this.shape = shape;
  }
  /**
   * Función que actualiza en el padre la información del texto seleccionado
   * @param param0 Objeto con la información del texto seleccionado y su ancho máximo permitido
   */
  updateSelectionText = ({ element, maxWidth }: TTextSelectionEvent): void => {
    // console.log('updateSelectionText');
    const {
      text,
      fontFamily,
      fontSize,
      fill,
      flipped,
      diameter,
      type,
      pseudoCharSpacing,
      width,
      textAlign,
      shadow,
    } = element;
    this.text = {
      element: {
        width,
        diameter,
        text,
        fontFamily,
        fontSize,
        flipped,
        fill,
        type,
        pseudoCharSpacing,
        textAlign,
        shadow,
      } as TFabricObject,
      maxWidth,
    };
  }
  /**
   * Función que asigna la url del canvas de previsualización
   * @param $event Cadena con la url del canvas de previsualización
   */
  updatePreviewImg = ($event: string): void => {
    // console.log('updatePreviewImg');
    // console.log("Que se envia desde el evento?", $event);
    this.productPreview = $event;
  }
  /**
   * Función que maneja el cambio en la información ingresada en el texto
   * @param $event Contiene la información actualiza del texto
   */
  handleTextChanges = ($event: any): void => {
    // console.log('handleTextChanges');
    this.board.changeCurveTextProperties($event);
  }
  /**
   * Función que maneja el cambio en la información ingresada para la figura
   * @param $event Contiene la información de la figura
   */
  handleShapeChanges = ($event: any): void => {
    // console.log('handleShapeChanges');
    this.board.changeShape($event);
  }
  /**
   * Función que agrega valores por defecto al texto seleccionado
   */
  handleTextCleared = (): void => {
    // console.log('handleTextCleared');
    this.text = {
      element: {
        text: 'edita el texto',
        fill: '#000000',
        flipped: false,
        fontFamily: `'Arial'`,
        fontSize: 14,
        fontStyle: 'normal',
        fontWeight: 'normal',
        textAlign: 'left',
        type: 'textbox',
        pseudoCharSpacing: 0,
        scaleX: 1,
        scaleY: 1,
        shadow: {
          color: '#000000',
          blur: 0,
          offsetX: 0,
          offsetY: 0,
        },
      } as TFabricObject,
      maxWidth: 0,
    };
  }
}

/**
 * Interfaz que almacena los indices actuales de categoria, producto,
 * tallas, color y vista
 */
export interface CurrentIndexes {
  /**
   * Indice de la categoría del producto
   */
  category: number;
  /**
   * Indice del producto
   */
  product: number;
  /**
   * Indice de la talla del producto
   */
  size: number;
  /**
   * Indice del color del producto
   */
  color: number;
  /**
   * Indice de la vista del producto
   */
  side: number;
}
/**
 * Interfaz que almacena la información del texto de fabric
 */
export interface TextCurved {
  /**
   * Cadena con el texto
   */
  text?: string;
  /**
   * Cadena con la fuente del texto
   */
  fontFamily?: string;
  /**
   * Valor del tamaño de la fuente del texto
   */
  fontSize?: number;
  /**
   * Cadena con el color del texto
   */
  fill?: string;
  /**
   * Valor del diámetro del texto
   */
  diameter?: number;
  /**
   * Indica si el texto está invertido
   */
  flipped?: boolean;
  /**
   * Valor del pseudo-espaciado de los caracteres
   */
  pseudoCharSpacing?: number;
  /**
   * Valor del espaciado de los caracteres
   */
  charSpacing?: number;
  /**
   * Cadena con el tipo del texto
   */
  type?: string;
  /**
   * Valor del ancho del texto
   */
  width?: number;
  /**
   * Cadena con el peso de la fuente en el texto
   */
  fontWeight?: string;
  /**
   * Cadena con el estilo de la fuente en el texto
   */
  fontStyle?: string;
  /**
   * Valor del ancho máximo del texto
   */
  maxWidth?: number;
  /**
   * Valor de la escala en X en el texto
   */
  scaleX?: number;
  /**
   * Valor de la escala en Y en el texto
   */
  scaleY?: number;
  /**
   * Cadena con el alineamiento del texto
   */
  textAlign?: string;
  /**
   * Objeto con los opciones de sombra en el texto
   */
  shadow?: {
    color?: string;
    blur?: number;
    offsetX?: number;
    offsetY?: number;
    opacity?: number;
  };
  /**
   * Objeto con las propiedades de un objeto de tipo fabric
   */
  element?: TFabricObject;
}
