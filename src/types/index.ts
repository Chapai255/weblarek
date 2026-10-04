import { categoryMap } from "../utils/constants";

export type CategoryKey = keyof typeof categoryMap;

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
export interface IOrderResult {
    id: string;
    total: number;
}

export interface IHeaderData {
    counter: number;
}

export interface IGalleryData {
    catalog: HTMLElement[];
}

export interface IModalData {
    content: HTMLElement;
}

export interface ICardData {
    title: string;
    price: number | null;
}

export interface ICatalogCardData extends ICardData {
    category: string;
    image: string;
}

export interface ICardActions {
    onClick?: (event: MouseEvent) => void;
}

export interface IPreviewCardData extends ICatalogCardData {
    description: string;
    buttonText: string;
    buttonDisabled: boolean;
}

export interface IBasketCardData extends ICardData {
    index: number;
}

export interface IBasketViewData {
    items: HTMLElement[];
    total: number;
    buttonDisabled: boolean;
}

export interface IFormState {
    valid: boolean;
    errors: string;
}

export interface IFormFieldChange<T> {
    field: keyof T;
    value: string;
}

export interface IOrderFormData {
    payment: TPayment | null;
    address: string;
}

export interface IContactsFormData {
    email: string;
    phone: string;
}

export interface ISuccessData {
    total: number;
}

export interface ISuccessActions {
    onClick?: (event: MouseEvent) => void;
}

export interface ICardEvent {
    id: string;
}