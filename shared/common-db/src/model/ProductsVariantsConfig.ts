export interface ProductVariantsConfigChild {
    framed_canvas: string;
    framed_print: string;
}

export interface ProductVariantsConfigValue {
    title: string;
    price: string;
    compare_at_price: string;
    position: number;
    inventory_policy: string;
    fulfillment_service: string;
    option1?: string;
    option2?: string;
    option3?: string;
    taxable: boolean;
    barcode?: string;
    grams: number;
    weight: number;
    weight_unit: string;
    requires_shipping: boolean;
}

export interface ProductsVariantsConfig {
    tags: string[];
    children: ProductVariantsConfigChild[];
    parent?: string;
    handle?: string;
    type: string;
    status: string;
    shopify_id: number;
    key: string;
    value: ProductVariantsConfigValue[]
}