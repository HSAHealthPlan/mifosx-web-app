/** Angular Imports */
import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Environment Configuration */
import { RuntimeConfigLoaderService } from 'runtime-config-loader';

/** Authorization header. */
const authorizationHeader = 'Authorization';
const tenantId = 'Fineract-Platform-TenantId';
/** Two factor access token header. */
const twoFactorAccessTokenHeader = 'Fineract-Platform-TFA-Token';

/**
 * Http Request interceptor to set the request headers.
 */
@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
  /** Http request options headers. */
  private httpOptions: any;

  constructor(private __injector: Injector, private environment: RuntimeConfigLoaderService) {
    this.httpOptions = {
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    };
  }

  /**
   * Intercepts a Http request and sets the request headers.
   */
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if(this.environment === undefined) {
      this.environment = this.__injector.get(RuntimeConfigLoaderService);
    }

    if(this.environment.getConfigObjectKey('fineractPlatformTenantId')) {
      this.httpOptions.headers[tenantId] = this.environment.getConfigObjectKey('fineractPlatformTenantId');
    }

    request = request.clone({ setHeaders: this.httpOptions.headers });
    return next.handle(request);
  }

  /**
   * Sets the basic/oauth authorization header depending on the configuration.
   * @param {string} authenticationKey Authentication key.
   */
  setAuthorizationToken(authenticationKey: string) {
    if (this.environment.getConfigObjectKey('oauth').enabled) {
      this.httpOptions.headers[authorizationHeader] = `Bearer ${authenticationKey}`;
    } else {
      this.httpOptions.headers[authorizationHeader] = `Basic ${authenticationKey}`;
    }
  }

  /**
   * Sets the two factor access token header.
   * @param {string} twoFactorAccessToken Two factor access token.
   */
  setTwoFactorAccessToken(twoFactorAccessToken: string) {
    this.httpOptions.headers[twoFactorAccessTokenHeader] = twoFactorAccessToken;
  }

  /**
   * Removes the authorization header.
   */
  removeAuthorization() {
    delete this.httpOptions.headers[authorizationHeader];
  }

  /**
   * Removes the two factor access token header.
   */
  removeTwoFactorAuthorization() {
    delete this.httpOptions.headers[twoFactorAccessTokenHeader];
  }

}
