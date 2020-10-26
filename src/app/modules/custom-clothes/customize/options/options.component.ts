import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CurrentIndexes, TextCurved } from '../customize.component';

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  /**
   * Almacena la información del texto de fabric
   */
  @Input() text: TextCurved;
  /**
   * Emite la información del texto que ha sido cambiado
   */
  @Output() eventTextChanges = new EventEmitter<TextCurved>();
  /**
   * Indica si se ha realizado un cambio en los objetos del canvas desde el editor
   */
  @Output() eventShowMessage = new EventEmitter<boolean>();
  /**
   * Cadena con el nombre de la opción escogida en el editor
   */
  @Input() whatIsOpen: string;

  constructor() { }

  ngOnInit(): void {
  }
  /**
   * Función que detecta un cambio en el texto del canvas y emite el evento al padre
   * @param $event Contiene la información del texto modificado en el canvas
   */
  handleTextChanges = ($event: TextCurved) => {
    this.eventTextChanges.emit($event);
    this.setShowMessage();
  }
  /**
   * Función que emite el evento true de cambio realizado a un objeto en el canvas
   * y transcurrido un tiempo emite de nuevo el evento en falso
   */
  setShowMessage = () => {
    this.eventShowMessage.emit(true);
    setTimeout(() => {
      this.eventShowMessage.emit(false);
    }, 1500);
  }

}