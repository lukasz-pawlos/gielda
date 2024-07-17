export interface SellOfferRequest {
  stockId: number;
  userId: number;
  min_price: number;
  start_amount: number;
  date_limit: Date;
}
