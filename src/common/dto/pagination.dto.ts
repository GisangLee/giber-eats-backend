import { CoreOutput } from 'src/common/dto/output.dto';
import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";

@InputType()
export class PaginationInput {
    @Field(type => Int, { defaultValue: 1 })
    page: number;
}

@ObjectType()
export class PaginationOutput extends CoreOutput {
    @Field(type => Number, { nullable: true })
    totalPages?: number;

}