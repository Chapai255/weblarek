import { API_URL, CDN_URL } from './utils/constants';
import './scss/styles.scss';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import {ProductCatalog} from "./components/Models/ProductCatalog.ts";
import { Api } from './components/base/Api';
import { ApiService } from './components/Services/ApiService';
import { EventEmitter } from "./components/base/Events";
import { Gallery } from "./components/View/gallery";
import { ensureElement, cloneTemplate } from "./utils/utils";
import { CatalogCard } from "./components/View/catalogCard";
import { Modal } from "./components/View/modals";
import { PreviewCard } from "./components/View/previewCard";
import {
    ICardEvent,
    IFormFieldChange,
    IOrderFormData,
    IContactsFormData,
    TPayment,
    IOrderRequest,
    IProductsResponse,
} from "./types";
import { Header } from "./components/View/header";
import { BasketView } from "./components/View/basketView";
import { BasketCard } from "./components/View/basketCard";
import { OrderForm } from "./components/View/orderForm";
import { ContactsForm } from "./components/View/contactsForm";
import { Success } from "./components/View/success";

const events = new EventEmitter();

const catalog = new ProductCatalog(events);
const cart = new Cart(events);
const buyer = new Buyer(events);

const apiClient = new Api(API_URL, {
    headers: {
        "Content-Type": "application/json",
    },
});;
const apiService = new ApiService(apiClient);

//Основные view
const header = new Header(events, ensureElement<HTMLElement>(".header"));
const gallery = new Gallery(ensureElement<HTMLElement>(".gallery"));
const modal = new Modal(events, ensureElement<HTMLElement>("#modal-container"));

//Template
const catalogCardTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const previewCardTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const basketCardTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");


//Реализация элементов страницы
//Подробная карточка
const previewCard = new PreviewCard(
    events,
    cloneTemplate<HTMLElement>(previewCardTemplate),
);

//Корзина
const basketView = new BasketView(
    events,
    cloneTemplate<HTMLElement>(basketTemplate),
);

//Форма оплаты
const orderForm = new OrderForm(
    events,
    cloneTemplate<HTMLFormElement>(orderTemplate),
);

//Форма с контактами
const contactsForm = new ContactsForm(
    events,
    cloneTemplate<HTMLFormElement>(contactsTemplate),
);

//Окно успешного заказа
const success = new Success(cloneTemplate<HTMLElement>(successTemplate), {
    onClick: () => {
        events.emit('success:close');
    },
});

//Реализация событий на странице
//Обработчик успешности заказа
events.on('success:close', () => {
    modal.close();
});

//Отображение содержимого корзины
const onBasketChanged = (): void => {
    const items = cart.getItems().map((product, index) => {
        const card = new BasketCard(
            cloneTemplate<HTMLElement>(basketCardTemplate),
            {
                onClick: () => {
                    events.emit<ICardEvent>("basket:delete", {
                        id: product.id,
                    });
                },
            },
        );

        return card.render({
            index: index + 1,
            title: product.title,
            price: product.price,
        });
    });

    basketView.render({
        items,
        total: cart.getTotalPrice(),
    });

    header.render({
        counter: cart.getItemCount(),
    });
};

//Изменение каталога
events.on("catalog:changed", () => {
    const products = catalog.getProducts();

    const cards = products.map((product) => {
        const card = new CatalogCard(
            cloneTemplate<HTMLElement>(catalogCardTemplate),
            {
                onClick: () => {
                    events.emit<ICardEvent>("card:select", {
                        id: product.id,
                    });
                },
            },
        );

        return card.render({
            title: product.title,
            price: product.price,
            category: product.category,
            image: product.image,
        });
    });

    gallery.render({
        catalog: cards,
    });
});

//Выбор карточки
events.on<ICardEvent>("card:select", ({ id }) => {
    const product = catalog.getProductById(id);
    if (!product) {
        return;
    }
    catalog.setSelectedProduct(product);
});

