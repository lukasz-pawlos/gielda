export interface SellOfferRequest {
  stockId: number;
  userId: number;
  min_price: number;
  amount: number;
  date_limit: Date;
}
