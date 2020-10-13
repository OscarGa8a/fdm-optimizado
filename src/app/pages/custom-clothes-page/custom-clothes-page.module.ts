import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomClothesPageRoutingModule } from './custom-clothes-page-routing.module';
import { CustomClothesPageComponent } from './custom-clothes-page.component';
import { CustomClothesModule } from '../../modules/custom-clothes/custom-clothes.module';


@NgModule({
  declarations: [CustomClothesPageComponent],
  imports: [
    CommonModule,
    CustomClothesPageRoutingModule,
    CustomClothesModule
  ]
})
export class CustomClothesPageModule { }
