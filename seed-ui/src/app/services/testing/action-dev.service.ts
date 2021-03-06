import { Injectable, Inject, forwardRef } from "@angular/core";
import { Http, URLSearchParams, Response } from "@angular/http";
import { GlobalsService }     from "../../shared/globals.service";
import { AppAlertService }    from "../../shared/app-alert.service";
import { AppErrorHandler }    from "../../shared/appErrorHandler";


// Store the ActionDevService instance in a global because we can't inject ActionDevService in webPlatformStub
export let actionDevService: ActionDevService;

/**
 * Dev mode service to call action controllers
 */
@Injectable()
export class ActionDevService {

   constructor(private http: Http,
               private appAlertService: AppAlertService,
               private errorHandler: AppErrorHandler,
               @Inject(forwardRef(() => GlobalsService)) private gs: GlobalsService) {
      actionDevService = this;
   }

   /**
    * Dev implementation of callActionsController
    * @param url
    * @param jsonData
    * @param targets
    */
   public callActionsController(url: string, jsonData: string, targets: string): void {
      if (this.gs.useLiveData()) {
         // Post to the Java service rest endpoint when testing live data
         const headers = this.gs.getHttpHeaders();
         const data = new URLSearchParams();
         data.append("targets", targets);
         data.append("json", jsonData);

         this.http.post(url, data, headers)
               .toPromise()
               .then((response: Response) => {
                  return (url + " returned: " + response.text());
               })
               .catch(error => this.errorHandler.httpPromiseError(error))
               .then(msg => this.appAlertService.showInfo(msg ? msg : "no result"))
               .catch(errMsg => this.appAlertService.showError(errMsg));
      } else {
         // Just show that the action was called
         this.appAlertService.showInfo("URL: " + url + " called with json: " + jsonData);
      }
   }

}
