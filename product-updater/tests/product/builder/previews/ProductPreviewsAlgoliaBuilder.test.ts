import { deepStrictEqual } from 'assert';
import { TestHelper } from '../../../TestHelper';
import {
  ProductUpdate3dPreviewData,
  ProductUpdateCategorizationSubType,
  ProductUpdateLayoutData,
  ProductUpdatePreviewsSubType,
  ProductUpdateRoomPreviewData,
  ProductUpdateType,
  UpdateAction
} from '../../../../src/model/ProductUpdate';
import { NotAllowedError } from 'common-util/error/NotAllowedError';
import { AlgoliaProductLayoutsType } from '../../../../src/model/Algolia';
import { ProductPreviewsAlgoliaBuilder } from '../../../../src/service/product/builder/previews/ProductPreviewsAlgoliaBuilder';

describe('service/product/builder/name/ProductPreviewsAlgoliaBuilder', () => {

  const layoutsData: ProductUpdateLayoutData[] = [{
    short_layout: '1 Piece',
    layout: 'Layout 1 Horizontal',
    url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
    pieces: 1,
    shape: 'horizontal',
    type: 'Canvas',
    sizes: ['12" X 8"', '24" X 16"', '30" X 20"', '36" X 24"', '39" X 26"', '48" X 32"'],
    preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
    rooms: [{
      room_id: 'mb_living_room_12',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
      room_type: 'living room',
      styles: ['hipster'],
      colors: ['blue'],
      unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
    }, {
      room_id: 'mbg_hallway_10',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
      styles: [],
      colors: [],
      unique: []
    }, {
      room_id: 'nautical_dining_room_3',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
      room_type: 'dining room',
      styles: ['nautical'],
      colors: ['blue', 'brown', 'light blue'],
      unique: ['greenery', 'horizontal', 'vertical', 'wide angle']
    }, {
      room_id: 'mo_hallway_3',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
      room_type: 'hallway',
      styles: ['modern'],
      colors: ['brown', 'gray'],
      unique: ['horizontal', 'main zoom', 'vertical']
    }, {
      room_id: 'mpu_bedroom_1',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
      room_type: 'bedroom',
      styles: ['modern'],
      colors: ['blue', 'gray'],
      unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical']
    }],
    compare_at_price: 73.99,
    price: 29.95
  }, {
    short_layout: '5 Piece',
    layout: 'Layout 5 Mess',
    url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
    pieces: 5,
    shape: 'horizontal',
    type: 'Canvas',
    sizes: ['25" X 12"', '34" X 16"', '49" X 24"', '66" X 33"', '80" X 40"'],
    preview_3d: '',
    rooms: [{
      room_id: 'mb_living_room_6',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
      room_type: 'living room',
      styles: ['modern'],
      colors: ['blue'],
      unique: ['bold color', 'horizontal', 'main zoom']
    }, {
      room_id: 'mv_living_room_6',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
      room_type: 'living room',
      styles: ['scandinavian'],
      colors: ['gray', 'vanilla'],
      unique: ['festive', 'horizontal', 'lights', 'main zoom']
    }, {
      room_id: 'mo_dining_room_3',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
      room_type: 'dining room',
      styles: ['contemporary', 'modern'],
      colors: ['black', 'gray', 'orange'],
      unique: ['horizontal', 'main zoom']
    }, {
      room_id: 'zoom_84',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
      room_type: 'hallway',
      styles: ['modern'],
      colors: ['black', 'gray'],
      unique: ['close zoom', 'dark', 'horizontal']
    }, {
      room_id: 'mbro_bedroom_1a',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
      room_type: 'bedroom',
      styles: ['rustic'],
      colors: ['brown', 'gray', 'vanilla'],
      unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
    }],
    compare_at_price: 124.99,
    price: 49.95
  }, {
    short_layout: 'Framed Print',
    layout: 'Layout Framed Horizontal',
    url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
    pieces: 1,
    shape: 'horizontal',
    type: 'Framed Print',
    sizes: ['18" X 14"', '21" X 16"', '30" X 22"', '36" X 26"', '42" X 30"'],
    preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/9152caf9-9460-4815-b21c-434e2bb7ffa1/be-amazing-framed-wall-art-print.webp',
    rooms: [],
    compare_at_price: 218.99,
    price: 86.95
  }, {
    short_layout: 'Framed Canvas',
    layout: 'Layout Floating Horizontal',
    url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
    pieces: 1,
    shape: 'horizontal',
    type: 'Framed Canvas',
    sizes: ['19" X 13"', '25" X 17"', '31" X 21"', '43" X 29"', '49" X 33"'],
    preview_3d: '',
    rooms: [{
      room_id: 'mb_living_room_18',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
      room_type: 'living room',
      styles: ['modern', 'transitional'],
      colors: ['gray', 'light blue', 'vanilla'],
      unique: ['horizontal', 'main zoom', 'vertical']
    }, {
      room_id: 'mbg_living_room_27',
      image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
      styles: [],
      colors: [],
      unique: []
    }, {
      room_id: 'nautical_dining_room_4zoom',
      image_link: '',
      room_type: 'dining room',
      styles: ['nautical', 'traditional'],
      colors: ['blue', 'light blue', 'vanilla'],
      unique: ['horizontal', 'main zoom', 'vertical']
    }, {
      room_id: 'zoom_56',
      room_type: 'hallway',
      styles: ['modern'],
      colors: ['brown', 'gray'],
      unique: ['close zoom', 'horizontal', 'vertical']
    }, {
      room_id: 'nautical_bedroom_5',
      room_type: 'bedroom',
      styles: ['minimalist', 'nautical'],
      colors: ['blue', 'light blue'],
      unique: ['horizontal', 'main zoom']
    }],
    compare_at_price: 174.75,
    price: 69.75
  }];

  // incorrect data

  it(`buildUpdate for type: unsupported type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.categorization, {});
    const expression = () => {
      (new ProductPreviewsAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Product update with type=${ProductUpdateType.categorization} is not supported`);
  });

  it(`buildUpdate for type: unsupported sub-type`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdateCategorizationSubType.atmospheres, ProductUpdateType.previews, {});
    const expression = () => {
      (new ProductPreviewsAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(
      `Product update with type=${ProductUpdateType.previews} and sub type=${ProductUpdateCategorizationSubType.atmospheres} is not supported`
    );
  });

  // layouts

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.layouts}`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.layouts, ProductUpdateType.previews, layoutsData);

    const expected: AlgoliaProductLayoutsType = {
      layouts: [{
        name: '1 Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
        pieces: 1,
        shape: 'horizontal',
        type: 'Canvas',
        sizes: [
          { size: '12" X 8"' },
          { size: '24" X 16"' },
          { size: '30" X 20"' },
          { size: '36" X 24"' },
          { size: '39" X 26"' },
          { size: '48" X 32"' }],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
        room_previews: [{
          room_id: 'mb_living_room_12',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['hipster'],
          colors: ['blue'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }, {
          room_id: 'mbg_hallway_10',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }, {
          room_id: 'nautical_dining_room_3',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['nautical'],
          colors: ['blue', 'brown', 'light blue'],
          unique: ['greenery', 'horizontal', 'vertical', 'wide angle']
        }, {
          room_id: 'mo_hallway_3',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          room_id: 'mpu_bedroom_1',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['modern'],
          colors: ['blue', 'gray'],
          unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical']
        }],
      }, {
        name: '5 Mess',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
        pieces: 5,
        shape: 'horizontal',
        type: 'Multiple',
        sizes: [
          { size: '25" X 12"' },
          { size: '34" X 16"' },
          { size: '49" X 24"' },
          { size: '66" X 33"' },
          { size: '80" X 40"' }
        ],
        preview_3d: '',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
        room_previews: [{
          room_id: 'mb_living_room_6',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
          room_type: 'living room',
          styles: ['modern'],
          colors: ['blue'],
          unique: ['bold color', 'horizontal', 'main zoom']
        }, {
          room_id: 'mv_living_room_6',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['scandinavian'],
          colors: ['gray', 'vanilla'],
          unique: ['festive', 'horizontal', 'lights', 'main zoom']
        }, {
          room_id: 'mo_dining_room_3',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['contemporary', 'modern'],
          colors: ['black', 'gray', 'orange'],
          unique: ['horizontal', 'main zoom']
        }, {
          room_id: 'zoom_84',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['black', 'gray'],
          unique: ['close zoom', 'dark', 'horizontal']
        }, {
          room_id: 'mbro_bedroom_1a',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['rustic'],
          colors: ['brown', 'gray', 'vanilla'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }]
      }, {
        name: 'Framed Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Print',
        sizes: [
          { size: '18" X 14"' },
          { size: '21" X 16"' },
          { size: '30" X 22"' },
          { size: '36" X 26"' },
          { size: '42" X 30"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/9152caf9-9460-4815-b21c-434e2bb7ffa1/be-amazing-framed-wall-art-print.webp',
        preview_main: '',
        room_previews: []
      }, {
        name: 'Floating Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Canvas',
        sizes: [
          { size: '19" X 13"' },
          { size: '25" X 17"' },
          { size: '31" X 21"' },
          { size: '43" X 29"' },
          { size: '49" X 33"' }
        ],
        preview_3d: '',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
        room_previews: [{
          room_id: 'mb_living_room_18',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['modern', 'transitional'],
          colors: ['gray', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          room_id: 'mbg_living_room_27',
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }, {
          room_id: 'nautical_dining_room_4zoom',
          url: '',
          room_type: 'dining room',
          styles: ['nautical', 'traditional'],
          colors: ['blue', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          room_id: 'zoom_56',
          url: '',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['close zoom', 'horizontal', 'vertical']
        }, {
          room_id: 'nautical_bedroom_5',
          url: '',
          room_type: 'bedroom',
          styles: ['minimalist', 'nautical'],
          colors: ['blue', 'light blue'],
          unique: ['horizontal', 'main zoom']
        }]
      }]
    };
    const result = (new ProductPreviewsAlgoliaBuilder()).buildUpdate(update);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.layouts} (delete)`, () => {
    const update = TestHelper.prepareUpdate(
      ProductUpdatePreviewsSubType.layouts,
      ProductUpdateType.previews,
      layoutsData,
      UpdateAction.delete
    );

    const expression = () => {
      (new ProductPreviewsAlgoliaBuilder()).buildUpdate(update);
    };

    expect(expression).toThrow(NotAllowedError);
    expect(expression).toThrow(`Action ${UpdateAction.delete} is not supported for type '${ProductUpdateType.previews}' and subtype '${ProductUpdatePreviewsSubType.layouts}'`);
  });


  // previews_3d


  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.previews_3d}`, () => {
    const layout1HorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout 1 Horizontal',
      short_layout: '1 Piece',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
      cdn_upload_hash: '500488315cbcaa0396dceb913f655175f358ec6a09f072f460979e20574bf575'
    };
    const layout5MessData: ProductUpdate3dPreviewData = {
      layout: 'Layout 5 Mess',
      short_layout: '5 Piece',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-5-piece-wall-art.webp',
      cdn_upload_hash: '78d06dea777d9542aba0a6c38f56b07cd47315187cbafd6b0fd5d10148f4a757'
    };
    const layoutFramedHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Framed Horizontal',
      short_layout: 'Framed Print',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-framed-wall-art-print.webp',
      cdn_upload_hash: 'd1073221318f8fa77d31730f09de6ed47ecd84c8e6388ffc77287b59a26a5c75'
    };
    const layoutFloatingHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Floating Horizontal',
      short_layout: 'Framed Canvas',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/04505143-9078-418e-bb21-8d81fc616f68/be-amazing-framed-wall-art.webp',
      cdn_upload_hash: '265fbe1c8a1886e4e27ef9f147f985b827ecea03b86674c88d95c74abf10e906'
    };

    const updates = [
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.layouts, ProductUpdateType.previews, layoutsData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layout1HorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layout5MessData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFramedHorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFloatingHorizontalData),
    ];

    const expected: AlgoliaProductLayoutsType = {
      layouts: [{
        name: '1 Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
        pieces: 1,
        shape: 'horizontal',
        type: 'Canvas',
        sizes: [
          { size: '12" X 8"' },
          { size: '24" X 16"' },
          { size: '30" X 20"' },
          { size: '36" X 24"' },
          { size: '39" X 26"' },
          { size: '48" X 32"' }],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['hipster'],
          colors: ['blue'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['nautical'],
          colors: ['blue', 'brown', 'light blue'],
          unique: ['greenery', 'horizontal', 'vertical', 'wide angle']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['modern'],
          colors: ['blue', 'gray'],
          unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical']
        }],
      }, {
        name: '5 Mess',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
        pieces: 5,
        shape: 'horizontal',
        type: 'Multiple',
        sizes: [
          { size: '25" X 12"' },
          { size: '34" X 16"' },
          { size: '49" X 24"' },
          { size: '66" X 33"' },
          { size: '80" X 40"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-5-piece-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
          room_type: 'living room',
          styles: ['modern'],
          colors: ['blue'],
          unique: ['bold color', 'horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['scandinavian'],
          colors: ['gray', 'vanilla'],
          unique: ['festive', 'horizontal', 'lights', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['contemporary', 'modern'],
          colors: ['black', 'gray', 'orange'],
          unique: ['horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['black', 'gray'],
          unique: ['close zoom', 'dark', 'horizontal']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['rustic'],
          colors: ['brown', 'gray', 'vanilla'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }]
      }, {
        name: 'Framed Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Print',
        sizes: [
          { size: '18" X 14"' },
          { size: '21" X 16"' },
          { size: '30" X 22"' },
          { size: '36" X 26"' },
          { size: '42" X 30"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-framed-wall-art-print.webp',
        preview_main: '',
        room_previews: []
      }, {
        name: 'Floating Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Canvas',
        sizes: [
          { size: '19" X 13"' },
          { size: '25" X 17"' },
          { size: '31" X 21"' },
          { size: '43" X 29"' },
          { size: '49" X 33"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/04505143-9078-418e-bb21-8d81fc616f68/be-amazing-framed-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['modern', 'transitional'],
          colors: ['gray', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }]
      }]
    };
    const result = (new ProductPreviewsAlgoliaBuilder()).buildRelatedUpdates(updates);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.previews_3d} (partial data)`, () => {
    const layout5MessData: ProductUpdate3dPreviewData = {
      layout: 'Layout 5 Mess',
      short_layout: '5 Piece',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60718/be-amazing-5-piece-wall-art.webp',
      cdn_upload_hash: '78d06dea777d9542aba0a6c38f56b07cd47315187cbafd6b0fd5d10148f4a757'
    };
    const layoutFramedHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Framed Horizontal',
      short_layout: 'Framed Print',
      preview_3d: '',
      cdn_upload_hash: ''
    };
    const layoutFloatingHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Floating Horizontal',
      short_layout: 'Framed Canvas',
      preview_3d: '',
      cdn_upload_hash: ''
    };

    const updates = [
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.layouts, ProductUpdateType.previews, layoutsData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layout5MessData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFramedHorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFloatingHorizontalData),
    ];

    const expected: AlgoliaProductLayoutsType = {
      layouts: [{
        name: '1 Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
        pieces: 1,
        shape: 'horizontal',
        type: 'Canvas',
        sizes: [
          { size: '12" X 8"' },
          { size: '24" X 16"' },
          { size: '30" X 20"' },
          { size: '36" X 24"' },
          { size: '39" X 26"' },
          { size: '48" X 32"' }],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['hipster'],
          colors: ['blue'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['nautical'],
          colors: ['blue', 'brown', 'light blue'],
          unique: ['greenery', 'horizontal', 'vertical', 'wide angle']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['modern'],
          colors: ['blue', 'gray'],
          unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical']
        }],
      }, {
        name: '5 Mess',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
        pieces: 5,
        shape: 'horizontal',
        type: 'Multiple',
        sizes: [
          { size: '25" X 12"' },
          { size: '34" X 16"' },
          { size: '49" X 24"' },
          { size: '66" X 33"' },
          { size: '80" X 40"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60718/be-amazing-5-piece-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
          room_type: 'living room',
          styles: ['modern'],
          colors: ['blue'],
          unique: ['bold color', 'horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['scandinavian'],
          colors: ['gray', 'vanilla'],
          unique: ['festive', 'horizontal', 'lights', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['contemporary', 'modern'],
          colors: ['black', 'gray', 'orange'],
          unique: ['horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['black', 'gray'],
          unique: ['close zoom', 'dark', 'horizontal']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['rustic'],
          colors: ['brown', 'gray', 'vanilla'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }]
      }, {
        name: 'Framed Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Print',
        sizes: [
          { size: '18" X 14"' },
          { size: '21" X 16"' },
          { size: '30" X 22"' },
          { size: '36" X 26"' },
          { size: '42" X 30"' }
        ],
        preview_3d: '',
        preview_main: '',
        room_previews: []
      }, {
        name: 'Floating Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Canvas',
        sizes: [
          { size: '19" X 13"' },
          { size: '25" X 17"' },
          { size: '31" X 21"' },
          { size: '43" X 29"' },
          { size: '49" X 33"' }
        ],
        preview_3d: '',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['modern', 'transitional'],
          colors: ['gray', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }]
      }]
    };
    const result = (new ProductPreviewsAlgoliaBuilder()).buildRelatedUpdates(updates);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.previews_3d} (no layouts)`, () => {
    const layout5MessData: ProductUpdate3dPreviewData = {
      layout: 'Layout 5 Mess',
      short_layout: '5 Piece',
      preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-5-piece-wall-art.webp',
      cdn_upload_hash: '78d06dea777d9542aba0a6c38f56b07cd47315187cbafd6b0fd5d10148f4a757'
    };
    const layoutFramedHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Framed Horizontal',
      short_layout: 'Framed Print',
      preview_3d: '',
      cdn_upload_hash: ''
    };
    const layoutFloatingHorizontalData: ProductUpdate3dPreviewData = {
      layout: 'Layout Floating Horizontal',
      short_layout: 'Framed Canvas',
      preview_3d: '',
      cdn_upload_hash: ''
    };

    const updates = [
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layout5MessData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFramedHorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_3d, ProductUpdateType.previews, layoutFloatingHorizontalData),
    ];

    const expected = {};

    const result = (new ProductPreviewsAlgoliaBuilder()).buildRelatedUpdates(updates);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  // previews_room


  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.previews_room}`, () => {
    const layout1HorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout 1 Horizontal',
      rooms: [{
        room_id: 'mb_living_room_12',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mbg_hallway_10',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'nautical_dining_room_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mo_hallway_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mpu_bedroom_1',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }]
    };
    const layout5MessData: ProductUpdateRoomPreviewData = {
      layout: 'Layout 5 Mess',
      rooms: [{
        room_id: 'mb_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450'
      }, {
        room_id: 'mv_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449'
      }, {
        room_id: 'mo_dining_room_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449'
      }, {
        room_id: 'zoom_84',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449'
      }, {
        room_id: 'mbro_bedroom_1a',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449'
      }]
    };
    const layoutFramedHorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout Framed Horizontal',
      rooms: [{
        room_id: 'mb_living_room_7',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_7_40b2c362-4d9f-404a-a93e-dd8b8c810b0f.jpg?v=1625642449'
      }, {
        room_id: 'nautical_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_living_room_6_0c9faef2-1f6b-4dbe-8e1e-ebf1f936d66e.jpg?v=1625642449'
      }]
    };
    const layoutFloatingHorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout Floating Horizontal',
      rooms: [{
        room_id: 'mb_living_room_18',
        image_link: ''
      }, {
        room_id: 'mbg_living_room_27',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_4zoom_6f6d13d8-dec6-4aa2-b92b-5e350fea20fe.jpg'
      }, {
        room_id: 'zoom_56',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_56_a2cfaca0-eaff-486f-8fb8-d33e557ca142.jpg'
      }, {
        room_id: 'nautical_bedroom_5',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_bedroom_5_a4397a73-98d7-45cc-b1d4-d4c9874e1b66.jpg'
      }]
    };

    const updates = [
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.layouts, ProductUpdateType.previews, layoutsData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layout1HorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layout5MessData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layoutFramedHorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layoutFloatingHorizontalData),
    ];

    const expected: AlgoliaProductLayoutsType = {
      layouts: [{
        name: '1 Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
        pieces: 1,
        shape: 'horizontal',
        type: 'Canvas',
        sizes: [
          { size: '12" X 8"' },
          { size: '24" X 16"' },
          { size: '30" X 20"' },
          { size: '36" X 24"' },
          { size: '39" X 26"' },
          { size: '48" X 32"' }],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg',
          room_type: 'living room',
          styles: ['hipster'],
          colors: ['blue'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg',
          room_type: undefined,
          styles: [],
          colors: [],
          unique: []
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg',
          room_type: 'dining room',
          styles: ['nautical'],
          colors: ['blue', 'brown', 'light blue'],
          unique: ['greenery', 'horizontal', 'vertical', 'wide angle']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['horizontal', 'main zoom', 'vertical']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg',
          room_type: 'bedroom',
          styles: ['modern'],
          colors: ['blue', 'gray'],
          unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical']
        }],
      }, {
        name: '5 Mess',
        url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
        pieces: 5,
        shape: 'horizontal',
        type: 'Multiple',
        sizes: [
          { size: '25" X 12"' },
          { size: '34" X 16"' },
          { size: '49" X 24"' },
          { size: '66" X 33"' },
          { size: '80" X 40"' }
        ],
        preview_3d: '',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
        room_previews: [{
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
          room_type: 'living room',
          styles: ['modern'],
          colors: ['blue'],
          unique: ['bold color', 'horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['scandinavian'],
          colors: ['gray', 'vanilla'],
          unique: ['festive', 'horizontal', 'lights', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['contemporary', 'modern'],
          colors: ['black', 'gray', 'orange'],
          unique: ['horizontal', 'main zoom']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['black', 'gray'],
          unique: ['close zoom', 'dark', 'horizontal']
        }, {
          url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['rustic'],
          colors: ['brown', 'gray', 'vanilla'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical']
        }]
      }, {
        name: 'Framed Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Print',
        sizes: [
          { size: '18" X 14"' },
          { size: '21" X 16"' },
          { size: '30" X 22"' },
          { size: '36" X 26"' },
          { size: '42" X 30"' }
        ],
        preview_3d: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/9152caf9-9460-4815-b21c-434e2bb7ffa1/be-amazing-framed-wall-art-print.webp',
        preview_main: '',
        room_previews: []
      }, {
        name: 'Floating Horizontal',
        url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
        pieces: 1,
        shape: 'horizontal',
        type: 'Framed Canvas',
        sizes: [
          { size: '19" X 13"' },
          { size: '25" X 17"' },
          { size: '31" X 21"' },
          { size: '43" X 29"' },
          { size: '49" X 33"' }
        ],
        preview_3d: '',
        preview_main: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
        room_previews: [
          {
            url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_4zoom_6f6d13d8-dec6-4aa2-b92b-5e350fea20fe.jpg',
            room_type: undefined,
            styles: [],
            colors: [],
            unique: []
          }, {
            url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_56_a2cfaca0-eaff-486f-8fb8-d33e557ca142.jpg',
            room_type: 'hallway',
            styles: ['modern'],
            colors: ['brown', 'gray'],
            unique: ['close zoom', 'horizontal', 'vertical']
          }, {
            url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_bedroom_5_a4397a73-98d7-45cc-b1d4-d4c9874e1b66.jpg',
            room_type: 'bedroom',
            styles: ['minimalist', 'nautical'],
            colors: ['blue', 'light blue'],
            unique: ['horizontal', 'main zoom']
          }]
      }]
    };
    const result = (new ProductPreviewsAlgoliaBuilder()).buildRelatedUpdates(updates);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.previews_room} (no layouts)`, () => {
    const layout1HorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout 1 Horizontal',
      rooms: [{
        room_id: 'mb_living_room_12',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mbg_hallway_10',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'nautical_dining_room_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mo_hallway_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }, {
        room_id: 'mpu_bedroom_1',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_e85738f5-f617-4c4c-acb8-0c5abc7c73e2.jpg'
      }]
    };
    const layout5MessData: ProductUpdateRoomPreviewData = {
      layout: 'Layout 5 Mess',
      rooms: [{
        room_id: 'mb_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450'
      }, {
        room_id: 'mv_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449'
      }, {
        room_id: 'mo_dining_room_3',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449'
      }, {
        room_id: 'zoom_84',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449'
      }, {
        room_id: 'mbro_bedroom_1a',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449'
      }]
    };
    const layoutFramedHorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout Framed Horizontal',
      rooms: [{
        room_id: 'mb_living_room_7',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_7_40b2c362-4d9f-404a-a93e-dd8b8c810b0f.jpg?v=1625642449'
      }, {
        room_id: 'nautical_living_room_6',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_living_room_6_0c9faef2-1f6b-4dbe-8e1e-ebf1f936d66e.jpg?v=1625642449'
      }]
    };
    const layoutFloatingHorizontalData: ProductUpdateRoomPreviewData = {
      layout: 'Layout Floating Horizontal',
      rooms: [{
        room_id: 'mb_living_room_18',
        image_link: ''
      }, {
        room_id: 'mbg_living_room_27',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_4zoom_6f6d13d8-dec6-4aa2-b92b-5e350fea20fe.jpg'
      }, {
        room_id: 'zoom_56',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_56_a2cfaca0-eaff-486f-8fb8-d33e557ca142.jpg'
      }, {
        room_id: 'nautical_bedroom_5',
        image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_bedroom_5_a4397a73-98d7-45cc-b1d4-d4c9874e1b66.jpg'
      }]
    };

    const updates = [
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layout1HorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layout5MessData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layoutFramedHorizontalData),
      TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.previews_room, ProductUpdateType.previews, layoutFloatingHorizontalData),
    ];

    const expected = {};
    const result = (new ProductPreviewsAlgoliaBuilder()).buildRelatedUpdates(updates);

    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });
});
