/** Angular Imports */
import { Component, OnInit } from '@angular/core';

/** Environment Configuration */
import { environment } from 'environments/environment'; //This is not dynamic (don't use RuntimeConfigLoaderService) because the version doesn't change

/**
 *  Footer component.
 */
@Component({
  selector: 'mifosx-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  /** Mifos X version. */
  version: string = environment.version;

  constructor() { }

  ngOnInit() {
  }

}
