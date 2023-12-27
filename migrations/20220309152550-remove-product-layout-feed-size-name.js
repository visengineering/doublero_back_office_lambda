module.exports = {
  async up(db, client) {
    return await db.collection('product_layouts_feeds')
      .updateMany(
        {
          size_name: {
            $exists: true
          }
        },
        {
          $unset: {'size_name': ''}
        }
      );
  },

  async down(db, client) {
    return await db.collection('product_layouts_feeds')
      .updateMany(
        {
          size_name: {
            $exists: false
          }
        },
        {
          $set: {'size_name': ''}
        }
      );
  }
};
