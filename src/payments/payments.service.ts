import { Cron } from '@nestjs/schedule';
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { GetPaymentsOutput } from './dto/get-payments.dto';
import { Restaurant } from './../restaurants/entities/restaurant.entity';
import { User } from './../users/entities/user.entity';
import { CreatePaymentInput, CreatePaymentOutput } from './dto/create-payment.dto';
import { LessThan, Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';


@Injectable()
export class PaymentService {
    constructor (
        @InjectRepository(Payment)
        private readonly payments: Repository<Payment>,

        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>



    ) {}

    async createPayment(owner: User, { transactionId, restaurantId }: CreatePaymentInput): Promise<CreatePaymentOutput> {
        try {

            const restaurant = await this.restaurants.findOne({ id: restaurantId, isDeleted: false });            

            if (!restaurant) {
                return {
                    ok: false,
                    error: "가게를 찾을 수 없습니다."
                };
            }

            if (restaurant.ownerId !== owner.id) {
                return {
                    ok: false,
                    error: "권한이 없습니다."
                };
            }

            await this.payments.save(this.payments.create({
                user: owner,
                transactionId,
                restaurant,
            }));

            const date = new Date();
            date.setDate(date.getDate() + 7);

            restaurant.isPromoted = true;
            restaurant.promotedUntil = date;

            await this.restaurants.save(restaurant);

            return {
                ok: true
            };

        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    async getPayments(owner: User): Promise<GetPaymentsOutput> {
        try {
            const payments = await this.payments.find({ user: owner });

            return {
                ok: true,
                payments
            };
            
        } catch (error) {
            return {
                ok: false,
                error
            };
        }
    }

    @Cron("0 50 23 * * *")
    async checkPromotedRestaurants() {
        try {
            const restaurants = await this.restaurants.find({ isPromoted: true, isDeleted: false, promotedUntil: LessThan(new Date())});

            restaurants.forEach(async restaurant => {
                restaurant.isPromoted = false;
                restaurant.promotedUntil = null;
                await this.restaurants.save(restaurant);
            });

        } catch (error) {
            
        }
    }
}