import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Stock } from "./StockEntities";
import { BuyOffer } from "./BuyOfferEntitie";
import { SellOffer } from "./SellOfferEntitie";

@Entity("user")
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  surname: string;

  @Column({ nullable: false })
  username: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: false })
  email: string;

  @Column()
  money: number;

  @OneToMany(() => Stock, (stock) => stock.user)
  stocks: Stock[];

  @OneToMany(() => BuyOffer, (buyOffer) => buyOffer.user)
  buyOffers: BuyOffer[];

  @OneToMany(() => SellOffer, (sellOffer) => sellOffer.user)
  sellOffers: SellOffer[];
}
