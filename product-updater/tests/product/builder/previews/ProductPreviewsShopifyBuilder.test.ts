import { deepStrictEqual } from 'assert';
import { TestHelper } from '../../../TestHelper';
import { ProductUpdateLayoutData, ProductUpdatePreviewsSubType, ProductUpdateType } from '../../../../src/model/ProductUpdate';
import { ProductPreviewsShopifyBuilder } from '../../../../src/service/product/builder/previews/ProductPreviewsShopifyBuilder';
import { ProductLayoutMapUpdateData } from '../../../../src/model/Shopify';

describe('service/product/builder/name/ProductPreviewsShopifyBuilder', () => {
  const layoutsData: ProductUpdateLayoutData[] = [
    {
      short_layout: '1 Piece',
      layout: 'Layout 1 Horizontal',
      url: '/products/be-amazing-multi-panel-canvas?variant=21231151382611',
      pieces: 1,
      shape: 'horizontal',
      type: 'Canvas',
      sizes: ['12" X 8"', '24" X 16"', '30" X 20"', '36" X 24"', '39" X 26"', '48" X 32"'],
      preview_3d:
        'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
      rooms: [
        {
          room_id: 'mb_living_room_12',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['hipster'],
          colors: ['blue'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical'],
        },
        {
          room_id: 'mbg_hallway_10',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
          styles: [],
          colors: [],
          unique: [],
        },
        {
          room_id: 'nautical_dining_room_3',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['nautical'],
          colors: ['blue', 'brown', 'light blue'],
          unique: ['greenery', 'horizontal', 'vertical', 'wide angle'],
        },
        {
          room_id: 'mo_hallway_3',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['horizontal', 'main zoom', 'vertical'],
        },
        {
          room_id: 'mpu_bedroom_1',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['modern'],
          colors: ['blue', 'gray'],
          unique: ['bold color', 'greenery', 'horizontal', 'main zoom', 'vertical'],
        },
      ],
      compare_at_price: 73.99,
      price: 29.95,
    },
    {
      short_layout: '5 Piece',
      layout: 'Layout 5 Mess',
      url: '/products/be-amazing-multi-panel-canvas?variant=21231151218771',
      pieces: 5,
      shape: 'horizontal',
      type: 'Canvas',
      sizes: ['25" X 12"', '34" X 16"', '49" X 24"', '66" X 33"', '80" X 40"'],
      preview_3d: '',
      rooms: [
        {
          room_id: 'mb_living_room_6',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
          room_type: 'living room',
          styles: ['modern'],
          colors: ['blue'],
          unique: ['bold color', 'horizontal', 'main zoom'],
        },
        {
          room_id: 'mv_living_room_6',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['scandinavian'],
          colors: ['gray', 'vanilla'],
          unique: ['festive', 'horizontal', 'lights', 'main zoom'],
        },
        {
          room_id: 'mo_dining_room_3',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
          room_type: 'dining room',
          styles: ['contemporary', 'modern'],
          colors: ['black', 'gray', 'orange'],
          unique: ['horizontal', 'main zoom'],
        },
        {
          room_id: 'zoom_84',
          image_link: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['black', 'gray'],
          unique: ['close zoom', 'dark', 'horizontal'],
        },
        {
          room_id: 'mbro_bedroom_1a',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
          room_type: 'bedroom',
          styles: ['rustic'],
          colors: ['brown', 'gray', 'vanilla'],
          unique: ['greenery', 'horizontal', 'main zoom', 'vertical'],
        },
      ],
      compare_at_price: 124.99,
      price: 49.95,
    },
    {
      short_layout: 'Framed Print',
      layout: 'Layout Framed Horizontal',
      url: '/products/be-amazing-multi-panel-canvas?variant=31348384497747',
      pieces: 1,
      shape: 'horizontal',
      type: 'Framed Print',
      sizes: ['18" X 14"', '21" X 16"', '30" X 22"', '36" X 26"', '42" X 30"'],
      preview_3d:
        'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/9152caf9-9460-4815-b21c-434e2bb7ffa1/be-amazing-framed-wall-art-print.webp',
      rooms: [],
      compare_at_price: 218.99,
      price: 86.95,
    },
    {
      short_layout: 'Framed Canvas',
      layout: 'Layout Floating Horizontal',
      url: '/products/be-amazing-multi-panel-canvas?variant=31348384268371',
      pieces: 1,
      shape: 'horizontal',
      type: 'Framed Canvas',
      sizes: ['19" X 13"', '25" X 17"', '31" X 21"', '43" X 29"', '49" X 33"'],
      preview_3d: '',
      rooms: [
        {
          room_id: 'mb_living_room_18',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
          room_type: 'living room',
          styles: ['modern', 'transitional'],
          colors: ['gray', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical'],
        },
        {
          room_id: 'mbg_living_room_27',
          image_link:
            'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
          styles: [],
          colors: [],
          unique: [],
        },
        {
          room_id: 'nautical_dining_room_4zoom',
          image_link: '',
          room_type: 'dining room',
          styles: ['nautical', 'traditional'],
          colors: ['blue', 'light blue', 'vanilla'],
          unique: ['horizontal', 'main zoom', 'vertical'],
        },
        {
          room_id: 'zoom_56',
          room_type: 'hallway',
          styles: ['modern'],
          colors: ['brown', 'gray'],
          unique: ['close zoom', 'horizontal', 'vertical'],
        },
        {
          room_id: 'nautical_bedroom_5',
          room_type: 'bedroom',
          styles: ['minimalist', 'nautical'],
          colors: ['blue', 'light blue'],
          unique: ['horizontal', 'main zoom'],
        },
      ],
      compare_at_price: 174.75,
      price: 69.75,
    },
  ];

  // layouts

  it(`buildUpdate for type: ${ProductUpdatePreviewsSubType.layouts}`, () => {
    const update = TestHelper.prepareUpdate(ProductUpdatePreviewsSubType.layouts, ProductUpdateType.previews, layoutsData);
    const expected: ProductLayoutMapUpdateData = {
      '1 Piece': {
        master_name: 'Layout 1 Horizontal',
        master_handle: undefined,
        shape: 'horizontal',
        previews: {
          '3d': {
            auto: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/0f6b18b9-9d4d-4a9b-aa6a-89a7deb60716/be-amazing-wall-art.webp',
          },
          rooms: [
            {
              room: 'living room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_12_a4c257ef-0035-425e-9de8-90225cc07b96.jpg?v=1625642449',
            },
            {
              room: undefined,
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_hallway_10_97dcad9c-42ab-4b21-97f4-231a3f2fd281.jpg?v=1625642449',
            },
            {
              room: 'dining room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/nautical_dining_room_3_c594f8d8-d5b9-4db6-bc6f-03b6cafda894.jpg?v=1625642449',
            },
            {
              room: 'hallway',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_hallway_3_41c9fb2b-0461-4157-9abe-fa0812102eb7.jpg?v=1625642449',
            },
            {
              room: 'bedroom',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mpu_bedroom_1_12bef348-a7ad-45e7-8af0-a40518ff7698.jpg?v=1625642449',
            },
          ],
        },
      },
      '5 Piece': {
        master_name: 'Layout 5 Mess',
        master_handle: undefined,
        shape: 'horizontal',
        previews: {
          '3d': { auto: '' },
          rooms: [
            {
              room: 'living room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_6_fcf945fb-bc72-47ab-ac0b-925ee8befc93.jpg?v=1625642450',
            },
            {
              room: 'living room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mv_living_room_6_0d88fe98-d98c-4235-9a17-052ce0753b42.jpg?v=1625642449',
            },
            {
              room: 'dining room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mo_dining_room_3_95237152-8f42-440e-b013-9b9720f0953c.jpg?v=1625642449',
            },
            {
              room: 'hallway',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/zoom_84_7e6ad6b3-3321-42cc-b25b-38852a2d3b85.jpg?v=1625642449',
            },
            {
              room: 'bedroom',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbro_bedroom_1a_6ab858fc-0685-4417-8ae7-18984e6dec9d.jpg?v=1625642449',
            },
          ],
        },
      },
      'Framed Canvas': {
        master_name: 'Layout Floating Horizontal',
        master_handle: undefined,
        shape: 'horizontal',
        previews: {
          '3d': { auto: '' },
          rooms: [
            {
              room: 'living room',
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mb_living_room_18_82d89cc1-d47e-4384-9e76-bfb25d96eff4.jpg?v=1625642449',
            },
            {
              room: undefined,
              url: 'https://cdn.shopify.com/s/files/1/1568/8443/products/mbg_living_room_27_a7899221-e29d-49e8-9e88-2483fe0b3179.jpg?v=1625642449',
            },
            { room: 'dining room', url: '' },
            { room: 'hallway', url: undefined },
            { room: 'bedroom', url: undefined },
          ],
        },
      },
      'Framed Print': {
        master_name: 'Layout Framed Horizontal',
        master_handle: undefined,
        shape: 'horizontal',
        previews: {
          '3d': {
            auto: 'https://images.dev.elephantstock.net/products/mz6-es-25u/previews/3d/9152caf9-9460-4815-b21c-434e2bb7ffa1/be-amazing-framed-wall-art-print.webp',
          },
          rooms: [],
        },
      },
    };

    const result = new ProductPreviewsShopifyBuilder().buildUpdate(12345, update);
    deepStrictEqual(result, expected, 'Prepared update object is incorrect');
  });
});