events.on("preview:changed", () => {
    const product = catalog.getSelectedProduct();
    if (!product) {
        return;
    }

    const isSelected = cart.containsProduct(product.id);
    const isUnavailable = product.price === null;

    const buttonText = isUnavailable
        ? "Недоступно"
        : isSelected
            ? "Удалить из корзины"
            : "В корзину";


    const previewContent = previewCard.render({
        title: product.title,
        price: product.price,
        category: product.category,
        image: product.image,
        description: product.description,
        buttonText,
        buttonDisabled: isUnavailable,
    });

    modal.render({
        content: previewContent,
    });

    modal.open();
});

//События внутри карточки
events.on("card:action", () => {
    const product = catalog. getSelectedProduct();
    if (!product || product.price === null) {
        return;
    }

    if (cart.containsProduct(product.id)) {
        cart.removeItem(product.id);
    } else {
        cart.addItem(product);
    }

    modal.close();
});

//Удаление товара
events.on<ICardEvent>("basket:delete", ({ id }) => {
    cart.removeItem(id);
});

//Открытие корзины
events.on("basket:open", () => {
    modal.render({
        content: basketView.render(),
    });
    modal.open();
});

//Изменение содержимого корзины
events.on("basket:changed", () => {
    onBasketChanged();
});

//Открытие формы заказа
events.on("order:open", () => {
    modal.render({
        content: orderForm.render(),
    });
    modal.open();
});

//Изменение способа оплаты
events.on<IFormFieldChange<IOrderFormData>>(
    "order.payment:change",
    ({ value }) => {
        buyer.setBuyerData({
            payment: value as TPayment,
        });
    },
);

//Изменение адреса
events.on<IFormFieldChange<IOrderFormData>>(
    "order.address:change",
    ({ value }) => {
        buyer.setBuyerData({
            address: value,
        });
    },
);

//Изменение данных покупателя
events.on("buyer:changed", () => {
    const data = buyer.getBuyerData();
    const errors = buyer.validate();

    const orderErrors = [errors.payment, errors.address]
        .filter(Boolean)
        .join("; ");

    const contactsErrors = [errors.email, errors.phone]
        .filter(Boolean)
        .join("; ");

    orderForm.render({
        payment: data.payment,
        address: data.address,
        valid: !errors.payment && !errors.address,
        errors: orderErrors,
    });

    contactsForm.render({
        email: data.email,
        phone: data.phone,
        valid: !errors.email && !errors.phone,
        errors: contactsErrors,
    });
});

//Открытие формы контактов
events.on("order:submit", () => {
    modal.render({
        content: contactsForm.render(),
    });
});

//Изменение эл. почты
events.on<IFormFieldChange<IContactsFormData>>(
    "contacts.email:change",
    ({ value }) => {
        buyer. setBuyerData({
            email: value,
        });
    },
);

//Изменение телефона
events.on<IFormFieldChange<IContactsFormData>>(
    "contacts.phone:change",
    ({ value }) => {
        buyer.setBuyerData({
            phone: value,
        });
    },
);

//Отправка формы контактов
events.on("contacts:submit", () => {
    const buyerData = buyer.getBuyerData();

    const order: IOrderRequest = {
        payment: buyerData.payment,
        address: buyerData.address,
        email: buyerData.email,
        phone: buyerData.phone,
        total: cart.getTotalPrice(),
        items: cart.getItems().map((product) => product.id),
    };

    apiService
        .postOrder(order)
        .then((result) => {
            const successContent = success.render({
                total: (result as { total: number }).total,
            });

            modal.render({
                content: successContent,
            });

            cart.clearCart();
            buyer.clearBuyerData();
        })
        .catch((error) => {
            console.error("Ошибка оформления заказа:", error);
        });
});

//Закрытие модалки
events.on("modal:close", () => {
    modal.close();
});

//Обнуление интерфейса
cart.clearCart();
buyer.clearBuyerData()

//Получение остатка товаров
apiService
    .getProducts()
    .then((response: IProductsResponse) => {
        const productsWithFullImage = response.items.map((product) => ({
            ...product,
            image: `${CDN_URL}${product.image}`
        }));

        catalog.setProducts(productsWithFullImage);
        console.log(`Каталог обновлён: ${productsWithFullImage.length} товаров`);
    })
    .catch((error) => {
        console.error("Ошибка загрузки каталога:", error);
    });