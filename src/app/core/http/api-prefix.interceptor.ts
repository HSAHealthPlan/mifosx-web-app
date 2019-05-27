/** Angular Imports */
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Environment Configuration */
import { RuntimeConfigLoaderService } from 'runtime-config-loader';

/**
 * Http request interceptor to prefix a request with configured `serverUrl`.
 */
@Injectable()
export class ApiPrefixInterceptor implements HttpInterceptor {
  private runtimeConfig: RuntimeConfigLoaderService;

  constructor(private __injector: Injector) { }
  /**
   * Intercepts a Http request and prefixes it with configured `serverUrl`.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.runtimeConfig === undefined) {
      this.runtimeConfig = this.__injector.get(RuntimeConfigLoaderService);
    }

    request = request.clone({ url: this.runtimeConfig.getConfigObjectKey('serverUrl') + request.url });
    return next.handle(request);
  }
}
