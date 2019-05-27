/** Angular Imports */
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

/** Environment Configuration */
import { RuntimeConfigLoaderService } from 'runtime-config-loader';

/** Custom Services */
import { Logger } from '../logger/logger.service';
import { AlertService } from '../alert/alert.service';

/** Initialize Logger */
const log = new Logger('ErrorHandlerInterceptor');

/**
 * Http Request interceptor to add a default error handler to requests.
 */
@Injectable()
export class ErrorHandlerInterceptor implements HttpInterceptor {
  private environment: RuntimeConfigLoaderService;

  /**
   * @param {AlertService} alertService Alert Service.
   */
  constructor(private __injector: Injector, 
              private alertService: AlertService) {  }

  /**
   * Intercepts a Http request and adds a default error handler.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(error => this.handleError(error)));
  }

  /**
   * Error handler.
   */
  private handleError(response: HttpErrorResponse): Observable<HttpEvent<any>> {
    if(this.environment === undefined) {
      this.environment = this.__injector.get(RuntimeConfigLoaderService);
    }

    const status = response.status;
    let errorMessage = (response.error.developerMessage || response.message);
    if (response.error.errors) {
      if (response.error.errors[0]) {
        errorMessage = response.error.errors[0].defaultUserMessage || response.error.errors[0].developerMessage;
      }
    }

    if (!this.environment.getConfigObjectKey('production')) {
      log.error(`Request Error: ${errorMessage}`);
    }

    if (status === 401 || (this.environment.getConfigObjectKey('oauth').enabled && status === 400)) {
      this.alertService.alert({ type: 'Authentication Error', message: 'Invalid User Details. Please try again!' });
    } else if (status === 403 && errorMessage === 'The provided one time token is invalid') {
      this.alertService.alert({ type: 'Invalid Token', message: 'Invalid Token. Please try again!' });
    } else if (status === 400) {
      this.alertService.alert({ type: 'Bad Request', message: 'Invalid parameters were passed in the request!' });
    } else if (status === 403) {
      this.alertService.alert({ type: 'Unauthorized Request', message: errorMessage || 'You are not authorized for this request!' });
    } else if (status === 404) {
      this.alertService.alert({ type: 'Resource does not exist', message: errorMessage || 'Resource does not exist!' });
    }  else if (status === 500) {
      this.alertService.alert({ type: 'Internal Server Error', message: 'Internal Server Error. Please try again later.' });
    } else {
      this.alertService.alert({ type: 'Unknown Error', message: 'Unknown Error. Please try again later.' });
    }

    throw response;
  }

}
