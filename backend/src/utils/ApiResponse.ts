export interface ApiResponseData<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiResponse<T = any> {
  public readonly success: boolean;
  public readonly data: T;
  public readonly message?: string;
  public readonly pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor(
    data: T,
    message?: string,
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ) {
    this.success = true;
    this.data = data;
    this.message = message;
    this.pagination = pagination;
  }

  static success<T>(
    data: T,
    message?: string,
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    }
  ): ApiResponse<T> {
    return new ApiResponse(data, message, pagination);
  }

  static created<T>(data: T, message = 'Resource created successfully'): ApiResponse<T> {
    return new ApiResponse(data, message);
  }

  static updated<T>(data: T, message = 'Resource updated successfully'): ApiResponse<T> {
    return new ApiResponse(data, message);
  }

  static deleted<T>(data: T, message = 'Resource deleted successfully'): ApiResponse<T> {
    return new ApiResponse(data, message);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ): ApiResponse<T[]> {
    return new ApiResponse(
      data,
      message,
      {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  }
}