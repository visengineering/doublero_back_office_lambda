const handlersData = [
  {
    ShopifyId: "3932257189971",
    Handle: "layout-floating-horizontal",
  },
  {
    ShopifyId: "780963905627",
    Handle: "layout-1-horizontal-1",
  },
  {
    ShopifyId: "3932257255507",
    Handle: "layout-framed-panoramic-2",
  },
  {
    ShopifyId: "4704441008211",
    Handle: "layout-5-mix-wide-set",
  },
  {
    ShopifyId: "4704959201363",
    Handle: "layout-3-mix-set",
  },
  {
    ShopifyId: "4418232549459",
    Handle: "layout-3-bow-horizontal",
  },
  {
    ShopifyId: "4264546336851",
    Handle: "layout-4-vertical-wide",
  },
  {
    ShopifyId: "770584543323",
    Handle: "layout-3-vertical-new",
  },
  {
    ShopifyId: "4264545845331",
    Handle: "layout-framed-vertical-wide",
  },
  {
    ShopifyId: "6553376096339",
    Handle: "copy-of-layout-3-square",
  },
  {
    ShopifyId: "6612540751955",
    Handle: "layout-4-cross-set-1",
  },
  {
    ShopifyId: "6775635181651",
    Handle: "layout-wood-blocks",
  },
  {
    ShopifyId: "4418227142739",
    Handle: "layout-2-square",
  },
  {
    ShopifyId: "6926856847443",
    Handle: "master-3-horizontal-test",
  },
  {
    ShopifyId: "6760879325267",
    Handle: "layout-7-hexagon",
  },
  {
    ShopifyId: "10230043272",
    Handle: "layout-3-wine",
  },
  {
    ShopifyId: "10229950536",
    Handle: "layout-4-mess",
  },
  {
    ShopifyId: "192436797469",
    Handle: "layout-3-horizontal",
  },
  {
    ShopifyId: "10229929288",
    Handle: "layout-3-square",
  },
  {
    ShopifyId: "3932257222739",
    Handle: "layout-framed-panoramic-1",
  },
  {
    ShopifyId: "770591129691",
    Handle: "layout-5_star-new",
  },
  {
    ShopifyId: "395157831709",
    Handle: "layout-1-horizontal-vertical",
  },
  {
    ShopifyId: "392169947165",
    Handle: "layout-3-horizontal-vertical",
  },
  {
    ShopifyId: "772140957787",
    Handle: "layout-1_panoramic",
  },
  {
    ShopifyId: "6775651696723",
    Handle: "layout-wood-block-horizontal",
  },
  {
    ShopifyId: "6642773885011",
    Handle: "copy-of-layout-1-vertical-poster",
  },
  {
    ShopifyId: "4264546041939",
    Handle: "layout-floating-vertical-wide",
  },
  {
    ShopifyId: "2359511908435",
    Handle: "layout-4-square",
  },
  {
    ShopifyId: "770568912987",
    Handle: "layout-6-vertical",
  },
  {
    ShopifyId: "4704955072595",
    Handle: "layout-5-mix-wide-set-1",
  },
  {
    ShopifyId: "6775651500115",
    Handle: "layout-wood-block-vertical-wide",
  },
  {
    ShopifyId: "3932257157203",
    Handle: "layout-framed-horizontal",
  },
  {
    ShopifyId: "6553375506515",
    Handle: "layout-1-panoramic-vertical",
  },
  {
    ShopifyId: "4418228846675",
    Handle: "layout-2-vertical-wide",
  },
  {
    ShopifyId: "6775652057171",
    Handle: "layout-wood-block-vertical-super-horizontal",
  },
  {
    ShopifyId: "10230006536",
    Handle: "layout-4-horizontal",
  },
  {
    ShopifyId: "199930052637",
    Handle: "layout-1-square",
  },
  {
    ShopifyId: "4499305103443",
    Handle: "vertical-core",
  },
  {
    ShopifyId: "4704964018259",
    Handle: "layout-5-mix-set",
  },
  {
    ShopifyId: "10229998920",
    Handle: "layout-5-horizontal",
  },
  {
    ShopifyId: "6926857240659",
    Handle: "master-1-horizontal-test",
  },
  {
    ShopifyId: "10667440264",
    Handle: "layout-5-mess",
  },
  {
    ShopifyId: "4499325714515",
    Handle: "layout-core-horizontal",
  },
  {
    ShopifyId: "382724210717",
    Handle: "layout-6-horizontal",
  },
  {
    ShopifyId: "6643803717715",
    Handle: "layout-1-horizontal-poster",
  },
  {
    ShopifyId: "6648764530771",
    Handle: "layout-core-horizontal-poster",
  },
  {
    ShopifyId: "6644548829267",
    Handle: "layout-1-core-poster",
  },
  {
    ShopifyId: "770582610011",
    Handle: "layout-1-horizontal-new",
  },
  {
    ShopifyId: "6775651827795",
    Handle: "layout-wood-block-vertical-super-wide",
  },
];

module.exports = {
  async up(db, client) {
    const productsVariantsConfigsCollection = db.collection('products_variant_configs');
    const productsVariantsConfigs = await productsVariantsConfigsCollection.find({});

    for await (const productsVariantsConfig of productsVariantsConfigs) {
      const handleData = handlersData.find(x => x.ShopifyId == String(productsVariantsConfig.shopify_id || ""))
      
      if (handleData) {
        await productsVariantsConfigsCollection.updateOne({ _id: productsVariantsConfig._id }, { $set: { handle: handleData?.Handle } });
      }
    }
  },

  async down(db, client) {
  },
};
