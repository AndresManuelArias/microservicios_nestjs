import { Controller } from '@nestjs/common';
import { PaymentsServiceService } from './payments-service.service';

@Controller()
export class PaymentsServiceController {
  constructor(private readonly paymentsServiceService: PaymentsServiceService) {}
}
