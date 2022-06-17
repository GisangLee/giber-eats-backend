import { JwtMiddleware } from './jwt/jwt.middleware';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from "joi";
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';
import { JwtModule } from './jwt/jwt.module';
import { AuthModule } from './auth/auth.module';
import { Verification } from './users/entities/verification.entity';
import { MailModule } from './mail/mail.module';

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
            })
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_host,
            port: parseInt(process.env.DB_port),
            username: process.env.DB_username,
            password: process.env.DB_password,
            database: process.env.DB_database,
            entities: [User, Verification],
            synchronize: process.env.NODE_ENV !== "prod",
            logging: true
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true,
            context: ({ req }) => ({ user : req["user"] }),
        }),
        JwtModule.forRoot({
            privateKey: process.env.SECRET_KEY
        }),
        MailModule.forRoot({
            apiKey: process.env.MAILGUN_API_KEY,
            domain: process.env.MAILGUN_DOMAIN_NAME,
            fromEmail: process.env.MAILGUN_FROM_EMAIL,
        }),
        UsersModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(JwtMiddleware).forRoutes({
            path: "/graphql",
            method: RequestMethod.POST,
        });
    }
}
