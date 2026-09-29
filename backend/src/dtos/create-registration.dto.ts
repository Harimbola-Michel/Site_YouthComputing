import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
} from 'class-validator';
import { PaymentMethod, MobileMoneyOperator } from '../types/dto/payment.dto'; // définir ces énumérations
import { CreateRegistrationDTO } from '../types/dto/registration.dto';

// Si les énumérations ne sont pas encore définies, vous pouvez les placer ici :
export enum PaymentMethod {
  MOBILE_MONEY = 'mobile_money',
  BANK_TRANSFER = 'bank_transfer',
}

export enum MobileMoneyOperator {
  MVOLA = 'MVola',
  AIRTEL = 'Airtel Money',
  ORANGE = 'Orange Money',
  TELMA = 'Telma Money',
}

export class CreateRegistrationDto implements CreateRegistrationDTO {
  @IsString()
  @IsNotEmpty()
  formationId: string;

  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  motivation?: string;

  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;

  @IsEnum(MobileMoneyOperator)
  @IsOptional()
  mobileMoneyOperator?: MobileMoneyOperator;

  @IsString()
  @IsOptional()
  paymentReference?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  paymentAmount?: number;

  // notes n’est pas utilisé dans le frontend actuel, mais on peut l’ajouter
  @IsString()
  @IsOptional()
  notes?: string;
}