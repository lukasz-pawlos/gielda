export interface BuyOfferRequest {
  companyId: number;
  userId: number;
  max_price: number;
  start_amount: number;
  date_limit: Date;
}
