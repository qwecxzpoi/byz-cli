import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { map, Observable } from "rxjs"
import { Response } from "express"

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const response = context.switchToHttp().getResponse<Response>()
    return next.handle().pipe(
      map(data => ({
        code: response.statusCode,
        data,
        err_msg: '',
        err_no: 0,
      }))
    )
    return next.handle()
  }
}
