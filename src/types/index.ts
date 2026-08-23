export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    baseUrl: string;
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
    id: string;            // уникальный идентификатор товара
    description: string;   // подробное описание товара
    image: string;         // URL-адрес изображения товара
    title: string;         // название товара
    category: string;      // категория, к которой относится товар
    price: number | null;  // цена товара (null, если цена не указана)
}

export type TPayment = 'card' | 'cash';

export interface IBuyer {
    payment: TPayment | null;  // выбранный способ оплаты
    email: string;      // электронная почта покупателя
    phone: string;      // контактный телефон
    address: string;    // адрес доставки
}

export type TErrors = Partial<Record<keyof IBuyer, string>>;

//Для работы с сервером
export interface IProductsResponse {
    items: IProduct[];
    total: number;
}

// Данные для отправки заказа
export interface IOrderRequest extends IBuyer {
    total: number;
    items: string[];
}

// Ответ сервера после отправки заказа
export interface IOrderResponse {
    id: string;
    total: number;
}