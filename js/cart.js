// Массив товаров, которые можно добавить в корзину
const products = [
  { id: 1, name: "Body Brush", price: 29.99, image: "images/image1.png" },
  {
    id: 2,
    name: "Eco Soap",
    price: 19.99,
    image: "images/image2.png",
    multipliers: [
      { displayName: "50 g", value: 1 },
      { displayName: "90 g", value: 2 },
    ],
  },
  { id: 3, name: "Товар 3", price: 300, image: "images/image3.png" },
];

// Инициализация корзины
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let quantities = {
  1: 1,
  2: 1,
  3: 1,
};

// Обновление бейджа на всех страницах
function updateCartBadge() {
  const cartBadge = document.getElementById("cart-badge");
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartBadge.textContent = totalItems > 0 ? totalItems : ""; // Скрыть бейдж, если корзина пуста
}

// Вызов функции для обновления бейджа при загрузке страницы
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  updateCartIconShift();
});

// Добавление товара в корзину
function addToCart(id, price, multiplier) {
  const uniqueId = `${id}-${multiplier}`;
  const existingItem = cart.find((item) => item.uniqueId === uniqueId);
  const quantity = quantities[id];

  if (existingItem) {
    existingItem.quantity += quantity; // Увеличиваем количество существующего товара
  } else {
    cart.push({
      uniqueId: uniqueId, // Уникальный идентификатор
      id: id,
      price: (price * multiplier).toFixed(2),
      quantity: quantity,
      multiplier,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  updateCartIconShift();

  // Сбрасываем количество товара после добавления в корзину
  quantities[id] = 1;
  document.getElementById(`quantity-${id}`).textContent = quantities[id]; // Обновляем отображение количества
  updatePrice(id); // Обновляем итоговую цену
}

// Увеличение количества товара на главной странице
function increaseQuantity(id) {
  quantities[id]++;
  document.getElementById(`quantity-${id}`).textContent = quantities[id];
  updatePrice(id); // Обновляем итоговую цену
  updateCartIconShift();
}

// Уменьшение количества товара на главной странице
function decreaseQuantity(id) {
  if (quantities[id] > 1) {
    quantities[id]--;
    document.getElementById(`quantity-${id}`).textContent = quantities[id];
    updatePrice(id); // Обновляем итоговую цену
    updateCartIconShift();
  }
}

// Увеличение количества товара в корзине
function increaseCartQuantity(uniqueId) {
  const cartItem = cart.find((item) => item.uniqueId === uniqueId);
  if (cartItem) {
    cartItem.quantity++;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    displayCartItems();
    updateCartIconShift();
  }
}

// Уменьшение количества товара в корзине
function decreaseCartQuantity(uniqueId) {
  const cartItem = cart.find((item) => item.uniqueId === uniqueId);
  if (cartItem && cartItem.quantity > 1) {
    cartItem.quantity--;
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();
    displayCartItems();
    updateCartIconShift();
  }
}

// Удаление товара из корзины
function removeCartItem(uniqueId) {
  cart = cart.filter((item) => item.uniqueId !== uniqueId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  displayCartItems();
  updateCartIconShift();
}

// Обновление итоговой цены товара на главной странице
function updatePrice(id) {
  const basePrice = parseFloat(
    document
      .querySelector(`.product button[data-id="${id}"]`)
      .getAttribute("data-price")
  );
  const multiplier = getMultiplier(id);
  const totalPrice = (basePrice * multiplier * quantities[id]).toFixed(2);
  document.getElementById(`total-price-${id}`).textContent = `${totalPrice} €`;
}

// Получение множителя для каждого товара
function getMultiplier(id) {
  const multiplierInputs = document.querySelectorAll(
    `input[name="multiplier-${id}"]`
  );
  for (const input of multiplierInputs) {
    if (input.checked) {
      return parseFloat(input.value);
    }
  }
  return 1;
}

// Обновление отображаемой начальной цены при выборе множителя
function updateDisplayedPrice(id) {
  const basePrice = products.find((p) => p.id === id).price;
  const multiplier = getMultiplier(id);
  const newPrice = (basePrice * multiplier).toFixed(2);
  document.getElementById(`base-price-${id}`).textContent = `${newPrice} €`;

  // Сбрасываем количество товара в 1 при смене множителя
  quantities[id] = 1;
  document.getElementById(`quantity-${id}`).textContent = quantities[id];
  updatePrice(id);
}

// newaddon
// Обновление корзины и смещение иконки
function updateCartIconShift() {
  const cartIconWrapper = document.querySelector(".cart-icon-wrapper");

  if (cart.length > 0) {
    // Если корзина не пуста
    if (cartIconWrapper) {
      cartIconWrapper.classList.add("shifted"); // Добавляем класс
    }
  } else {
    // Если корзина пуста
    if (cartIconWrapper) {
      cartIconWrapper.classList.remove("shifted"); // Убираем класс
    }
  }
}
// Отображение товаров в корзине
function displayCartItems() {
  const cartItemsContainer = document.getElementById("cart-items");
  const cartTotalContainer = document.getElementById("cart-total");

  cartItemsContainer.innerHTML = ""; // Очищаем контейнер
  cartTotalContainer.innerHTML = ""; // Также очищаем общую сумму

  // Если корзина пустая, можно добавить сообщение об этом
  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart-message">Cart is empty</p>';
    return; // Завершаем выполнение функции, если корзина пуста
  }

  let total = 0;

  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id); // Получаем информацию о продукте
    const itemTotal = (item.price * item.quantity).toFixed(2);
    total += parseFloat(itemTotal); // Корректное сложение

    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item");

    // Создаем контейнер для изображения
    const imageContainer = document.createElement("div");
    imageContainer.classList.add("cart-item-image-container");
    imageContainer.innerHTML = `
      <img src="${product.image}" alt="${product.name}" class="cart-item-image">
    `;

    // Создаем контейнер для информации
    const infoContainer = document.createElement("div");
    infoContainer.classList.add("cart-item-info");
    const multiplierDisplayName = product.multipliers
      ? product.multipliers.find((m) => m.value === item.multiplier).displayName
      : "";

    infoContainer.innerHTML = `
      <div class="product-name-wrap">
        <span class="product-name">${product.name}</span>
        <span class="product-name-weight">${multiplierDisplayName}</span>
      </div>
      <div class="cart-item-actions">
        <button class="cart-remove-button" onclick="removeCartItem('${item.uniqueId}')">Remove</button>
        <span class="cart-button-wrapper">
          <button class="cart-calc-button" onclick="decreaseCartQuantity('${item.uniqueId}')">-</button>
          <span class="cart-calc-quantity">${item.quantity}</span>
          <button class="cart-calc-button" onclick="increaseCartQuantity('${item.uniqueId}')">+</button>
        </span>
        
        <span class="cart-calc-quantity-subtotal">Subtotal</span>
        <span class="cart-calc-quantity">${itemTotal} €</span>
      </div>
    `;

    // Добавляем элементы на страницу
    itemElement.appendChild(imageContainer);
    itemElement.appendChild(infoContainer);
    cartItemsContainer.appendChild(itemElement);
  });

  // Создаем общий контейнер для итоговой суммы и кнопки оформления заказа
  const subtotalTotalContainer = document.createElement("div");
  subtotalTotalContainer.classList.add("subtotal-total-container");

  // Текст вверху контейнера
  const subtotalText = document.createElement("div");
  subtotalText.classList.add("subtotal-text"); // Класс для стилизации текста
  subtotalText.textContent = "Order Summary"; // Сам текст
  // Добавляем текст в контейнер
  subtotalTotalContainer.appendChild(subtotalText);

  // Итог (Total)
  const totalDiv = document.createElement("div");
  totalDiv.classList.add("total-container", "total-display"); // Добавляем два класса: total-container и total-display
  totalDiv.innerHTML = `<span>Total </span><span>${total.toFixed(2)} €</span>`;

  // Добавляем итоговую сумму в общий контейнер
  subtotalTotalContainer.appendChild(totalDiv);
  // Ссылка под итоговой суммой
  const linkElement = document.createElement("a");
  linkElement.classList.add("subtotal-link"); // Класс для стилизации ссылки
  linkElement.href = "#"; // Ссылка
  linkElement.textContent = "Promo Code and Gift Card"; // Текст ссылки

  // Добавляем ссылку под итоговую сумму
  subtotalTotalContainer.appendChild(linkElement);
  // Создаем контейнер для кнопки
  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("checkout-button-container"); // Класс для кнопки

  const checkoutButton = document.createElement("button");
  checkoutButton.classList.add("checkout-button");
  checkoutButton.textContent = "Checkout";
  checkoutButton.addEventListener("click", handleCheckout);

  // Добавляем кнопку в контейнер
  buttonContainer.appendChild(checkoutButton);

  // Текст над иконками
  const iconText = document.createElement("span");
  iconText.classList.add("icon-text"); // Класс для текста над иконками
  iconText.textContent = "We accept"; // Текст, который будет отображаться над иконками

  // Иконки под кнопкой
  const iconContainer = document.createElement("div");
  iconContainer.classList.add("icon-container"); // Класс для иконок
  iconContainer.innerHTML = `
  <i class="fa fa-visa"><img
                class="payment-icon"
                src="payment_images/visa.png"
                alt="visa"
              /></i>
  <i class="fa fa-maestro">
              <img
                class="payment-icon"
                src="payment_images/maestro.png"
                alt="maestro"
              />
            </i>
  <i class="fa fa-master"><img
                class="payment-icon"
                src="payment_images/master.png"
                alt="master"
              /></i>
  <i class="fa fa-paypal"><img
                class="payment-icon"
                src="payment_images/paypal.png"
                alt="paypal"
              /></i>
`; // Иконки (замените на нужные)

  // Добавляем текст над иконками и иконки в контейнер
  buttonContainer.appendChild(iconText);
  buttonContainer.appendChild(iconContainer);

  // Добавляем общий контейнер и кнопку в контейнер для общей суммы
  cartTotalContainer.appendChild(subtotalTotalContainer);
  cartTotalContainer.appendChild(buttonContainer);
}

// Очистка корзины
function clearCart() {
  cart = [];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartBadge();
  displayCartItems();
  updateCartIconShift();
}

// Обработка оформления заказа
function handleCheckout() {
  // Здесь можно добавить логику оформления заказа
  alert("PAYMENT COMPLETED");
  clearCart(); // Очищаем корзину после оформления заказа
}

// Инициализация отображения товаров в корзине при загрузке
document.addEventListener("DOMContentLoaded", () => {
  displayCartItems();
});

// События на главной странице
if (document.querySelector(".products")) {
  document.querySelectorAll(".button").forEach((button) => {
    button.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      const price = parseFloat(this.getAttribute("data-price")); // Используем parseFloat
      const multiplier = getMultiplier(id);
      if (quantities[id] > 0) {
        // Проверка на 0 или отрицательное значение
        addToCart(id, price, multiplier);
      } else {
        alert("Количество товара не может быть 0 или отрицательным.");
      }
    });
  });

  // Инициализация бейджа и цен при загрузке
  updateCartBadge();
  products.forEach((product) => {
    updatePrice(product.id); // Обновляем итоговые цены
  });
}
