import {IApi} from '../../types';
import { IProductsResponse, IOrderRequest, IOrderResult } from '../../types';

export class ApiService {
    private api: IApi;

    constructor(api: IApi) {
        this.api = api;
    }

    getProducts(): Promise<IProductsResponse> {
        return this.api.get<IProductsResponse>('/product/');
    }

    postOrder(orderData: IOrderRequest): Promise<IOrderResult> {
        return this.api.post<IOrderResult>('/order/', orderData);
    }
}