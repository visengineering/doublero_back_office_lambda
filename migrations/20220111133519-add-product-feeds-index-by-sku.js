module.exports = {
  async up(db, client) {
    return await db.collection('product_feeds')
      .createIndex(
        {
          sku: 1
        },
        {
          unique: true
        })
  },

  async down(db, client) {
    return await db.collection('product_feeds').dropIndex({ sku: 1 });
  }
};
