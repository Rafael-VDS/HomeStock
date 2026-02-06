import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Vérifier si l'email existe déjà
    const existingUser = await this.prisma.user.findFirst({
      where: { mail: registerDto.mail },
    });

    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Créer l'utilisateur
    const user = await this.prisma.user.create({
      data: {
        firstname: registerDto.firstname,
        lastname: registerDto.lastname,
        mail: registerDto.mail,
        password: hashedPassword,
        picture: registerDto.picture || '/uploads/avatars/default_profil.png',
      },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });

    // Générer le token JWT
    const payload = { sub: user.id, email: user.mail };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600, // 1 heure
      user,
    };
  }

  async login(loginDto: LoginDto) {
    // Trouver l'utilisateur avec le password
    const user = await this.prisma.user.findFirst({
      where: { mail: loginDto.mail },
    });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    // Générer le token JWT
    const payload = { sub: user.id, email: user.mail };
    const access_token = this.jwtService.sign(payload);

    // Retourner sans le password
    const { password, ...userWithoutPassword } = user;

    return {
      access_token,
      token_type: 'Bearer',
      expires_in: 3600, // 1 heure
      user: userWithoutPassword,
    };
  }

  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        mail: true,
        picture: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }

    return user;
  }

  async getProfile(userId: number) {
    return this.validateUser(userId);
  }
}
