import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BoardComponent } from './board/board.component';

import {
  TUpdateCanvas,
  TCanvas,
  TTextSelectionEvent,
  TFabricObject,
} from './types';

import drafts from './draft.json';

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
   * Indica si se ha abierto alguna de las opciones del editor
   */
  optionsIsOpen = false;
  /**
   * Cadena con el nombre de la opción escogida en el editor
   */
  whatIsOpen = 'product';
  /**
   * ID del borrador del canas con los objetos que se desean renderizar
   */
  draftId: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
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
      // Obtiene el borrador del canvas del local storage
      const draftStored = JSON.parse(localStorage.getItem('DRAFT_FDM'));
      // Asigna los borradores de los canvas
      this.canvasSides = draftStored.sides;
      this.getIndexesFromProductVariant(draftStored.productVariant);
    }
  }
  /**
   * Función que obtiene y almacena los índices de categoría, producto, talla, color y vista del borrador del canvas
   * @param idVariant ID del borrador del producto a renderizar en el canvas
   */
  getIndexesFromProductVariant = (idVariant: any): void => {
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
    return drafts.filter(({ draftId }) => id === draftId)[0];
  }
  /**
   * Función que maneja la opción escogida en el editor
   * @param $event Cadena con el nombre de la opción escogida en el editor
   */
  handleSelection = async ($event: string) => {
    this.optionsIsOpen = true;
    this.whatIsOpen = $event;
    if ($event === 'text') {
      this.board.createText(this.DEFAULT_TEXT_OPTIONS);
    }
    if ($event === 'shape') {
      console.log($event);
      // this.board.createShape({
      //   sides: 4,
      //   radio: 40,
      //   fill: '#222222',
      //   stroke: '#222222',
      //   strokeWidth: 3,
      //   type: 'polygon',
      // });
    }
    if ($event === 'color') {
      console.log($event);
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
    this.optionsIsOpen = true;
    this.whatIsOpen = $event;
  }
  /**
   * Función que actualiza el índice de la vista actual en el canvas
   * @param index Indice de la vista actual en el visor del editor
   */
  updateProductSide = (index: number): void => {
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
    this.canvasSides[index] = canvas;
    this.canvasSides[index].heightArea = heightArea;
    this.canvasSides[index].widthArea = widthArea;
  }
  /**
   * Función que actualiza en el padre la información del texto seleccionado
   * @param param0 Objeto con la información del texto seleccionado y su ancho máximo permitido
   */
  updateSelectionText = ({ element, maxWidth }: TTextSelectionEvent): void => {
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
    // console.log("Que se envia desde el evento?", $event);
    this.productPreview = $event;
  }
}


/**
 * Interfaz que almacena los indices actuales de categoria, producto,
 * tallas, color y vista
 */
export interface CurrentIndexes {
  category: number;
  product: number;
  size: number;
  color: number;
  side: number;
}
