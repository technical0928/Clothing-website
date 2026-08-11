const prisma = require('../utills/db');

async function searchProducts(request, response) {
    try {
        const rawQuery = request.query.query;
        if (!rawQuery) {
            return response.status(400).json({ error: "Query parameter is required" });
        }

        const query = String(rawQuery).trim();

        const products = await prisma.product.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { manufacturer: { contains: query, mode: 'insensitive' } },
                    { fabric: { contains: query, mode: 'insensitive' } },
                    { sizes: { contains: query, mode: 'insensitive' } },
                    { colors: { contains: query, mode: 'insensitive' } },
                    { category: { name: { contains: query, mode: 'insensitive' } } },
                ]
            },
            include: {
                category: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        return response.json(products);
    } catch (error) {
        console.error("Error searching products:", error);
        return response.status(500).json({ error: "Error searching products" });
    }
}

module.exports = { searchProducts };
