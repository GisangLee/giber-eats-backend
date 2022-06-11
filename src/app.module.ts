import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from "joi";
import { Restaurant } from './restaurants/entities/restaurant.entity';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { UsersModule } from './users/users.module';
import { CommonModule } from './common/common.module';
import { User } from './users/entities/user.entity';

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
            })
        }),
        TypeOrmModule.forRoot({
            type: "postgres",
            host: process.env.DB_host,
            port: parseInt(process.env.DB_port),
            username: process.env.DB_username,
            password: process.env.DB_password,
            database: process.env.DB_database,
            entities: [User],
            synchronize: process.env.NODE_ENV !== "prod",
            logging: true
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: true
        }),
        UsersModule,
        CommonModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
