/* eslint-disable prettier/prettier */
// النيست فيها واحد يعني باختصار الفايل ده ملوش لازمه ده بس معمول عشان تفهم الفكره
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<any> {
    console.log('Before Route Handler');

    return next.handle().pipe(
      map((dataFromRouteHandler) => {
        const { password, ...otherData } = dataFromRouteHandler;
        return { ...otherData };
      }),
    );
  }
}
