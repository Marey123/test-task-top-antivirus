document.addEventListener("DOMContentLoaded", async () => {
    initializeBrowserArrowClass();

    const productsContainer = document.getElementById('product-container');

    try {
        const response = await fetch('https://veryfast.io/t/front_test_api.php');
        if (!response.ok) {
            throw new Error('error');
        }
        const data = await response.json();
        
        const products = data.result.elements;

        if (products && products.length > 0) {
            const productsHtml = products.map(product => {
                const { amount, license_name, name_prod, price_key, is_best, link } = product;
                const billingCycle = determineBillingCycle(license_name);
                const originalPrice = computeOriginalPrice(amount, price_key);
                const discountedHtml = hasDiscount(price_key) ? `<strike class="discounted-price font-roboto">$${originalPrice}</strike>` : '';
                const discountImgClass = hasDiscount(price_key) ? 'discount-img' : '';

                return `
                    <div class="product-plan-item">
                        <div class="product-plan-price font-bebas ${discountImgClass}">
                            ${is_best ? '<span class="best-value font-roboto">Best Value</span>' : ''}
                            <h3>${amount}<span class="font-bold">/${billingCycle}</span>${discountedHtml}</h3>
                        </div>
                        <div class="product-plan-content">
                            <div class="product-plan-name font-roboto">
                                <h2>${name_prod}</h2>
                                <b>${license_name}</b>
                            </div>
                            <div class="centered">
                                <a href="${link}" download class="product-plan-button font-roboto">
                                    Download
                                </a>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            productsContainer.innerHTML = productsHtml;

            productsContainer.addEventListener('click', event => {
                if (event.target.tagName === 'A' && event.target.hasAttribute('download')) {
                    setTimeout(displayDownloadInfoMessage, 1500);
                }
            });
        } else {
            productsContainer.innerHTML = 'Nothing found.';
        }
    } catch (error) {
        productsContainer.innerHTML = 'Sorry, we encountered an error while fetching the data. Please try again later.';
    }
});


const displayDownloadInfoMessage = () => {
    const downloadInfoElement = document.getElementById('download');
    downloadInfoElement.classList.add('active');
    downloadInfoElement.classList.remove('hidden');
};

const determineBillingCycle = licenseType => {
    const lowerCaseLicenseType = licenseType.toLowerCase();
    if (lowerCaseLicenseType.includes('monthly')) {
        return 'mo';
    } else if (lowerCaseLicenseType.includes('year')) {
        return 'per year';
    } else {
        return '';
    }
};

const hasDiscount = discountKey => discountKey.includes('%');

const computeOriginalPrice = (currentPrice, discountKey) => {
    if (hasDiscount(discountKey)) {
        const discountPercentage = parseFloat(discountKey) / 100;
        const originalPrice = parseFloat(currentPrice) / (1 - discountPercentage);
        return originalPrice.toFixed(2);
    }
    return currentPrice;
};

const initializeBrowserArrowClass = () => {
    let arrowClassName = '';

    switch (true) {
        case isMicrosoftEdge():
            arrowClassName = 'arrow-edge';
            break;
        case isGoogleChrome():
            arrowClassName = 'arrow-chrome';
            break;
        case isMozillaFirefox():
            arrowClassName = 'arrow-firefox';
            break;
        default:
            break;
    }

    appendArrowClass(arrowClassName);
};

const appendArrowClass = arrowClassName => {
    const arrowElement = document.querySelector('.downloaded-info-arrow');
    arrowElement.classList.add(arrowClassName);
};

const isGoogleChrome = () => /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
const isMozillaFirefox = () => typeof InstallTrigger !== 'undefined';
const isMicrosoftEdge = () => /Edg/.test(navigator.userAgent);