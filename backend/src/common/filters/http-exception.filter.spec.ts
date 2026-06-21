import { AllExceptionsFilter } from './http-exception.filter';
import { HttpException, HttpStatus, BadRequestException } from '@nestjs/common';

function mockArgumentsHost(jsonFn: jest.Mock) {
  return {
    switchToHttp: () => ({
      getResponse: () => ({
        status: jest.fn().mockReturnValue({ json: jsonFn }),
      }),
      getRequest: () => ({ url: '/test' }),
    }),
  } as any;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
  });

  it('should handle HttpException with string message', () => {
    const jsonFn = jest.fn();
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost(jsonFn));

    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      statusCode: 403,
      message: 'Forbidden',
      errors: undefined,
      timestamp: expect.any(String),
      path: '/test',
    });
  });

  it('should handle HttpException with object response (validation errors)', () => {
    const jsonFn = jest.fn();
    const errors = ['email must be valid', 'password too short'];
    const exception = new BadRequestException(errors);

    filter.catch(exception, mockArgumentsHost(jsonFn));

    expect(jsonFn).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      statusCode: 400,
      message: errors,
      errors: errors,
      path: '/test',
    }));
  });

  it('should handle non-HttpException errors as 500', () => {
    const jsonFn = jest.fn();
    const exception = new Error('Something went wrong');

    filter.catch(exception, mockArgumentsHost(jsonFn));

    expect(jsonFn).toHaveBeenCalledWith({
      success: false,
      statusCode: 500,
      message: 'Something went wrong',
      errors: undefined,
      timestamp: expect.any(String),
      path: '/test',
    });
  });
});
