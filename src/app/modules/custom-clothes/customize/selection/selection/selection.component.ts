import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.css']
})
export class SelectionComponent implements OnInit {
  /**
   * Emite la opción de personalización escogida en el editor
   */
  @Output() openOneEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }
  /**
   * Función que permite emitir la opción de personalización escogida
   * @param option Cadena con la opción escogida
   */
  sendOpenOne(option: string) {
    this.openOneEvent.emit(option);
  }

}
