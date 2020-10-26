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
import { ShapeComponent } from './shape/shape.component';
import { FeatherIconsModule } from '../../../../shared/components/feather-icons/feather-icons.module';

@NgModule({
  declarations: [OptionsComponent, TextComponent, InputNumberComponent, ShapeComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatSliderModule,
    MatInputModule,
    MatSelectModule,
    FeatherIconsModule
  ],
  exports: [OptionsComponent]
})
export class OptionsModule { }
