import { JwtModuleOptions } from './jwt.interfaces';
import { DynamicModule, Global, Module } from '@nestjs/common';
import { JwtService } from './jwt.service';
import { CONFIG_OPTIONS } from 'src/common/common.constants';

@Module({})
@Global()
export class JwtModule {

    static forRoot(options: JwtModuleOptions): DynamicModule {
        return {
            module: JwtModule,
            providers: [
                {
                    provide: CONFIG_OPTIONS,
                    useValue: options
                },
                JwtService
            ],
            exports: [JwtService],
        }
    }
}
