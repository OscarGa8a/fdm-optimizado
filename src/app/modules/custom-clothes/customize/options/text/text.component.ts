import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  AfterViewInit,
  ViewChild,
  ElementRef,
  HostListener,
  OnChanges
} from '@angular/core';
import { TextCurved } from '../../customize.component';
import Pickr from '@simonwep/pickr';
import { TFabricObject } from '../../types';

@Component({
  selector: 'app-text',
  templateUrl: './text.component.html',
  styleUrls: ['./text.component.css'],
})
export class TextComponent implements OnInit, AfterViewInit, OnChanges {
  /**
   * Almacena la información del texto de fabric
   */
  @Input() text: TFabricObject;
  /**
   * Valor del ancho máximo del texto
   */
  @Input() maxWidth: number;
  /**
   * Emite la información del texto que ha sido cambiado
   */
  @Output() eventTextChanges = new EventEmitter<TextCurved>();
  @Output() eventClose = new EventEmitter<boolean>();
  /**
   * Decorador que obtiene la instancia del selector de tipo fuente
   */
  @ViewChild('select', { static: true }) select: ElementRef;
  /**
   * Decorador que obtiene la instancia del elemento textarea
   */
  @ViewChild('textArea', { static: true }) textArea: ElementRef;
  /**
   * Cadena con el texto ingresado por el usuario
   */
  textValue = '';
  /**
   * Indica si el texto es curveado
   */
  textCurved = false;
  /**
   * Indica si la fuente es en negrilla
   */
  bold = false;
  /**
   * Indica si la fuente es en cursiva
   */
  italic = false;
  /**
   * Arreglo con las fuentes disponibles
   */
  fonts = [
    {
      font: 'Arial',
      bold: true,
      italic: true,
    },
    {
      font: 'Special Elite',
      url:
        'https://fonts.googleapis.com/css2?family=Special+Elite&display=swap',
      bold: false,
      italic: false,
    },
    {
      font: 'Kaushan Script',
      url:
        'https://fonts.googleapis.com/css2?family=Kaushan+Script&display=swap',
      bold: false,
      italic: false,
    },
    {
      font: 'Press Start 2P',
      url:
        'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
      bold: false,
      italic: false,
    },
    {
      font: 'Pacifico',
      url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
      bold: false,
      italic: false,
    },
    {
      font: 'Comic Neue',
      url:
        'https://fonts.googleapis.com/css2?family=Comic+Neue:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      bold: true,
      italic: true,
    },
    {
      font: 'Roboto',
      url:
        'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap',
      bold: true,
      italic: true,
    },
  ];
  /**
   * Objeto tipo picker de color para el color de la sombra del texto
   */
  textShadowColor: Pickr;
  /**
   * Objeto tipo picker de color para el color del texto
   */
  textColor: Pickr;
  /**
   * Indice de la fuente actual en el textarea
   */
  currentIndex = 0;
  /**
   * Cadena que almacena la opción de texto seleccionada actualmente
   */
  currentOptions = 'texto';

  constructor() {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    this.changeTextAreaStyles();
    this.textValue = this.text.text;
    this.textCurved = this.text.type === 'text-curved';
    if (!this.textShadowColor || !this.textColor) { return null; }
    this.textShadowColor.setColor(this.text.shadow.color);
    this.textColor.setColor(this.text.fill);
  }

