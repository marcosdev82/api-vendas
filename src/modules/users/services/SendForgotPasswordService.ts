import AppError from "@shared/errors/AppError";
import { getCustomRepository } from "typeorm";
import path from "path";
import UsersRepository from "../typeorm/repositories/UsersRepository";
import UserTokensRepository from "../typeorm/repositories/UserTokensRepository";
import EtherealMail from "@config/mail/EtherealMail";

interface IRequest {
  email: string;
}

class SendForgotPasswordService {
  public async execute({ email }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository);
    const userTokensRepository = getCustomRepository(UserTokensRepository);

    const user = await usersRepository.findByEmail(email);

    const forgotPasswordTemplate = path.resolve(__dirname, '..', 'view', 'forgot_password.hbs');

    if (!user) {
      throw new AppError('User does not exists.')
    }

    const  { token }  = await userTokensRepository.generate(user.id);

    await EtherealMail.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[API Vendas] Recuperação de senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: user.name,
          link: `${process.env.APP_WEB_URL}/reset_password?token=${token}`,
        }
      }
    })
  }
}

export default SendForgotPasswordService;
