module.exports = {
  async up(db, client) {
    return await db.collection('product_layouts_feeds')
      .updateMany(
        {
          $or: [
            {category: {$exists: true}},
            {category_parent: {$exists: true}},
          ]
        },
        {$unset: {'category': '', 'category_parent': ''}}
      );
  },

  async down(db, client) {
    return await db.collection('product_layouts_feeds')
      .updateMany(
        {
          $or: [
            {category: {$exists: false}},
            {category_parent: {$exists: false}},
          ]
        },
        {$set: {'category': '', 'category_parent': ''}}
      );
  }
};
