module.exports = {
  async up(db, client) {
    return await db.collection('product_layouts_feeds').createIndex({ sku: 1, layout: 1 });
  },

  async down(db, client) {
    return await db.collection('product_layouts_feeds').dropIndexes({ sku: 1, layout: 1 });
  }
};
