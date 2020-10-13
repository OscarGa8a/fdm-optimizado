import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomClothesPageComponent } from './custom-clothes-page.component';

const routes: Routes = [
  {
    path: '',
    component: CustomClothesPageComponent
  },
  {
    path: ':id',
    component: CustomClothesPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CustomClothesPageRoutingModule { }