  ngAfterViewInit(): void {
    const fuentes = this.select.nativeElement.querySelectorAll('option');
    for (let i = 0; i < fuentes.length; i++) {
      fuentes[i].style.fontFamily = `'${this.fonts[i].font}'`;
    }

    const space = document.getElementById('links-fonts');
    // Recorre las fuentes y las agrega al elemento links-fonts como enlaces
    this.fonts.forEach(({ url }) => {
      if (!url) { return null; }
      const link = document.createElement('link');
      link.setAttribute('href', url);
      link.setAttribute('rel', 'stylesheet');
      space.appendChild(link);
    });
    // Crea color para el color del texto de tipo Pickr
    this.textColor = Pickr.create({
      el: '#text-color',
      theme: 'nano', // or 'monolith', or 'nano'
      default: this.text.fill,
      swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
      ],
      position: 'top-start',

      components: {
        // Main components
        preview: true,
        opacity: true,
        hue: true,

        // Input / output Options
        interaction: {
          input: true,
          hex: false,
          save: false,
        },
      },
    });
    // Crea color para el color de la sombra del texto de tipo Pickr
    this.textShadowColor = Pickr.create({
      el: '#text-shadow',
      theme: 'nano', // or 'monolith', or 'nano'
      default: this.text.shadow.color,
      swatches: [
        'rgba(244, 67, 54, 1)',
        'rgba(233, 30, 99, 0.95)',
        'rgba(156, 39, 176, 0.9)',
        'rgba(103, 58, 183, 0.85)',
      ],
      position: 'top-start',

      components: {
        // Main components
        preview: true,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
          input: true,
          hex: false,
          save: false,
        },
      },
    });
    // EventListener llamado cuando hay un cambio en el color del texto
    this.textColor.on('change', (color: any) => {
      this.textColor.setColor(color.toHEXA().toString());
      this.handleSetColor(color.toHEXA().toString());
    });
    // EventListener llamado cuando hay un cambio en el color de la sombra del texto
    this.textShadowColor.on('change', (color: any) => {
      this.textShadowColor.setColor(color.toHEXA().toString());
      this.onShadowColorChange(color.toHEXA().toString());
    });
  }
  /**
   * Decorador que declara evento cuando se cambia el tamaño de la ventana del navegador
   * para cambiar los estilos en el textarea
   */
  @HostListener('window:resize', ['$event'])
  onResize(): void {
    if (window.innerWidth < 960) {
      this.changeTextAreaStyles();
    } else {
      this.removeTextAreaStyle();
    }
  }
  /**
   * Función que cambia los estilos en el elemento textarea
   */
  changeTextAreaStyles = (): void => {
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.color = this.text.fill;
      this.textArea.nativeElement.style.fontSize = `${this.text.fontSize}px`;
      this.textArea.nativeElement.style.fontFamily = this.text.fontFamily;
      this.textArea.nativeElement.style.fontFamily = this.text.fontStyle;
      this.textArea.nativeElement.style.fontWeight = this.text.fontWeight;
      this.textArea.nativeElement.style.textShadow = `${this.text.shadow.color} ${this.text.shadow.offsetX}px ${this.text.shadow.offsetY}px ${this.text.shadow.blur}px`;
    }
  }
  /**
   * Función que elimina los estilos en el elemento textarea
   */
  removeTextAreaStyle = (): void => {
    this.textArea.nativeElement.removeAttribute('style');
  }
  /**
   * Función que maneja el invertido en el texto curveado
   * @param $event Indica si el texto curveado se invierte
   */
  handleFlip = ($event: any): void => {
    this.eventTextChanges.emit({
      flipped: $event.checked,
    });
  }
  /**
   * Función que emite el color en el texto del canvas
   */
  handleSetColor = (color: any): void => {
    this.eventTextChanges.emit({
      fill: color,
    });
  }
  /**
   * Función que detecta cuando se cambia la magnitud del texto curveado y emite ese valor
   * @param $event Contiene el valor de la magnitud del texto curveado
   */
  onCurveChange = ($event: any): void => {
    this.eventTextChanges.emit({
      diameter: $event.value,
    });
  }

  /**
   * Función que emite el texto cuando se realiza un cambio en su valor
   */
  onTextChange = ($event: any): void => {
    this.eventTextChanges.emit({
      text: this.textValue,
    });
  }
  /**
   * Función que detecta cuando hay un cambio de la fuente y asigna esa fuente
   * en el textarea y emite la fuente seleccionada al padre
   * @param $event Evento que contiene la fuente seleccionada
   */
  onFontFamilyChange = ($event: any): void => {
    for (let i = 0; i < this.fonts.length; i++) {
      if (`'${this.fonts[i].font}'` === $event.target.value) {
        this.currentIndex = i;
        break;
      }
    }
    this.eventTextChanges.emit({
      fontFamily: $event.target.value,
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.fontFamily = $event.target.value;
    }
  }
  /**
   * Función que detecta el cambio del interlineado en el texto y emite ese valor
   * @param $event Contiene el valor del interlineado
   */
  onKerningChange = ($event: number): void => {
    this.eventTextChanges.emit({
      pseudoCharSpacing: $event,
    });
  }
  /**
   * Función que detecta el cambio del tamaño de la fuente y emite ese valor
   * @param $event Contiene el valor del tamaño de la fuente
   */
  onFontSizeChange = ($event: number): void => {
    this.eventTextChanges.emit({
      fontSize: $event,
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.fontSize = `${$event}px`;
    }
  }
  /**
   * Función que detecta el cambio en el ancho del texto y emite ese valor
   * @param $event Contiene el valor del ancho del texto
   */
  onWidthChange = ($event: number): void => {
    this.eventTextChanges.emit({
      width: $event,
    });
  }
  /**
   * Función que detecta el cambio de texto de negrilla a normal
   * @param $event Indica si el texto es en negrilla
   */
  onWeightChange = ($event: any): void => {
    this.eventTextChanges.emit({
      fontWeight: this.bold ? 'bold' : 'normal',
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.fontWeight = this.bold
        ? 'bold'
        : 'normal';
    }
  }
  /**
   * Función que detecta el cambio de texto de cursiva a normal
   * @param $event Indica si el texto es en cursiva
   */
  onStyleChange = ($event: any): void => {
    this.eventTextChanges.emit({
      fontStyle: this.italic ? 'italic' : 'normal',
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.fontStyle = this.italic
        ? 'italic'
        : 'normal';
    }
  }
  /**
   * Función que emite la alineación seleccionada para el texto
   * @param $event Cadena que indica la alineación del texto
   */
  onAlignChange = ($event: string): void => {
    this.text.textAlign = $event;
    this.eventTextChanges.emit({
      textAlign: $event,
    });
  }
  /**
   * Función que detecta el cambio en el valor del offset en X de la sombra del texto
   * @param $event Contiene el valor del offset en X de la sombra en el texto
   */
  onOffsetXChange = ($event: any): void => {
    this.text.shadow.offsetX = $event;
    this.eventTextChanges.emit({
      shadow: {
        offsetX: $event,
        offsetY: this.text.shadow.offsetY,
        blur: this.text.shadow.blur,
        color: this.text.shadow.color,
      },
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.textShadow = `${this.text.shadow.color} ${$event}px ${this.text.shadow.offsetY}px ${this.text.shadow.blur}px`;
    }
  }
  /**
   * Función que detecta el cambio en el valor del offset en Y de la sombra del texto
   * @param $event Contiene el valor del offset en Y de la sombra en el texto
   */
  onOffsetYChange = ($event: any): void => {
    this.text.shadow.offsetY = $event;
    this.eventTextChanges.emit({
      shadow: {
        offsetY: $event,
        blur: this.text.shadow.blur,
        color: this.text.shadow.color,
        offsetX: this.text.shadow.offsetX,
      },
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.textShadow = `${this.text.shadow.color} ${this.text.shadow.offsetX}px ${$event}px ${this.text.shadow.blur}px`;
    }
  }
  /**
   * Función que detecta el cambio en el difuminado del texto y emite ese valor
   * @param $event Contiene el valor de difuminado del texto
   */
  onBlurChange = ($event: any): void => {
    this.text.shadow.blur = $event;
    this.eventTextChanges.emit({
      shadow: {
        blur: $event,
        color: this.text.shadow.color,
        offsetX: this.text.shadow.offsetX,
        offsetY: this.text.shadow.offsetY,
      },
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.textShadow = `${this.text.shadow.color} ${this.text.shadow.offsetX}px ${this.text.shadow.offsetY}px ${$event}px`;
    }
  }
  /**
   * Función que emite el color de la sombra del texto del canvas
   * @param $event Cadena con el color del texto del canvas
   */
  onShadowColorChange = ($event: string): void => {
    this.eventTextChanges.emit({
      shadow: {
        color: $event,
        blur: this.text.shadow.blur,
        offsetX: this.text.shadow.offsetX,
        offsetY: this.text.shadow.offsetY,
      },
    });
    if (window.innerWidth < 960) {
      this.textArea.nativeElement.style.textShadow = `${$event} ${this.text.shadow.offsetX}px ${this.text.shadow.offsetY}px ${this.text.shadow.blur}px`;
    }
  }
  /**
   * Función que maneja el cambio en el tipo de texto escogido y emite el tipo escogido
   * @param $event Indica si el texto es normal o curveado
   */
  handleTypeText = ($event: any): void => {
    this.eventTextChanges.emit({
      type: $event.checked ? 'text-curved' : 'textbox',
    });
  }
  /**
   * Función que detecta la opción de texto seleccionada y modifica la opción actual
   * @param $event Contiene la cadena con la opción de texto seleccionada en móvil
   */
  changeMobileOption = ($event: string): void => {
    if (this.currentOptions === $event) {
      this.currentOptions = '';
    } else {
      this.currentOptions = $event;
    }
  }
}
