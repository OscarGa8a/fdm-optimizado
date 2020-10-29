import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
/**
 * Injectable que permite que otros componentes realicen comunicaciones con servidores
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  // url = 'https://grupocato.github.io/dataTestCDN/data.json';
  /**
   * Cadena con la url del servidor que contiene la información de los links
   */
  url = 'https://server-amazon.herokuapp.com/public/media/error-image-cdn/prueba/json/data.json';
  /**
   * Contructor del injectable
   * @param http Objeto que permite realizar solicitudes HTTP
   */
  constructor(private http: HttpClient) {}
  /**
   * Función que obtiene las url de las imágenes
   */
  getImagesAmazon() {
    return this.http.get(this.url)
                .pipe(
                  map(data => data[0].imagenes)
                );
  }
  /**
   * Función que obtiene la url del servidor y la url de la CDN
   */
  getLinks() {
    return this.http.get(this.url)
                .pipe(
                  map(data => data[0].links)
                );
  }
}
