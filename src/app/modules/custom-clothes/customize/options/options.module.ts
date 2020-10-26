import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptionsComponent } from './options.component';
import { TextComponent } from './text/text.component';
import { FormsModule } from '@angular/forms';
import { InputNumberComponent } from './input-number/input-number.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  declarations: [OptionsComponent, TextComponent, InputNumberComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatInputModule,
    MatSelectModule
  ],
  exports: [OptionsComponent]
})
export class OptionsModule { }
