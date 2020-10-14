import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // url = 'https://grupocato.github.io/dataTestCDN/data.json';
  url = 'https://server-amazon.herokuapp.com/public/media/error-image-cdn/prueba/json/data.json';

  constructor(private http: HttpClient) {
  }

  getImagesAmazon() {
    return this.http.get(this.url)
                .pipe(
                  map(data => data[0].imagenes)
                );
  }

  getLinks() {
    return this.http.get(this.url)
                .pipe(
                  map(data => data[0].links)
                );
  }
}
