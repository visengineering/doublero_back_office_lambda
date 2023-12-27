module.exports = {
  async up(db, client) {
    return await db.collection('product_layouts_feeds').updateMany({preview_image: {$exists: true}}, {$unset: {'preview_image': ''}});
  },

  async down(db, client) {
    return await db.collection('product_layouts_feeds').updateMany({preview_image: {$exists: false}}, {$set: {'preview_image': ''}});
  }
};
