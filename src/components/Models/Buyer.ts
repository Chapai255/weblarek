import type { IBuyer, TPayment, TErrors } from '../../types';
import { IEvents } from "../base/Events";

export class Buyer {
    private payment: TPayment | null = null;
    private email: string = '';
    private phone: string = '';
    private address: string = '';

    constructor(protected events: IEvents) {}

    setBuyerData(data: Partial<IBuyer>): void {
        Object.assign(this, data);
        this.events.emit("buyer:changed");
    }

    getBuyerData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address,
        };
    }

    clearBuyerData(): void {
        this.payment = null;
        this.email = '';
        this.phone = '';
        this.address = '';
        this.events.emit("buyer:changed");
    }

    validate(): TErrors {
        const errors: TErrors = {};

        if (this.payment === null) {
            errors.payment = 'Не выбран вид оплаты';
        }
        if (!this.email || this.email.trim() === '') {
            errors.email = 'Укажите email';
        }
        if (!this.phone || this.phone.trim() === '') {
            errors.phone = 'Укажите телефон';
        }
        if (!this.address || this.address.trim() === '') {
            errors.address = 'Укажите адрес';
        }

        return errors;
    }
}

