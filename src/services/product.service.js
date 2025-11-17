const Product = require('../models/product.model');

/**
 * Search products with filters, sorting and pagination.
 * Accepted filters: query (name), type (e.g., veg/non-veg), category, minPrice, maxPrice
 * Pagination: page, limit
 * Sorting: sortBy, order
 */
async function searchProducts(options = {}) {
    const {
        query,
        type,
        category,
        minPrice,
        maxPrice,
        page = 1,
        limit = 20,
        sortBy = 'price',
        order = 'asc',
    } = options;

    const filter = {};

    if (query) {
        // case-insensitive partial match on name
        filter.name = { $regex: query, $options: 'i' };
    }

    if (type) {
        // match exact type (case-insensitive)
        filter.type = { $regex: `^${type}$`, $options: 'i' };
    }

    if (category) {
        filter.category = { $regex: category, $options: 'i' };
    }

    if (minPrice != null || maxPrice != null) {
        filter.price = {};
        if (minPrice != null) filter.price.$gte = Number(minPrice);
        if (maxPrice != null) filter.price.$lte = Number(maxPrice);
    }

    const pg = Math.max(1, Number(page) || 1);
    const lim = Math.max(1, Number(limit) || 20);
    const skip = (pg - 1) * lim;

    const sort = {};
    sort[sortBy] = order === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
        Product.find(filter).sort(sort).skip(skip).limit(lim).exec(),
        Product.countDocuments(filter).exec(),
    ]);
    console.log("Products:", products);

    return {
        products,
        total,
        page: pg,
        limit: lim,
    };
}

module.exports = {
    searchProducts,
};

