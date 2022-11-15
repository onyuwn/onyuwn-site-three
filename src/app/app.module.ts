import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainContentComponent } from './main-content/main-content.component';
import { CandleComponent } from './candle/candle.component';
import { MandlebrotComponent } from './mandlebrot/mandlebrot.component';

@NgModule({
  declarations: [
    AppComponent,
    MainContentComponent,
    CandleComponent,
    MandlebrotComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
