import { IProduct } from '../../types/index';

export class Cart {
    private items: IProduct[] = [];

    getItems(): IProduct[] {
        return this.items;
    }

    addItem(product: IProduct): void {
        this.items.push(product);
    }

    removeItem(productId: string): void {
        this.items = this.items.filter(item => item.id !== productId);
    }

    clearCart(): void {
        this.items = [];
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
}