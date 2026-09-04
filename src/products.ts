import {productData1} from './product-data-1';
import {productData2} from './product-data-2';
import {productData3} from './product-data-3';
import {productData4} from './product-data-4';
import {productData5} from './product-data-5';
import {productData6} from './product-data-6';
export type Product={id:number;name:string;category:string;price:string;moq:string;image:string;source:string;unlock:number;bigDeal?:boolean};
export const products:Product[]=[...productData1,...productData2,...productData3,...productData4,...productData5,...productData6];
