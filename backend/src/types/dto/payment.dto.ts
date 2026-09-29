import { PaymentStatus, PaymentMethod } from '../roles.enum';
import { PaginationParams } from '../index';


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

export interface PaymentDTO {
  id: string;
  registrationId?: string;
  y2cMemberId?: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  status: PaymentStatus;
  metadata?: Record<string, any>;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDTO {
  registrationId?: string;
  y2cMemberId?: string;
  amount: number;
  currency?: string;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  metadata?: Record<string, any>;
}

export interface UpdatePaymentDTO {
  status?: PaymentStatus;
  paymentReference?: string;
  metadata?: Record<string, any>;
  paidAt?: Date;
}

export interface PaymentFilterParams extends PaginationParams {
  search?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaymentListDTO {
  payments: PaymentDTO[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaymentStatsDTO {
  total: number;
  totalAmount: number;
  byStatus: {
    [key in PaymentStatus]?: {
      count: number;
      amount: number;
    };
  };
  byMethod: {
    [key in PaymentMethod]?: {
      count: number;
      amount: number;
    };
  };
  today: {
    count: number;
    amount: number;
  };
  thisMonth: {
    count: number;
    amount: number;
  };
  thisYear: {
    count: number;
    amount: number;
  };
}

export interface PaymentInitiateDTO {
  amount: number;
  paymentMethod: PaymentMethod;
  description: string;
  redirectUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerificationDTO {
  paymentReference: string;
  status: PaymentStatus;
  amount: number;
  transactionId?: string;
}