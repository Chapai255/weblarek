import { API_URL } from './utils/constants';
import './scss/styles.scss';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import {ProductCatalog} from "./components/Models/ProductCatalog.ts";
import { apiProducts } from './utils/data';
import { Api } from './components/base/Api';
import { ApiService } from './components/Services/ApiService';


const productsModel = new ProductCatalog();
const cart = new Cart();
const buyer = new Buyer();

const apiClient = new Api(API_URL);
const apiService = new ApiService(apiClient);

//Тест ProductCatalog

productsModel.setProducts(apiProducts.items);
console.log('Товары сохранены в каталоге');

const allProducts = productsModel.getProducts();
console.log(`Получено товаров: ${allProducts.length}`);

const firstProduct = allProducts[0];
if (firstProduct) {
    console.log(`Найден товар: "${firstProduct.title}" (ID: ${firstProduct.id})`);
    productsModel.setSelectedProduct(firstProduct);
    const selected = productsModel.getSelectedProduct();
    console.log(`Выбранный товар: "${selected?.title}"`);
} else {
    console.error('Не удалось найти ни одного товара в каталоге');
}

// Тест Cart

//Добавляем первый товар в корзину
if (firstProduct) {
    cart.addItem(firstProduct);
    console.log('Первый товар добавлен в корзину');

    //Добавляем второй товар в корзину
    if (allProducts.length > 1) {
        const secondProduct = allProducts[1];
        cart.addItem(secondProduct);
        console.log('Второй товар добавлен в корзину');
    }
}

//Проверяем методы общей стоимости и общего кол-ва товаров
console.log(`Количество товаров в корзине: ${cart.getItemCount()}`);
console.log(`Общая стоимость: ${cart.getTotalPrice()} руб.`);

//Проверяем наличие товаров с реальным ИД
if (firstProduct) {
    console.log(`Товар с ID "${firstProduct.id}" в корзине: ${cart.containsProduct(firstProduct.id)}`);
}
if (allProducts.length > 1) {
    const secondProductId = allProducts[1].id;
    console.log(`Товар с ID "${secondProductId}" в корзине: ${cart.containsProduct(secondProductId)}`);
    console.log(`Товар с несуществующим ID "999" в корзине: ${cart.containsProduct('999')}`);
}

//Проверяем удаление одного товара
if (firstProduct) {
    cart.removeItem(firstProduct.id);
    console.log(`После удаления товара с ID "${firstProduct.id}": ${cart.getItemCount()} товаров`);
}

// Очищаем корзину
cart.clearCart();
console.log(`Корзина очищена. Текущее количество: ${cart.getItemCount()}`);


//Тестирование Buyer
//Доустанавливаем данные
buyer.setBuyerData({
    payment: 'cash',
    email: 'test@example.com',
    phone: '+79990000000',
    address: 'ул. Примерная, 1'
});
console.log('Данные покупателя установлены');

//Получаем данные
const buyerData = buyer.getBuyerData();
console.log('Текущие данные покупателя:', buyerData);

// Проверяем валидацию
const validationErrors = buyer.validate();
if (Object.keys(validationErrors).length === 0) {
    console.log('Валидация пройдена успешно (нет ошибок)');
} else {
    console.error('Ошибки валидации:', validationErrors);
}

// Тестируем валидацию с неполными данными
buyer.clearBuyerData();
buyer.setBuyerData({ email: 'test@example.com' });
const partialValidation = buyer.validate();
console.log('Неполные данные');
console.log(partialValidation);

//Полная очистка
buyer.clearBuyerData();
console.log('Данные покупателя очищены');

async function loadProductsFromServer() {
    try {
        const productsResponse = await apiService.getProducts();
        console.log('Данные с сервера получены успешно');

        // Сохраняем массив товаров в модель каталога
        productsModel.setProducts(productsResponse.items);
        console.log(`В каталог сохранено ${productsResponse.items.length} товаров`);

        // Выводим сохранённый каталог в консоль для проверки
        console.log('Каталог товаров');
        console.log(productsModel.getProducts());
    } catch (error) {
        console.error('Ошибка при запросе данных с сервера:', error);
    } finally {
        console.log('Все операции завершены');
    }
}

// Запускаем асинхронную функцию
loadProductsFromServer();