import { Injectable } from "@angular/core";
import { DataproviderService } from "./dataprovider.service";
import { Http } from "@angular/http";
import { Observable } from "rxjs/internal/Observable";

@Injectable()
export class DoubleDataproviderService {
    private providerA: DataproviderService;
    private providerB: DataproviderService;

    constructor(private http: Http) {
        this.providerA = new DataproviderService(http);
        this.providerB = new DataproviderService(http);
    }

    public downloadDataSetA(name: string, version: string, position: string) {
        this.providerA.downloadDataSet(name, version, position, true);
    }
    public downloadDataSetB(name: string, version: string, position: string) {
        this.providerB.downloadDataSet(name, version, position, true);
    }

    public getDataSets(): Observable<any> {
        return this.providerA.getDataSets();
    }

    public getDataSetA(): Observable<any> {
        return this.providerA.getDataSet();
    }

    public getDataSetB(): Observable<any> {
        return this.providerB.getDataSet();
    }
};
