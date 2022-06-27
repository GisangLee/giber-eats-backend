import { ScheduleModule } from '@nestjs/schedule';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from "joi";
import { Payment } from './payments/entities/payment.entity';
import { CommonModule } from './common/common.module';
import { OrderItem } from './orders/entities/order-item.entity';
import { Order } from './orders/entities/order.entity';
import { Dish } from './restaurants/entities/dish.entity.';
import { Category } from './restaurants/entities/category.entity';
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { UploadsModule } from './uploads/uploads.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: process.env.NODE_ENV === "dev" ? ".env.dev" : ".env.test",
            ignoreEnvFile: process.env.NODE_ENV === "prod",
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid("dev", "prod", "test").required(),
                DB_host: Joi.string().required(),
                DB_port: Joi.string().required(),
                DB_username: Joi.string().required(),
                DB_password: Joi.string().required(),
                DB_database: Joi.string().required(),
                SECRET_KEY: Joi.string().required(),
                MAILGUN_API_KEY: Joi.string().required(),
                MAILGUN_DOMAIN_NAME: Joi.string().required(),
                MAILGUN_FROM_EMAIL: Joi.string().required(),
                accessKeyId: Joi.string().required(),
                secretAccessKey: Joi.string().required(),
                bucketName: Joi.string().required(),
            })
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_host,
            port: parseInt(process.env.DB_port),
            username: process.env.DB_username,
            password: process.env.DB_password,
            database: process.env.DB_database,
            entities: [User, Verification, Restaurant, Category, Dish, Order, OrderItem, Payment],
            synchronize: process.env.NODE_ENV !== "prod",
            logging: true
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            subscriptions: {
                'subscriptions-transport-ws': {
                    onConnect: (connectionParams) => {
                        const authToken = connectionParams['X-JWT'];

                        if (!authToken) {
                            throw new Error('Token is not valid');
                        }

                        const token = authToken;

                        return { token };
                    }
                }
            },
            driver: ApolloDriver,
            autoSchemaFile: true,
            context: ({ req, connection}) => {
                if (req){
                    return { token: req.headers['x-jwt'] };
                }else{
                    return { token: connection.context['X-JWT'] };
                }
            },
        }),
        ScheduleModule.forRoot(),
        JwtModule.forRoot({
            privateKey: process.env.SECRET_KEY
        }),
        MailModule.forRoot({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN_NAME,
            fromEmail: process.env.MAILGUN_FROM_EMAIL,
        }),
        AuthModule,
        UsersModule,
        RestaurantsModule,
        OrdersModule,
        CommonModule,
        PaymentsModule,
        UploadsModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
