import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.component.html',
  styleUrls: ['./selection.component.css']
})
export class SelectionComponent implements OnInit {

  @Output() openOneEvent = new EventEmitter<string>();

  constructor() { }

  ngOnInit(): void {
  }

  sendOpenOne(option: string) {
    this.openOneEvent.emit(option);
  }

}
