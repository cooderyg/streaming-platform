import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch() // Catch 데코레이터
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: unknown) {
    // 통용적 error
    const error = {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '예외가 발생했습니다!!!',
    };

    // http 예외
    if (exception instanceof HttpException) {
      error.status = exception.getStatus(); // 예외코드
      error.message = exception.message; // 예외메세지
    }

    // Axios 예외
    // const status = exception.response.status;
    // const message = exception.response.data.message;

    console.log('======================');
    console.log('예외가 발생했습니다.');
    console.log('예외내용', error.message);
    console.log('예외코드', error.status);
    console.log('======================');
  }
}
