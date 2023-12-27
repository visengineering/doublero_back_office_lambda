export interface PrintData {
  layout_name: string;
  raw_image_data: {
    height: number;
    width: number;
    y: number;
    x: number;
  };
}

export interface ProductPrint {
  prints: PrintData[];
}
