export const formatPrice = (price: string | number | null | undefined): string => {
    if (price === null || price === undefined) {
        return "";
    }

    const num = typeof price === 'string' ? parseFloat(price) : price;

    if (isNaN(num)) {
        return "";
    }

    const formattedPrice = num.toLocaleString('uk-UA', {
        maximumFractionDigits: 0,
        useGrouping: true,
    });

    return formattedPrice;
};