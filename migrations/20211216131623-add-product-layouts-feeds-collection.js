module.exports = {
  async up(db, client) {
    return await db.createCollection('product_layouts_feeds');
  },

  async down(db, client) {
    return await db.collection('product_layouts_feeds').drop();
  }
};
