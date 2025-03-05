import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import {
  EmailTemplateDTO,
  RegistrantFilterDTO,
  RegistrantRO,
  Role,
  UnsubscribeReasonDTO,
  UserRequest,
} from '@ehpr/common';
import { AuthGuard } from '../auth/auth.guard';
import { RegistrantService } from './registrant.service';
import { Roles } from 'src/common/decorators';
import { RoleGuard } from 'src/auth/role.guard';
import { AppLogger } from 'src/common/logger.service';

@Controller('registrants')
@ApiTags('Registrants')
export class RegistrantController {
  constructor(
    @Inject(RegistrantService) private readonly registrantService: RegistrantService,
    @Inject(Logger) private readonly logger: AppLogger,
    private readonly jwtService: JwtService,
  ) {}

  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Get('/')
  async getRegistrants(
    @Req() { user }: UserRequest,
    @Query() filter: RegistrantFilterDTO,
  ): Promise<[data: RegistrantRO[], count: number]> {
    const registrants = await this.registrantService.getRegistrants(
      filter,
      user?.ha_id,
      user?.email,
    );
    return registrants;
  }

  @Roles(Role.Admin, Role.User)
  @UseGuards(AuthGuard, RoleGuard)
  @Post('/send-mass-email')
  async sendMassEmail(@Req() { user }: UserRequest, @Body() payload: EmailTemplateDTO) {
    if (process.env.FEATURE_MASS_EMAIL === 'true') {
      await this.registrantService.sendMassEmail(payload, user!);
    }
  }

  @Post('/unsubscribe')
  async unsubscribe(
    @Query('token') token: string,
    @Body() payload: UnsubscribeReasonDTO,
    @Res() res: Response,
  ) {
    try {
      const decodedToken = this.jwtService.verify(token);
      await this.registrantService.unsubscribeRegistrant(decodedToken.id, payload);

      return res.status(200).send('Thank you! you are now unsubscribed from further emails');
    } catch (e) {
      this.logger.error(e);
      throw e;
    }
  }
}
