import { Repository } from 'typeorm';
import { MailService } from 'src/mail/mail.service';
import { JwtService } from './../jwt/jwt.service';
import { Verification } from './entities/verification.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';

const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
};

const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
};

const mockMailService = {
    sendVerification: jest.fn()
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("UserService", () => {

    let service: UsersService;
    let usersRepository: MockRepository;

    beforeAll(async () => {

        // create testing module
        const module = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockRepository
                },
                {
                    provide: getRepositoryToken(Verification),
                    useValue: mockRepository
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService
                },
                {
                    provide: MailService,
                    useValue: mockMailService
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        usersRepository = module.get(getRepositoryToken(User));
    });

    it("be defined", () => {
        expect(service).toBeDefined();
    });

    //TODO:
    describe("createAccount", () => {
        it("should fail it user exists", async () => {
            usersRepository.findOne.mockResolvedValue({
                id: 1,
                email: ""
            });

            const result = await service.createAccount({
                email: "",
                password: "",
                role: 0,
            });

            expect(result).toMatchObject({
                ok: false,
                error: "이미 존재하는 사용자입니다."
            });
        });
    });

    it.todo("login");
    it.todo("findById");
    it.todo("editProfile");
    it.todo("verifyEmail");
});