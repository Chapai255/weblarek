import { IProduct } from '../../types';
import { IEvents } from "../base/Events";

export class Cart {
    private items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
        this.emitChanges();
    }

    removeItem(productId: string): void {
        const previousLength = this.items.length;
        this.items = this.items.filter(item => item.id !== productId);
        if (this.items.length !== previousLength) {
            this.emitChanges();
        }
    }

    clearCart(): void {
        this.items = [];
        this.emitChanges();
    }

    getTotalPrice(): number {
        return this.items.reduce((total, item) => {
            const price = item.price ?? 0;
            return total + price;
        }, 0);
    }

    getItemCount(): number {
        return this.items.length;
    }

    containsProduct(productId: string): boolean {
        return this.items.some(item => item.id === productId);
    }

    protected emitChanges(): void {
        this.events.emit("basket:changed");
    }
}